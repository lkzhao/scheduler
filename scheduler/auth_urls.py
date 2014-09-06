# a modified version of django-facebook's auth_url
# https://github.com/tschellenbach/Django-facebook/blob/master/django_facebook/auth_urls.py

try:
    from django.conf.urls import patterns, url
except ImportError:
    from django.conf.urls.defaults import patterns, url

from django.contrib.auth import views as auth_views
from django_facebook import registration_views
from django_facebook.utils import replication_safe
from app.views import customLogin
urlpatterns = patterns('',
  url(
    r'^login/$',customLogin,name='auth_login'
  ),
  url(r'^logout/$',replication_safe(auth_views.logout),{'template_name': 'registration/logout.haml','next_page': '/'},name='auth_logout'),
  url(r'^password/change/$',auth_views.password_change,name='password_change'),
  url(r'^password/change/done/$',auth_views.password_change_done,name='password_change_done'),
  url(r'^password/reset/$',auth_views.password_reset,name='password_reset'),
  url(r'^password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',auth_views.password_reset_confirm,name='password_reset_confirm'),
  url(r'^password/reset/complete/$',auth_views.password_reset_complete,name='password_reset_complete'),
  url(r'^password/reset/done/$',auth_views.password_reset_done,name='password_reset_done'),
  url(r'^register/$',registration_views.register, name='registration_register'),
)