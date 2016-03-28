from django.shortcuts import render

from rest_framework import viewsets
from rest_framework import filters
from rest_framework.response import Response

from .models import Likes
from .serializers import LikesSerializer


# REST framework
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

    def update(self, request, *args, **kwargs):
        try:  # In case of un-liking an existing like, or re-liking an old like.
            like = Likes.objects.get(id=request.data['id'])
        except Likes.DoesNotExist:
            like = Likes(owner=request.user, performer=request.data['performer'], image=request.data['image'])

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
