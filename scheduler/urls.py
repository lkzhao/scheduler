from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

from .views import IndexView

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'scheduler.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', IndexView.as_view(), name='index'),
    url(r'^admin/', include(admin.site.urls)),
)
