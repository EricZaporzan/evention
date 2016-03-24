# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime

from django.contrib.auth.models import AbstractUser
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _

from sorl.thumbnail import ImageField


# Extra functions, can be used by any of these models
def upload_to(instance, filename):
    return datetime.utcnow().strftime("%Y%m%d%H%M%S%f")[:-3] + "/" + filename


@python_2_unicode_compatible
class User(AbstractUser):

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = models.CharField(_("Name of User"), blank=True, max_length=255)
    picture = ImageField(_("Profile Picture"), upload_to=upload_to, blank=True)

    def __str__(self):
        if self.name != '':
            return self.name
        else:
            return self.username

    def get_absolute_url(self):
        return reverse('users:detail', kwargs={'username': self.username})
