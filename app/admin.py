from django.contrib import admin
from .models import Course,Subject

class CourseAdmin(admin.ModelAdmin):
    pass
admin.site.register(Course, CourseAdmin)
class SubjectAdmin(admin.ModelAdmin):
    pass
admin.site.register(Subject, SubjectAdmin)