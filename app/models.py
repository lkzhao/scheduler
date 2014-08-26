from django.db import models
from django.conf import settings
from datetime import datetime
from annoying.fields import (AutoOneToOneField, JSONField)

class Profile(models.Model):
  """
  stores User settings
  """
  user = AutoOneToOneField(settings.AUTH_USER_MODEL, primary_key=True)
  
  autosave = models.BooleanField(default=True)

  YEAR_CHOICES = tuple((n, str(n)) for n in range(datetime.now().year - 4, datetime.now().year + 4))
  TERM_CHOICES = (
    (0, 'Winter'),
    (1, 'Spring'),
    (2, 'Fall'),
  )
  startYear = models.IntegerField(default=datetime.now().year, choices=YEAR_CHOICES)
  startTerm = models.IntegerField(default=0, choices=TERM_CHOICES)

class CoursePlanManager(models.Manager):
  def get_random_subset(self, count):
    queryset = super(CoursePlanManager, self).get_queryset()
    total_count = queryset.count()
    if total_count>0:
      no_of_subsets= count*32768/total_count
      return queryset.filter( subset__lte=no_of_subsets )
    else:
      return queryset

class CoursePlan(models.Model):
  user = models.ForeignKey(settings.AUTH_USER_MODEL)

  name = models.CharField(max_length=1024, default="Course Schedule")

  created = models.DateTimeField(auto_now_add=True, null=True)
  last_modified = models.DateTimeField(auto_now=True, null=True)

  # user's term schedule in a json array
  # sample:
  #   [{courses:[]skiped:true}, {courses:[{subject:"CS",catalog_number:"115"}]skiped:false}]
  schedule = JSONField(default=[], null=True, blank=True)

  # user's shortList
  courseList = JSONField(default=[], null=True, blank=True)
  share = models.BooleanField(default=False)
  objects = CoursePlanManager()

  subset = models.IntegerField(default=0)

  def save(self):
    if self.id:
      self.subset = self.id % 32768
    return super(CoursePlan, self).save()

  
  def _course_count(self):
    return sum(map(lambda term:len(term['courses']), self.schedule))
  
  course_count = property(_course_count)




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
