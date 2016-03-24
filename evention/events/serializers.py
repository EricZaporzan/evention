from rest_framework import serializers

from .models import Likes


class LikesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Likes
        fields = ('owner', 'type', 'performer', 'since', 'image')
