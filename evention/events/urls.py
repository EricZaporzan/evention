from __future__ import absolute_import, unicode_literals

from django.conf.urls import url
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    url(r'^$', views.find_events, name="find_events"),
    url(r'discover-artists/$', views.find_bands, name="find_bands"),
    url(r'discover-sports/$', views.find_sports, name="find_sports"),
    url(r'cities/$', views.find_cities, name="find_cities")
]
