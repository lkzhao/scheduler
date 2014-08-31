tour = new Tour
  template:"""
    <div class='popover tour'>
      <div class='arrow'></div>
      <h3 class='popover-title'></h3>
      <div class='popover-content'></div>
    </div>
    """
  steps:[
    title: "Welcome"
    content: "If you are using this tool for the first time, we rememmand that you follow us through a simple tutorial that guide you to add your first course."
    template:"""
    <div class='popover tour'>
      <div class='arrow'></div>
      <h3 class='popover-title'></h3>
      <div class='popover-content'></div>
      <div class='popover-btns'>
        <div class='btn-group btn-group-justified'>
          <a class='btn btn-default' data-role='next'>Start</a>
          <a class='btn btn-default' data-role='end'>Cancel</a>
        </div>
      </div>
    </div>
    """
    orphan: yes
    backdrop: yes
  ,
    content: "let's start by adding a term by clicking this button"
    element: ".addTermBtn"
    placement: "bottom"
    onShow: -> # this function will trigger two time: bug with bootstrap-tour
      $(".addTermBtn").one "click", -> 
        $(".addTermBtn").off "click"
        tour.next()
  ,
    content: "Search for a course you would like to take"
    element: "#searchInput"
    placement: "bottom"
    container: ".navbar.navbar-default.navbar-fixed-top"
    onShow: ->
      current = tour.getCurrentStep()
      $(document).on "result.updated.uwcs", (e, state)->
        if state.searched and state.focus
          $(document).off "result.updated.uwcs"
          tour.goTo current + 2
        else if state.input isnt ""
          $(document).off "result.updated.uwcs"
          setTimeout ->
            tour.next()
          , 200
  ,
    content: "Select a subject / course"
    element: ".searchResult"
    placement: "bottom"
    container: ".navbar.navbar-default.navbar-fixed-top"
    animation: no
    onShow: ->
      current = tour.getCurrentStep()
      $(document).on "result.updated.uwcs", (e, state)->
        if state.input is "" or (not state.focus)
          tour.goTo current - 1
        else
          tour.goTo current
      $(document).one "result.searched.uwcs", ->
        setTimeout ->
          tour.next()
        , 200
    onHide: ->
      $(document).off "result.updated.uwcs"
      $(document).off "result.searched.uwcs"
  ,
    content: "Click here to add this course to the short-list"
    element: ".addToListBtn"
    placement: "bottom"
    container: ".navbar.navbar-default.navbar-fixed-top"
    onShow: ->
      current = tour.getCurrentStep()
      $(document).one "result.updated.uwcs", (e, state)->
        if state.input is "" or (not state.focus)
          tour.goTo current - 2
        else
          tour.goTo current - 1
      $(document).one "course.added.uwcs", -> tour.next()
    onHide: ->
      $(document).off "result.updated.uwcs"
      $(document).off "course.added.uwcs"
  ,
    content: "Course is added to this shortlist. Drag it out!"
    element: ".bucket"
    placement: "right"
    onShow: ->
      $(document).one "course.move.uwcs", -> tour.next()
  ,
    content: "Drop it here"
    element: ".term .course.moveBlock"
    placement: "bottom"
    onShow: ->
      $(document).one "course.movecanceled.uwcs", -> tour.prev()
      $(document).one "course.moved.uwcs", -> tour.next()
    onHide: ->
      $(document).off "course.movecanceled.uwcs"
      $(document).off "course.moved.uwcs"
  ,
    title: "Thats it!"
    content: "You can also drag course between terms.<br/>Swap the position by draging the first course on top of the second.<br/><br/>Have fun planing your courses.<br/>Remember to give us feedback."
    template:"""
    <div class='popover tour'>
      <div class='arrow'></div>
      <h3 class='popover-title'></h3>
      <div class='popover-content'></div>
      <div class='popover-btns'>
        <a class='btn btn-default btn-block' data-role='end'>OK</a>
      </div>
    </div>
    """
    orphan: yes
    backdrop: yes
    onShow: ->
      $(document).one "click", -> tour.next()
  ]

$(document).on "ready.uwcs", ->
  tour.init()
  tour.start()

  
