from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.utils.decorators import method_decorator, available_attrs

from django import forms
from django.shortcuts import get_object_or_404
from django.views.generic.edit import (CreateView, DeleteView, UpdateView,
                                       FormView)
from django.views.generic.base import View, TemplateView
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from annoying.decorators import ajax_request
from annoying.functions import get_object_or_None
from .models import Course,Subject,Profile,CoursePlan
import urllib2
import json

class ProtectedView(View):
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(ProtectedView, self).dispatch(*args, **kwargs)

def getCourseInfo(subjectName, catalog_number):
    subjectName = subjectName.upper()
    catalog_number = catalog_number.upper()
    course = get_object_or_None(
        Course, 
        subject__name=subjectName,
        catalog_number=catalog_number
        )
    if not course:
        return None

    course.course_data.update(course.course_data_override)
    course.course_data.update({"id":course.id})
    return course.course_data



def get_context(context, coursePlan):
    profile = coursePlan.user.profile
    context['coursePlanId'] = coursePlan.id
    try:
        courseInfo={}
        context['schedule'] = json.dumps(coursePlan.schedule)
        context['courseList'] = json.dumps(coursePlan.courseList)
        for course in coursePlan.courseList:
            courseData = getCourseInfo(
                            course['subject'],
                            course['catalog_number']
                            )
            courseInfo[course['subject']+course['catalog_number']] = courseData

        for term in coursePlan.schedule:
            for course in term['courses']:
                courseData = getCourseInfo(
                                course['subject'],
                                course['catalog_number']
                                )
                courseInfo[course['subject']+course['catalog_number']] = courseData
        context['courseInfo'] = json.dumps(courseInfo)
        context['startYear'] = profile.startYear
        context['startTerm'] = profile.startTerm
    except:
        context['errors'] = ['Could not parse saved data']
        context['courseInfo'] = json.dumps({})
        context['schedule'] = json.dumps([])
        context['courseList'] = json.dumps([])
        context['startYear'] = 2012
        context['startTerm'] = 0
    return context


class SearchCourseMixin(object):
    def get_allSubject(context):
        return json.dumps([{"name":s.name,"description":s.description,"courses":[{"catalog_number":c.catalog_number,"title":(c.course_data['title'] if 'title' in c.course_data else "")} for c in s.course_set.all().order_by("catalog_number")]} for s in Subject.objects.all()])

    def get_context_data(self, **kwargs):
        context = super(SearchCourseMixin, self).get_context_data(**kwargs)
        context['allSubjects'] = self.get_allSubject()
        return context

class IndexView(SearchCourseMixin, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context['sharedCoursePlan'] = CoursePlan.objects.get_random_subset(20).filter(share=True)
        if self.request.user.pk:
            context['sharedCoursePlan']=context['sharedCoursePlan'].exclude(user=self.request.user)
        context['form'] = AuthenticationForm()
        return context

class EditView(SearchCourseMixin, ProtectedView, DetailView):
    template_name = 'edit.html'
    model = CoursePlan
    slug_field = 'pk'

    def get_context_data(self, **kwargs):
        context = super(EditView, self).get_context_data(**kwargs)
        get_context(context, self.object)
        return context

class ShareView(SearchCourseMixin, DetailView):
    template_name = 'share.html'
    model = CoursePlan
    slug_field = 'pk'

    def get_context_data(self, **kwargs):
        context = super(ShareView, self).get_context_data(**kwargs)
        if self.object.user.first_name:
            context['username'] = self.object.user.first_name + self.object.user.last_name 
        else:
            context['username'] = self.object.user.username
        context['userid'] = self.object.user.id
        get_context(context, self.object)
        if not self.object.share:
            context['private'] = True
        return context


class CreateCoursePlanForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        return super(CreateCoursePlanForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super(CreateCoursePlanForm, self).save(commit=False)
        if not instance.id:
            instance.user = self.user
        if commit:
            instance.save()
        return instance

    class Meta:
        model = CoursePlan
        fields = ('name', 'share', )

class CreateCoursePlanView(ProtectedView, CreateView):
    template_name = 'create.html'
    model = CoursePlan
    form_class = CreateCoursePlanForm

    def get_success_url(self):
        return reverse('edit', args=(self.object.id,))

    def get_form_kwargs(self):
        kwargs = super(CreateView, self).get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        super(CreateCoursePlanView, self).form_valid(form)
        return HttpResponse(json.dumps({'success':True, 'url':self.get_success_url()}))

class DeleteCoursePlanView(ProtectedView, DeleteView):
    template_name = 'delete.html'
    model = CoursePlan
    slug_field = 'pk'
    success_url = "/"

    def form_valid(self, form):
        if self.object.user==self.request.user:
            return super(DeleteCoursePlanView, self).form_valid(form)
        else:
            self.form_invalid(form)

class ProfileView(ProtectedView, UpdateView):
    template_name = 'profile.html'
    model = Profile
    fields = ['autosave', 'startYear', 'startTerm']
    success_url = "/"

    def get_object(self):
        return self.request.user.profile

    def form_valid(self, form):
        super(ProfileView, self).form_valid(form)
        return HttpResponse(json.dumps({
            'startTerm':self.object.startTerm,
            'startYear':self.object.startYear,
            'autosave':self.object.autosave,
            }))

class ShareConfirmView(ProtectedView, UpdateView):
    template_name = 'share_confirm.html'
    model = CoursePlan
    fields = ['share']
    slug_field = 'pk'
    success_url = "/"

    def form_valid(self, form):
        super(ShareConfirmView, self).form_valid(form)
        return HttpResponse(json.dumps({'success':True}))

@ajax_request
@login_required
def Save(request, coursePlanId):
    if not request.POST:
        return {'success': False}
    coursePlan = get_object_or_404(CoursePlan, id=coursePlanId)
    if request.user != coursePlan.user:
        return {'success': False}
    for requiredField in ['schedule','courseList']:
        if requiredField not in request.POST:
            return {'success': False, 'error':"missing required fields"}

    schedule = request.POST['schedule']
    courseList = request.POST['courseList']
    coursePlan.schedule=schedule
    coursePlan.courseList=courseList
    coursePlan.save()
    return {'success':True}


@ajax_request
def CourseInfo(request, subjectName, catalog_number):
    return getCourseInfo(subjectName, catalog_number);

@ajax_request
def ListLookup(request, subjectName):
    subject = get_object_or_None(
        Subject,
        name=subjectName
        )
    if subject:
        courses = subject.course_set.all().order_by('catalog_number')
        return [{"catalog_number":c.catalog_number,"title":c.course_data['title']} for c in courses]
    else:
        return []


