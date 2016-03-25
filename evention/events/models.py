from __future__ import unicode_literals

from django.conf import settings
from django.db import models


# Create your models here.
class Likes(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    liked = models.BooleanField(default=True)
    performer = models.CharField(max_length=256)
    since = models.DateTimeField(auto_now=True)
    image = models.URLField(default="/static/images/noimage.png")
