from django import template

register = template.Library()

@register.filter_function
def label_with_class(field, classes):
  try:
    return field.label_tag(attrs={'class': classes})
  except AttributeError:
    return field

@register.filter_function
def add_class(field, classes):
  try:
    return field.as_widget(attrs={"class":classes})
  except AttributeError:
    return field