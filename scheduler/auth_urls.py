try:
    from django.conf.urls import patterns, url
except ImportError:
    from django.conf.urls.defaults import patterns, url

from django.contrib.auth import views as auth_views
from django_facebook import registration_views
from django_facebook.utils import replication_safe

urlpatterns = patterns('',
  url(
    r'^login/$',
    replication_safe(auth_views.login),
    {'template_name': 'registration/login.haml'},
    name='auth_login'
  ),
  url(r'^logout/$',replication_safe(auth_views.logout),{'template_name': 'registration/logout.haml'},name='auth_logout'),
  url(r'^password/change/$',auth_views.password_change,name='auth_password_change'),
  url(r'^password/change/done/$',auth_views.password_change_done,name='auth_password_change_done'),
  url(r'^password/reset/$',auth_views.password_reset,name='auth_password_reset'),
  url(r'^password/reset/confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$',auth_views.password_reset_confirm,name='auth_password_reset_confirm'),
  url(r'^password/reset/complete/$',auth_views.password_reset_complete,name='auth_password_reset_complete'),
  url(r'^password/reset/done/$',auth_views.password_reset_done,name='auth_password_reset_done'),
  url(r'^register/$',registration_views.register,name='registration_register'),
)