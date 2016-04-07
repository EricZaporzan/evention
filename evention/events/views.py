import random

from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from rest_framework import viewsets
from rest_framework import filters
from rest_framework.response import Response
from rest_framework.exceptions import APIException, PermissionDenied, NotFound

from .models import Event, Likes, Performer, HomepageMedia
from .serializers import EventSerializer, LikesSerializer, HomepageMediaSerializer


# Django views
@login_required()
def find_events(request):
    return render(request, "events/find_events.html", {})


@login_required()
def find_bands(request):
    return render(request, "events/find_bands.html", {})


@login_required()
def find_sports(request):
    return render(request, "events/find_sports.html", {})


# REST framework
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('performer', 'venue_name', 'city', 'country',
                     'latitude', 'longitude', 'start_time')

    def get_queryset(self):
        user = self.request.user
        user_likes = Likes.objects.filter(owner=user)
        performers = list()
        for like in user_likes:
            if like.liked:
                performers.append(like.performer)
        return Event.objects.filter(performer__in=performers)

    def create(self, request, *args, **kwargs):
        raise PermissionDenied("Creating and updating events is not yet supported through the API")

    def update(self, request, *args, **kwargs):
        raise PermissionDenied("Creating and updating events is not yet supported through the API")


class LikesViewSet(viewsets.ModelViewSet):
    queryset = Likes.objects.all()
    serializer_class = LikesSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('owner', 'liked', 'performer', 'since')

    def get_queryset(self):
        """
        This view should return a list of all the likes
        for the currently authenticated user.
        """
        user = self.request.user
        return Likes.objects.filter(owner=user)

    # Handles PUT requests.
    def update(self, request, *args, **kwargs):
        try:  # In case of un-liking an existing like, or re-liking an old like.
            like = Likes.objects.get(id=request.data['id'])

        except Likes.DoesNotExist:  # Else create a new like
            try:
                performer = Performer.objects.get(name=request.data['performer'])
            except Performer.DoesNotExist:
                performer = Performer(name=request.data['performer'], type='artist', image=request.data['image'])
                performer.save()

            like = Likes(owner=request.user, performer=performer)

        if like.owner != request.user:
            raise PermissionDenied("Adding likes for different users not supported.")

        print request.data['liked']
        if request.data['liked'] == 'true':
            like.liked = True
            response_string = 'Performer successfully liked'
        elif request.data['liked'] == 'false':
            like.liked = False
            response_string = 'Performer successfully unliked'
        else:
            response_string = 'Cannot like or unlike this performer. Make sure to set \'liked\' to either true or false'
        like.save()

        return Response({'status': response_string, 'id': like.id})


class HomepageMediaViewSet(viewsets.ModelViewSet):
    queryset = HomepageMedia.objects.all()
    serializer_class = HomepageMediaSerializer

    def get_queryset(self):
        try:
            return HomepageMedia.objects.order_by('?')
        except IndexError:
            raise NotFound("Sorry, there's not any media added yet.")
