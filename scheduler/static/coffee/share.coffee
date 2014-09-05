
div = -> React.DOM.div arguments...
h3 = -> React.DOM.h3 arguments...
small = -> React.DOM.small arguments...


SimpleTermView = React.createClass
  showPreview: (course)->
    window.showCoursePreview(course)
  hidePreview: ->
    window.hidePreview()
  render: ->
    terms = data.schedule.map (term, i)=>
      termName = calculateTerm data.startYear, data.startTerm, i
      currentTermCourses = term.courses.map (course, j)=>
        courseInfo = uwapi.getInfo(course)
        div({
          className: "course"
          onMouseEnter: @showPreview.bind @, course
          onMouseLeave: @hidePreview
          }, getCourseName(courseInfo))
      if term.courses.length == 0
        currentTermCourses = div(null, 
          div({className: "course moveBlock invisible"}),
          div({className: "backgroundText"}, "No course for this term."))
      div({className:"term"}, 
        div({className: "term-title"}, termName),
        div({className: "term-menu"}),
        div({className: "courses"}, currentTermCourses),
        div({className: "clearfix"}))
    div({className: "container"},
      h3({className: "page-header"}, data.name, " ",
        small(null, "by #{data.user.name}")),
      div({className: "col-xs-12 terms"}, terms))

$(->
  React.renderComponent SimpleTermView(null), $("#main").get(0)
)