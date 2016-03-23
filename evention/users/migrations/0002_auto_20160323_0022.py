# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-23 00:22
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models
import evention.users.models
import sorl.thumbnail.fields


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='picture',
            field=sorl.thumbnail.fields.ImageField(default=None, upload_to=evention.users.models.upload_to),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=30, unique=True, validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.')], verbose_name='username'),
        ),
    ]
