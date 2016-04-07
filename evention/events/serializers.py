from rest_framework import serializers

from .models import Event, Likes, Performer, HomepageMedia


class PerformerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Performer
        fields = ('id', 'name', 'type', 'description', 'image')


class LikesSerializer(serializers.ModelSerializer):
    performer = PerformerSerializer()

    class Meta:
        model = Likes
        fields = ('id', 'owner', 'liked', 'performer', 'since')


class EventSerializer(serializers.ModelSerializer):
    performer = PerformerSerializer()

    class Meta:
        model = Event
        fields = ('id', 'performer', 'venue_name', 'city',
                  'country', 'latitude', 'longitude', 'start_time')


class HomepageMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageMedia
        fields = ('band', 'song', 'embed_url')
