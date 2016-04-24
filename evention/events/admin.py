from django.contrib import admin

from .models import Event, IgnoredEvent, Likes, Performer, City, LikedCity, HomepageMedia


class EventAdmin(admin.ModelAdmin):
    list_display = ("performer", "city", "start_time")


class IgnoredEventAdmin(admin.ModelAdmin):
    list_display = ("owner", "event", "ignored")


class LikesAdmin(admin.ModelAdmin):
    list_display = ("owner", "liked", "performer", "since")


class PerformerAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "description")


class CityAdmin(admin.ModelAdmin):
    list_display = ("city", "region", "country")


class LikedCityAdmin(admin.ModelAdmin):
    list_display = ("owner", "city", "liked")


class HomepageMediaAdmin(admin.ModelAdmin):
    list_display = ("band", "song", "embed_url")


admin.site.register(Event, EventAdmin)
admin.site.register(IgnoredEvent, IgnoredEventAdmin)
admin.site.register(Likes, LikesAdmin)
admin.site.register(Performer, PerformerAdmin)
admin.site.register(City, CityAdmin)
admin.site.register(LikedCity, LikedCityAdmin)
admin.site.register(HomepageMedia, HomepageMediaAdmin)

