# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-29 04:05
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0003_auto_20160325_0212'),
    ]

    operations = [
        migrations.CreateModel(
            name='Performer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256, unique=True)),
                ('type', models.CharField(max_length=64)),
                ('description', models.TextField(blank=True)),
            ],
        ),
        migrations.AlterField(
            model_name='likes',
            name='performer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='events.Performer'),
        ),
    ]
