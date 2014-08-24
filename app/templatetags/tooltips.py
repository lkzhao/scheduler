from django import template


register = template.Library()
tooltip_template = template.loader.get_template('tooltip.haml')


class TooltipNode(template.Node):
    def __init__(self, nodelist=None):
        self.nodelist = nodelist

    def render(self, context):
        html = self.nodelist.render(context)
        tooltip_context = template.Context({'html': html})
        return tooltip_template.render(tooltip_context)


@register.tag(name='tooltip')
def tooltip(parser, token):
    nodelist = parser.parse(('endtooltip',))
    parser.delete_first_token()
    return TooltipNode(nodelist=nodelist)


@register.simple_tag(takes_context=True)
def inserttooltip(context, name):
    path = "tooltips/%(name)s.haml" % {'name': name}
    # TODO: check if path exists
    try:
        inner_template = template.loader.get_template(path)
    except template.TemplateDoesNotExist as e:
        print "EXCEPTION !!!"
        # XXX: exception being ignored. see DR about this.
        raise template.TemplateSyntaxError(str(e))

    output = inner_template.render(context)
    tooltip_context = template.Context({'html': output})
    return tooltip_template.render(tooltip_context)

@register.simple_tag(takes_context=True)
def inserttooltip_string(context, text):
    tooltip_context = template.Context({'html': text})
    return tooltip_template.render(tooltip_context)


