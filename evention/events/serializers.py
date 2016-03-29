from rest_framework import serializers

from .models import Likes


class LikesSerializer(serializers.ModelSerializer):
    performer = serializers.ReadOnlyField(source='performer__name')
    class Meta:
        model = Likes
        fields = ('id', 'owner', 'liked', 'performer', 'since', 'image')
