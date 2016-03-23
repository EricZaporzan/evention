from __future__ import unicode_literals

from django.conf import settings
from django.db import models


# Create your models here.
class Likes(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    type = models.CharField(max_length=32)  # could be 'artist', 'comedian', 'team', etc.
    performer = models.CharField(max_length=256)
    since = models.DateTimeField(auto_now_add=True)
