from django.shortcuts import render

from rest_framework import viewsets
from rest_framework import filters

from .models import Likes
from .serializers import LikesSerializer


# REST framework
class LikesViewSet(viewsets.ModelViewSet):
    queryset = Likes.objects.all()
    serializer_class = LikesSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('owner', 'type', 'performer', 'since')

    def get_queryset(self):
        """
        This view should return a list of all the purchases
        for the currently authenticated user.
        """
        user = self.request.user
        return Likes.objects.filter(owner=user)
