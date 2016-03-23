# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-23 00:23
from __future__ import unicode_literals

from django.db import migrations
import evention.users.models
import sorl.thumbnail.fields


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20160323_0022'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='picture',
            field=sorl.thumbnail.fields.ImageField(blank=True, null=True, upload_to=evention.users.models.upload_to),
        ),
    ]