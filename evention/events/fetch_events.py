import requests
import pytz

from django.conf import settings
from django.db import IntegrityError
from django.utils.dateparse import parse_datetime

from .models import Performer, Event


def fetch_all():
    all_performers = Performer.objects.all()

    for performer in all_performers:
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
                    print(pytz.timezone(result['olson_path']))
                    event = Event(eventful_id=result['id'],
                                  title=result['title'],
                                  performer=performer,
                                  venue_name=result['venue_name'],
                                  city=result['city_name'],
                                  country=result['country_name'],
                                  latitude=result['latitude'],
                                  longitude=result['longitude'],
                                  start_time=pytz.timezone(result['olson_path']).localize(
                                      parse_datetime(result['start_time'])))

                    # We'll try to create every new event, our uniqueness constraint on eventful_id prevents duplicates.
                    try:
                        event.save()
                        print(event)
                    except IntegrityError:
                        print("Already exists.")


def fetch(performer_name):
    pass
