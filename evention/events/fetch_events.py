import requests
import pytz

from django.conf import settings
from django.db import IntegrityError
from django.utils.dateparse import parse_datetime

from .models import Performer, Event


# This cycles through all the performers currently in the model and looks for new events. This should only be run
# every couple of days or so in low-traffic times since it can make for a ton of API calls.
def fetch_all():
    all_performers = Performer.objects.all()
    for performer in all_performers:
        fetch(performer)


# This fetches the new events of a single performer. This should be run when a new performer is added to the model.
def fetch(performer):
    name = performer.name
    category = ''
    if performer.type == 'artist':
        category = 'music'
    elif performer.type == 'team':
        category = 'sports'

    # Construct the url to call the API
    event_search_url = 'http://api.eventful.com/json/events/search/?app_key=' + \
                       settings.EVENTFUL_APPLICATION_KEY + '&category=' + category + \
                       '&keywords=' + requests.utils.quote(name) + \
                       '&date=Future&page_size=100&page_number=1'
    print(event_search_url)
    response = requests.get(event_search_url)
    response.encoding = 'utf-8'
    json_response = response.json()

    # Parse the results. We need to make sure that our performer is playing this event or
    # in the list of acts at this event.
    if int(json_response['total_items']) > 0:
        for result in json_response['events']['event']:
            use_event = False
            if result['performers'] is not None:
                # This might be a list, if there are multiple performers, or it might be a dict.
                if type(result['performers']['performer']) is list:
                    for event_performer in result['performers']['performer']:
                        if event_performer['name'].lower() == name.lower():
                            use_event = True
                            break
                elif result['performers']['performer']['name'].lower() == name.lower():
                    use_event = True
            if use_event:
                if result['olson_path'] is not None:
                    start_time = pytz.timezone(result['olson_path']).localize(
                                         parse_datetime(result['start_time']))
                else:
                    start_time = parse_datetime(result['start_time'])


                try:
                    event = Event.objects.get(eventful_id=result['id'])
                    if event.modified < pytz.timezone('UTC').localize(parse_datetime(result['modified'])):
                        event.eventful_id = result['id']
                        event.title = result['title']
                        event.performer = performer
                        event.venue_name = result['venue_name']
                        event.city = result['city_name']
                        event.country = result['country_name']
                        event.latitude = result['latitude']
                        event.longitude = result['longitude']
                        event.start_time = start_time

                        event.save()
                        print(event)
                    else:
                        print("Event already exists and is up to date.")
                except Event.DoesNotExist:
                    event = Event(eventful_id=result['id'],
                                  title=result['title'],
                                  performer=performer,
                                  venue_name=result['venue_name'],
                                  city=result['city_name'],
                                  country=result['country_name'],
                                  latitude=result['latitude'],
                                  longitude=result['longitude'],
                                  start_time=start_time)

                    event.save()
                    print(event)
