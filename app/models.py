from django.db import models
from django.conf import settings

from annoying.fields import (AutoOneToOneField, JSONField)

class Profile(models.Model):
  """
  stores User settings
  """
  user = AutoOneToOneField(settings.AUTH_USER_MODEL, primary_key=True)
  
  autosave = models.BooleanField(default=True)

  startYear = models.IntegerField(default=2012)
  startTerm = models.IntegerField(default=0)



class CoursePlanManager(models.Manager):
  def get_random_subset(self, count):
    queryset = super(CoursePlanManager, self).get_queryset()
    total_count = queryset.count()
    no_of_subsets= count*32768/total_count
    return queryset.filter( subset__lte=no_of_subsets )

class CoursePlan(models.Model):
  user = models.ForeignKey(settings.AUTH_USER_MODEL)

  # user's term schedule in a json array
  # sample:
  #   [{courses:[]skiped:true}, {courses:[{subject:"CS",catalog_number:"115"}]skiped:false}]
  schedule = JSONField(default=[], null=True, blank=True)

  # user's shortList
  courseList = JSONField(default=[], null=True, blank=True)
  share = models.BooleanField(default=False)
  objects = CoursePlanManager()

  subset = models.IntegerField(default=0)

  def save(self, *args, **kwargs):
    self.subset = self.id % 32768
    return super(CoursePlan, self).save(*args, **kwargs)




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
