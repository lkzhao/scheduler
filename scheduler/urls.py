
import auth_urls

from django.conf.urls import patterns, include, url
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import admin
from django.conf.urls.static import static
admin.autodiscover()

from app.views import (IndexView, SchedulerListView, EditView, ShareView, ShareConfirmView, CreateCoursePlanView, ProfileView, DeleteCoursePlanView, CourseInfo, ListLookup, Save)

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'scheduler.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', IndexView.as_view(), name='index'),
    url(r'^list/$', SchedulerListView.as_view(), name='list'),
    url(r'^profile/$', ProfileView.as_view(), name='profile'),
    url(r'^create/$', CreateCoursePlanView.as_view(), name='create'),
    url(r'^delete/(?P<slug>[-_\w]+)/$', DeleteCoursePlanView.as_view(), name='delete'),
    url(r'^edit/(?P<slug>[-_\w]+)/$', EditView.as_view(), name='edit'),
    url(r'^view/(?P<slug>[-_\w]+)/$', ShareView.as_view(), name='view'),
    url(r'^share/(?P<slug>[-_\w]+)/$', ShareConfirmView.as_view(), name='shareconfirm'),

    url(r'^course/(?P<subjectName>\w+)/(?P<catalog_number>\w+)/$', CourseInfo),
    url(r'^lookup/(?P<subjectName>\w+)/$', ListLookup),
    url(r'^save/(?P<coursePlanId>\d+)/$', Save),
    url(r'^facebook/', include('django_facebook.urls')),
    
	url(r'^accounts/', include(auth_urls)),
    url(r'^admin/', include(admin.site.urls)),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)