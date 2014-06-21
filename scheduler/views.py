
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.utils.decorators import method_decorator, available_attrs

from django.views.generic.edit import (CreateView, DeleteView, UpdateView,
                                       FormView)
from django.views.generic.base import TemplateView, View
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView

class IndexView(TemplateView):
    template_name = 'index.html'