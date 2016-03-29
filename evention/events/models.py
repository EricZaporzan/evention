from __future__ import unicode_literals

from django.conf import settings
from django.db import models


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
