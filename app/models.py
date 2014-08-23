from django.db import models
from django.conf import settings

from annoying.fields import (AutoOneToOneField, JSONField)

class Profile(models.Model):
  user = AutoOneToOneField(settings.AUTH_USER_MODEL, primary_key=True)
  
  # user's term schedule in a json array
  # sample:
  #   [{courses:[]skiped:true}, {courses:[{subject:"CS",catalog_number:"115"}]skiped:false}]
  schedule = JSONField(default=[], null=True, blank=True)

  # user's selected course that are not added to schedule
  courseList = JSONField(default=[], null=True, blank=True)
  autosave = models.BooleanField(default=True)
  share = models.BooleanField(default=False)

  startYear = models.IntegerField(default=2012)
  startTerm = models.IntegerField(default=0)


class Subject(models.Model):
  name = models.CharField(max_length=10, primary_key=True)
  description = models.TextField(null=True, blank=True)
  lastUpdate = models.DateTimeField(auto_now=True)

  def __unicode__(self):
    return self.name

# Create your models here.
class Course(models.Model):
  subject = models.ForeignKey(Subject)
  catalog_number = models.CharField(max_length=10)
  course_data = JSONField(default={}, null=True, blank=True)
  course_data_override = JSONField(default={}, null=True, blank=True)
  lastUpdate = models.DateTimeField(auto_now=True)

  def __unicode__(self):
    return str(self.subject)+self.catalog_number

  class Meta:
    unique_together = ("subject", "catalog_number")
