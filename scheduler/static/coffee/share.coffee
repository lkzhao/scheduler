# @codekit-prepend "helper.coffee";


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
          onMouseEnter: @showPreview.bind @, courseInfo
          onMouseLeave: @hidePreview
          }, name(courseInfo))
      div({className:"panel panel-default"}, 
        div({className: "panel-heading"}, 
          h3({className: "panel-title"}, termName)),
        div({className: "panel-body"}, currentTermCourses))
    div({className: "paper"},
      h2({className: "page-header"}, "#{data.user.name}'s Course Schedule"),
      terms)

$(->
  React.renderComponent SimpleTermView(null), $("#main").get(0)
)