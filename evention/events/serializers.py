from rest_framework import serializers

from .models import Likes, Performer


class PerformerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Performer
        fields = ('id', 'name', 'type', 'description', 'image')


class LikesSerializer(serializers.ModelSerializer):
    performer = PerformerSerializer()

    class Meta:
        model = Likes
        fields = ('id', 'owner', 'liked', 'performer', 'since')
