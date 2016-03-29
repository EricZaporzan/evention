from django.contrib import admin

from .models import Likes, Performer


class LikesAdmin(admin.ModelAdmin):
    list_display = ("owner", "liked", "performer", "since")


class PerformerAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "description")

admin.site.register(Likes, LikesAdmin)
admin.site.register(Performer, PerformerAdmin)
