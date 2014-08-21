from django.core.management.base import BaseCommand, CommandError

import urllib2
import json
import sys

from django.conf import settings
from app.models import Course,Subject


class Command(BaseCommand):
  help = 'Refresh db with course data from UWapi'

  def getJSON(self, url):
    url = "https://api.uwaterloo.ca/v2/"+url+".json?key="+settings.UWAPI_KEY
    try:
      req = urllib2.Request(url, None, {'Content-Type': 'application/json'})
      f = urllib2.urlopen(req)
      response = f.read()
      f.close()
      data = json.loads(response)
    except:
      raise CommandError("Error loading:"+url)
    return data['data']

  def getCourseData(self, course):
    subject = course.subject.name
    catalog_number = course.catalog_number 
    try:
      data = self.getJSON("courses/"+subject+"/"+catalog_number)
      prereq = self.getJSON("courses/"+subject+"/"+catalog_number+"/prerequisites")
      data.update(prereq)
      if 'terms_offered' not in data or not data['terms_offered']:
          data['terms_offered'] = ['W','S','F']
      data['name'] = data['subject']+data['catalog_number']
    except:
      raise CommandError("\nError loading data for "+subject+catalog_number)
    course.course_data=data
  def write(self, log, ending=None):
    if ending != None:
      self.stdout.write(log, ending=ending)
      sys.stdout.flush()
    else:
      self.stdout.write(log)

  def handle(self, *args, **options):
    self.write("Getting list of all subjects")
    subjects = self.getJSON("codes/subjects")
    get = False
    for subjectData in subjects:
      if subjectData['subject'].upper()=="REC":
        get=True
      if not get: continue
      subject, created = Subject.objects.get_or_create(
        name = subjectData['subject'].upper()
        )
      subject.description=subjectData['description']
      subject.save()
      self.write("Updating "+subject.name, ending="")
      courses = self.getJSON("courses/"+subject.name)
      for courseData in courses:
        course, created = Course.objects.get_or_create(
          subject = subject,
          catalog_number = courseData['catalog_number'].upper()
          )
        self.getCourseData(course)
        course.save()
        self.write(".", ending="")
      self.write(" ")