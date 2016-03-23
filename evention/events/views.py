from django.shortcuts import render

from rest_framework import viewsets

from .models import Likes
from .serializers import LikesSerializer


# REST framework
class LikesViewSet(viewsets.ModelViewSet):
    queryset = Likes.objects.all()
    serializer_class = LikesSerializer

