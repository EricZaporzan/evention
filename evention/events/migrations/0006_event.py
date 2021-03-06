# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-01 04:00
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0005_auto_20160329_0413'),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('venue_name', models.CharField(max_length=1024)),
                ('city', models.CharField(max_length=256)),
                ('country', models.CharField(max_length=256)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('start_time', models.DateTimeField()),
                ('performer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='events.Performer')),
            ],
        ),
    ]
