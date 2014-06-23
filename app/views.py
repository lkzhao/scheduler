from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator, available_attrs

from django.views.generic.edit import (CreateView, DeleteView, UpdateView,
                                       FormView)
from django.views.generic.base import View, TemplateView
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from annoying.decorators import ajax_request
from annoying.functions import get_object_or_None
from .models import Course
import urllib2
import json

class ProtectedView(View):
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(ProtectedView, self).dispatch(*args, **kwargs)

class IndexView(ProtectedView, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context['schedule'] = json.dumps(self.request.user.profile.schedule)
        courseInfo={}
        try:
            for term in self.request.user.profile.schedule:
                for course in term['courses']:
                    courseData = getCourseInfo(
                                    course['subject'],
                                    course['catalog_number']
                                    )
                    courseInfo[course['subject']+course['catalog_number']] = courseData
            context['courseInfo'] = json.dumps(courseInfo)
        except:
            context['errors'] = ['Could not parse saved data']
            context['courseInfo'] = json.dumps({})
            context['schedule'] = json.dumps([])
        return context


@ajax_request
@login_required
def Save(request):
    if not request.POST or "schedule" not in request.POST:
        return {'success': False}

    schedule = request.POST['schedule']
    request.user.profile.schedule=schedule
    request.user.profile.save()
    return {'success':True}

def getJSON(url):
    url = "https://api.uwaterloo.ca/v2/"+url+".json?key="+settings.UWAPI_KEY
    req = urllib2.Request(url, None, {'Content-Type': 'application/json'})
    f = urllib2.urlopen(req)
    response = f.read()
    f.close()
    data = json.loads(response)
    return data['data']


def getCourseInfo(subject, catalog_number):
    subject = subject.upper()
    catalog_number = catalog_number.upper()
    def getCourseData():
        data = getJSON("courses/"+subject+"/"+catalog_number)
        prereq = getJSON("courses/"+subject+"/"+catalog_number+"/prerequisites")
        data.update(prereq)
        if 'terms_offered' not in data or not data['terms_offered']:
            data['terms_offered'] = ['W','S','F']
        data['name'] = data['subject']+data['catalog_number']
        return data
    course = get_object_or_None(
        Course, 
        subject=subject,
        catalog_number=catalog_number
        )
    if not course:
        try:
            data = getCourseData()
        except ValueError:
            return None
        course = Course(
                    subject=subject,
                    catalog_number=catalog_number,
                    course_data=data
                    )
        course.save()

    return course.course_data

@ajax_request
def CourseInfo(request, subject, catalog_number):
    return getCourseInfo(subject, catalog_number);
