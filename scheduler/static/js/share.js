
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNoYXJlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2hhcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblNpbXBsZVRlcm1WaWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3NcbiAgc2hvd1ByZXZpZXc6IChjb3Vyc2UpLT5cbiAgICB3aW5kb3cuc2hvd0NvdXJzZVByZXZpZXcoY291cnNlKVxuICBoaWRlUHJldmlldzogLT5cbiAgICB3aW5kb3cuaGlkZVByZXZpZXcoKVxuICByZW5kZXI6IC0+XG4gICAgdGVybXMgPSBkYXRhLnNjaGVkdWxlLm1hcCAodGVybSwgaSk9PlxuICAgICAgdGVybU5hbWUgPSBjYWxjdWxhdGVUZXJtIGRhdGEuc3RhcnRZZWFyLCBkYXRhLnN0YXJ0VGVybSwgaVxuICAgICAgY3VycmVudFRlcm1Db3Vyc2VzID0gdGVybS5jb3Vyc2VzLm1hcCAoY291cnNlLCBqKT0+XG4gICAgICAgIGNvdXJzZUluZm8gPSB1d2FwaS5nZXRJbmZvKGNvdXJzZSlcbiAgICAgICAgZGl2KHtcbiAgICAgICAgICBjbGFzc05hbWU6IFwiY291cnNlXCJcbiAgICAgICAgICBvbk1vdXNlRW50ZXI6IEBzaG93UHJldmlldy5iaW5kIEAsIGNvdXJzZVxuICAgICAgICAgIG9uTW91c2VMZWF2ZTogQGhpZGVQcmV2aWV3XG4gICAgICAgICAgfSwgbmFtZShjb3Vyc2VJbmZvKSlcbiAgICAgIGRpdih7Y2xhc3NOYW1lOlwicGFuZWwgcGFuZWwtZGVmYXVsdFwifSwgXG4gICAgICAgIGRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWhlYWRpbmdcIn0sIFxuICAgICAgICAgIGgzKHtjbGFzc05hbWU6IFwicGFuZWwtdGl0bGVcIn0sIHRlcm1OYW1lKSksXG4gICAgICAgIGRpdih7Y2xhc3NOYW1lOiBcInBhbmVsLWJvZHlcIn0sIGN1cnJlbnRUZXJtQ291cnNlcykpXG4gICAgZGl2KHtjbGFzc05hbWU6IFwicGFwZXJcIn0sXG4gICAgICBoMih7Y2xhc3NOYW1lOiBcInBhZ2UtaGVhZGVyXCJ9LCBcIiN7ZGF0YS51c2VyLm5hbWV9J3MgQ291cnNlIFNjaGVkdWxlXCIpLFxuICAgICAgdGVybXMpXG5cbiQoLT5cbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50IFNpbXBsZVRlcm1WaWV3KG51bGwpLCAkKFwiI21haW5cIikuZ2V0KDApXG4pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9