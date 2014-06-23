from django.db import models
from django.conf import settings

from annoying.fields import (AutoOneToOneField, JSONField)

class Profile(models.Model):
	user = AutoOneToOneField(settings.AUTH_USER_MODEL, primary_key=True)
	
	# user's term schedule in a json array
	# sample:
	# 	[{courses:[]skiped:true}, {courses:[{subject:"CS",catalog_number:"115"}]skiped:false}]
	schedule = JSONField(default=[], null=True, blank=True)

# Create your models here.
class Course(models.Model):
    subject = models.CharField(max_length=10)
    catalog_number = models.CharField(max_length=10)
    course_data = JSONField(default={}, null=True, blank=True)