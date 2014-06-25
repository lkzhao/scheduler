from __future__ import print_function
import urllib2
import json

from django.conf import settings
from .models import Course,Subject

def getJSON(url):
  url = "https://api.uwaterloo.ca/v2/"+url+".json?key="+settings.UWAPI_KEY
  try:
    req = urllib2.Request(url, None, {'Content-Type': 'application/json'})
    f = urllib2.urlopen(req)
    response = f.read()
    f.close()
    data = json.loads(response)
  except:
    print("Error loading:"+url)
  return data['data']


def getCourseData(course):
  subject = course.subject.name
  catalog_number = course.catalog_number 
  try:
    data = getJSON("courses/"+subject+"/"+catalog_number)
    prereq = getJSON("courses/"+subject+"/"+catalog_number+"/prerequisites")
    data.update(prereq)
    if 'terms_offered' not in data or not data['terms_offered']:
        data['terms_offered'] = ['W','S','F']
    data['name'] = data['subject']+data['catalog_number']
  except:
    print("\nError loading data for "+subject+catalog_number)
  course.course_data=data


def refreshDB():
  print("Getting list of all subejcts")
  subjects = getJSON("codes/subjects")
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
    print("Updating "+subject.name, end="")
    courses = getJSON("courses/"+subject.name)
    for courseData in courses:
      course, created = Course.objects.get_or_create(
        subject = subject,
        catalog_number = courseData['catalog_number'].upper()
        )
      getCourseData(course)
      course.save()
      print(".", end="")
    print(" ")