# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-10 08:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0007_homepagemedia'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='homepagemedia',
            options={'verbose_name_plural': 'homepage media'},
        ),
        migrations.AlterModelOptions(
            name='likes',
            options={'verbose_name_plural': 'likes'},
        ),
        migrations.AddField(
            model_name='event',
            name='eventful_id',
            field=models.CharField(default='', max_length=64, unique=True),
            preserve_default=False,
        ),
    ]