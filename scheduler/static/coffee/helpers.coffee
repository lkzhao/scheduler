a = -> React.DOM.a arguments...
bold = -> React.DOM.b arguments...
button = -> React.DOM.button arguments...
div = -> React.DOM.div arguments...
h1 = -> React.DOM.h1 arguments...
h2 = -> React.DOM.h2 arguments...
h3 = -> React.DOM.h3 arguments...
h4 = -> React.DOM.h4 arguments...
h5 = -> React.DOM.h5 arguments...
h6 = -> React.DOM.h6 arguments...
icon = -> React.DOM.i arguments...
input = -> React.DOM.input arguments...
p = -> React.DOM.p arguments...
span = -> React.DOM.span arguments...
table = -> React.DOM.table arguments...
tbody = -> React.DOM.tbody arguments...
td = -> React.DOM.td arguments...
th = -> React.DOM.th arguments...
thead = -> React.DOM.thead arguments...
tr = -> React.DOM.tr arguments...
strong = -> React.DOM.strong arguments...

window.facebookConnect = ->
  F.connect $('#facebookForm').get(0)
  false

window.uwapi = 
  courseInfo: window.data.courseInfo||{},
  getCourse: (subject, catalog_number, callback)->
    course = {}
    that = this
    $.getJSON("/course/"+subject+"/"+catalog_number, (course)->
        if not course
          callback(null)
        console.log course
        if course.prerequisites&&course.prerequisites.substr(0,7)=="Prereq:"
          course.prerequisites=course.prerequisites.substr(8)
        course.name=getCourseName(course)
        that.courseInfo[course.name]=course
        callback(course.name)
    ).fail(-> callback(null))
  getInfo: (course)->
    @courseInfo[getCourseName(course)]

window.getCourseName = (obj) -> 
  obj.subject + obj.catalog_number

window.calculateTerm = (startYear, startTerm, i) ->
  startYear = startYear + Math.floor((startTerm + i) / 3)
  startTerm = (startTerm + i) % 3
  switch startTerm
    when 0 then startYear + " Winter"
    when 1 then startYear + " Spring"
    when 2 then startYear + " Fall"

window.getTermNameArray = (terms_offered) ->
  terms_offered.map (i) ->
    switch i
      when "F" then "Fall"
      when "W" then "Winter"
      else "Spring"


window.EditLabel = React.createClass
  getInitialState: ->
    loading:no
    text:@props.initialValue
  handleChange: (e) ->
    @setState text: e.target.value
  endEdit: (e) ->
    @setState
      loading: yes
    $.ajax
      url:"/save/"+data.coursePlanId+"/"
      type:"post"
      dataType:"json"
      data:
        name:@state.text,
        csrfmiddlewaretoken:data.csrf_token
      success:(json)=>
        if(json.success)
          @setState loading:no
        else
          alert("Failed to save")
      error:()=>
        alert("Failed to save")
  render: ->
    inputProp =
      ref: "input"
      className:"form-control editlabel"
      value:@state.text
      onChange:@handleChange
      onBlur:@endEdit
    if @state.loading
      inputProp.disabled = yes
    input(inputProp)


Preview = React.createClass
  getInitialState: ->
    top:0
    left:0
    html:""
    show:no
  componentDidMount: () ->
    $(window).on 'mousemove', @handleMouseMove
    window.showPreview = @showPreview
    window.showCoursePreview = @showCoursePreview
    window.hidePreview = @hidePreview
  componentWillUnmount: () ->
    $(window).off 'mousemove', @handleMouseMove
  handleMouseMove:(e)->
    if @state.show
      @setState
        top:e.clientY+20
        left:e.clientX+15
  showCoursePreview: (course)=>
    course = uwapi.getInfo course
    html = 
      div(null,
        h3(null,
          strong(null, course.name),
          " - ",
          course.title),
        p(null, course.description)
        p(null,
          strong(null, "Antireq: "),
          course.antirequisite||"none"),
        p(null,
          strong(null, "Prereq: "),
          course.prerequisites||"none"),
        p(null,
          strong(null, "Terms offered: "),
          getTermNameArray(course.terms_offered).join(", ")))
    @showPreview html
  showPreview: (data) ->
    @setState 
      html:data
      show:yes
  hidePreview: ->
    @setState show:no
  render: ->
    div({
      className: "preview "+(if @state.show then " show" else "")
      style:
        top:@state.top
        left:@state.left
      }, @state.html)

$(->
  $('body').append $("<div id='preview'></div>")
  React.renderComponent Preview(null), $("#preview").get(0)
)

