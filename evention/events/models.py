from __future__ import unicode_literals

from django.conf import settings
from django.db import models


class Event(models.Model):
    performer = models.ForeignKey('Performer')
    venue_name = models.CharField(max_length=1024)
    city = models.CharField(max_length=256)
    country = models.CharField(max_length=256)
    latitude = models.FloatField()
    longitude = models.FloatField()
    start_time = models.DateTimeField()

    def __str__(self):
        return self.performer.name + " is in " + self.city + " on " + str(self.start_time)


class Likes(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    liked = models.BooleanField(default=True)
    performer = models.ForeignKey('Performer')
    since = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.owner.username + " likes " + self.performer.name


class Performer(models.Model):
    name = models.CharField(max_length=256, unique=True)
    type = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    image = models.URLField(default="/static/images/noimage.png")

    def __str__(self):
        return self.name
