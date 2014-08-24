from django import template
from django.forms import CheckboxInput, CheckboxSelectMultiple

register = template.Library()

form_group_template = template.loader.get_template('input/form_group.haml')
form_group_horizontal_template = template.loader.get_template('input/form_group_horizontal.haml')
checkbox_template = template.loader.get_template('input/checkbox.haml')
checkbox_horizontal_template = template.loader.get_template('input/checkbox_horizontal.haml')


def isCheckBox(formInput):
  if isinstance(formInput, CheckboxInput): return true;
  try:
    return isinstance(formInput.field.widget,CheckboxInput) or isinstance(formInput.field.widget,CheckboxSelectMultiple)
  except AttributeError:
    return False

@register.simple_tag
def form_group(formInput, **kwargs):
  label = kwargs.pop('label',None)
  bold = kwargs.pop('bold', True)
  try:
    required = kwargs.pop('required', formInput.field.required)
  except AttributeError:
    required = kwargs.pop('required', False)
  tooltip_template = kwargs.pop('tooltip_template',None)
  tooltip_string = kwargs.pop('tooltip_string',None)
  context = template.Context({
    'input': formInput,
    'label': label,
    'bold': bold,
    'required': required,
    'tooltip': tooltip_template,
    'tooltip_string': tooltip_string,
    })

  if isCheckBox(formInput):
    return checkbox_template.render(context)
  else:
    return form_group_template.render(context)

@register.simple_tag
def form_group_horizontal(formInput, **kwargs):
  label = kwargs.pop('label',None)
  bold = kwargs.pop('bold', True)
  try:
    required = kwargs.pop('required', formInput.field.required)
  except AttributeError:
    required = kwargs.pop('required', False)
  tooltip_template = kwargs.pop('tooltip_template',None)
  tooltip_string = kwargs.pop('tooltip_string',None)
  context = template.Context({
    'input': formInput,
    'label': label,
    'bold': bold,
    'required': required,
    'tooltip': tooltip_template,
    'tooltip_string': tooltip_string,
    })

  if isCheckBox(formInput):
    return checkbox_horizontal_template.render(context)
  else:
    return form_group_horizontal_template.render(context)
