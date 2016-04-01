from django.contrib import admin

from .models import Event, Likes, Performer


class EventAdmin(admin.ModelAdmin):
    list_display = ("performer", "city", "start_time")


class LikesAdmin(admin.ModelAdmin):
    list_display = ("owner", "liked", "performer", "since")


class PerformerAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "description")

admin.site.register(Event, EventAdmin)
admin.site.register(Likes, LikesAdmin)
admin.site.register(Performer, PerformerAdmin)
