"""
Django settings for scheduler project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

try:
    # UWAPI INFO
    UWAPI_KEY = os.environ['UWAPI_KEY']
    # FACEBOOK INFO
    FACEBOOK_APP_ID = os.environ['FACEBOOK_APP_ID']
    FACEBOOK_APP_SECRET = os.environ['FACEBOOK_APP_SECRET']
    # Amazon s3 INFO
    AWS_ACCESS_KEY_ID = os.environ['AWS_ACCESS_KEY_ID']
    AWS_SECRET_ACCESS_KEY = os.environ['AWS_SECRET_ACCESS_KEY']
    AWS_STORAGE_BUCKET_NAME = os.environ['S3_BUCKET_NAME']

    # SECURITY WARNING: keep the secret key used in production secret!
    SECRET_KEY = os.environ['SECRET_KEY']

    EMAIL_HOST = 'smtp.mandrillapp.com'
    EMAIL_PORT = '587'
    DEFAULT_FROM_EMAIL = 'admin@uwscheduler.com'
    EMAIL_HOST_USER = os.environ['MANDRILL_USERNAME']
    EMAIL_HOST_PASSWORD = os.environ['MANDRILL_APIKEY']
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
except Exception, e:
    print e


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []

AUTH_USER_MODEL = 'django_facebook.FacebookCustomUser'

TEMPLATE_LOADERS = (
    'djaml.loaders.DjamlFilesystemLoader',
    'djaml.loaders.DjamlAppDirectoriesLoader',
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)
TEMPLATE_DIRS = (       
    os.path.join(BASE_DIR, 'templates'),
)
TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.request",
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    'django_facebook.context_processors.facebook',
)

AUTHENTICATION_BACKENDS = (
    'django_facebook.auth_backends.FacebookBackend',
    'django.contrib.auth.backends.ModelBackend',
)


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'south',
    'django_facebook',
    'annoying',
    'app',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'scheduler.urls'

WSGI_APPLICATION = 'scheduler.wsgi.application'



# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'America/Toronto'

USE_I18N = True

USE_L10N = True





DATABASES = {
    'default': {}
}
import dj_database_url
DATABASES['default'] =  dj_database_url.config(default=os.environ['DATABASE_URL'])

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Allow all host headers
ALLOWED_HOSTS = ['*']

STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/
STATIC_URL = '/static/'
MEDIA_URL = 'http://' + AWS_STORAGE_BUCKET_NAME + '.s3.amazonaws.com/media/'
ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_ROOT = 'static'
MEDIA_ROOT = "media"
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)



LOGIN_REDIRECT_URL = "/"
# django facebook settings
FACEBOOK_LOGIN_DEFAULT_REDIRECT = "/"
FACEBOOK_STORE_FRIENDS = True
FACEBOOK_REGISTRATION_TEMPLATE = "registration/register.haml"
