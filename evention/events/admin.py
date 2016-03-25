from django.contrib import admin

from .models import Likes


class LikesAdmin(admin.ModelAdmin):
    list_display = ("owner", "liked", "performer", "since")

admin.site.register(Likes, LikesAdmin)
