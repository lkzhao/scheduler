from django.db import models

# Create your models here.
class Course(models.Model):
    subject = models.CharField(max_length=10)
    catalog_number = models.CharField(max_length=10)
    title = models.TextField()
    description = models.TextField()