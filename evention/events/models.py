from __future__ import unicode_literals

import threading
import requests
import pytz
from django.conf import settings
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.utils.dateparse import parse_datetime


class Event(models.Model):
    eventful_id = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=1024)
    performer = models.ForeignKey('Performer')
    venue_name = models.CharField(max_length=1024)
    city = models.CharField(max_length=256)
    country = models.CharField(max_length=256)
    latitude = models.FloatField()
    longitude = models.FloatField()
    start_time = models.DateTimeField()
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.performer.name + " in " + self.city + " on " + str(self.start_time)


class IgnoredEvent(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    ignored = models.BooleanField(default=True)
    event = models.ForeignKey('Event')
    since = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.ignored:
            return self.owner.username + " is not interested in \"" + self.event.title + "\""
        else:
            return self.owner.username + " is interested in \"" + self.event.title + "\""


class Likes(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    liked = models.BooleanField(default=True)
    performer = models.ForeignKey('Performer')
    since = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "likes"

    def __str__(self):
        return self.owner.username + " likes " + self.performer.name


class Performer(models.Model):
    name = models.CharField(max_length=256, unique=True)
    type = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    image = models.URLField(default="/static/images/noimage.png")

    # Overriding the save method to start a new thread and fetch the events for the newly added artist.
    def save(self, *args, **kwargs):
        super(Performer, self).save(*args, **kwargs)
        FetchEventsThread(self.name).start()

    def __str__(self):
        return self.name


class City(models.Model):
    code = models.CharField(max_length=64, unique=True)
    city = models.CharField(max_length=256)
    region = models.CharField(max_length=256, blank=True)  # i.e. province or territory, many countries don't have these
    country = models.CharField(max_length=256)
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        verbose_name_plural = 'cities'

    def __str__(self):
        return self.city


class LikedCity(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    liked = models.BooleanField(default=True)
    city = models.ForeignKey('City')
    since = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'liked cities'

    def __str__(self):
        if self.liked:
            return self.owner.username + " is interested in \"" + self.city.city + "\""
        else:
            return self.owner.username + " is not interested in \"" + self.city.city + "\""


# Model for displaying videos on the homepage
class HomepageMedia(models.Model):
    band = models.CharField(max_length=256)
    song = models.CharField(max_length=256)
    embed_url = models.URLField(blank=False)

    class Meta:
        verbose_name_plural = "homepage media"

    def __str__(self):
        return self.band + " - " + self.song


class FetchEventsThread(threading.Thread):
    def __init__(self, performer_name, **kwargs):
        self.performer_name = performer_name
        super(FetchEventsThread, self).__init__(**kwargs)

    def run(self):
        fetch(self.performer_name)


# This cycles through all the performers currently in the model and looks for new events. This should only be run
# every couple of days or so in low-traffic times since it can make for a ton of API calls.
def fetch_all():
    all_performers = Performer.objects.all()
    for performer in all_performers:
        fetch(performer.name)


# This fetches the new events of a single performer. This should be run when a new performer is added to the model.
def fetch(performer_name):
    performer = Performer.objects.get(name__iexact=performer_name)
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
        if type(json_response['events']['event']) is list:
            response_list = json_response['events']['event']
        else:
            response_list = [json_response['events']['event'],]

        for result in response_list:
            use_event = False
            if result['performers'] is not None:
                # This might be a list, if there are multiple performers, or it might be a dict, if there's only one.
                if type(result['performers']['performer']) is list:
                    for event_performer in result['performers']['performer']:
                        if event_performer['name'].lower() == name.lower():
                            use_event = True
                            break
                elif result['performers']['performer']['name'].lower() == name.lower():
                    use_event = True
            # The use_event flag is True only if the relevant performer is actually a part of the event.
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
