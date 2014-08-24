(function() {
  var Preview, a, bold, button, div, h1, h2, h3, h4, h5, h6, icon, input, p, span, strong, table, tbody, td, th, thead, tr;

  a = function() {
    var _ref;
    return (_ref = React.DOM).a.apply(_ref, arguments);
  };

  bold = function() {
    var _ref;
    return (_ref = React.DOM).b.apply(_ref, arguments);
  };

  button = function() {
    var _ref;
    return (_ref = React.DOM).button.apply(_ref, arguments);
  };

  div = function() {
    var _ref;
    return (_ref = React.DOM).div.apply(_ref, arguments);
  };

  h1 = function() {
    var _ref;
    return (_ref = React.DOM).h1.apply(_ref, arguments);
  };

  h2 = function() {
    var _ref;
    return (_ref = React.DOM).h2.apply(_ref, arguments);
  };

  h3 = function() {
    var _ref;
    return (_ref = React.DOM).h3.apply(_ref, arguments);
  };

  h4 = function() {
    var _ref;
    return (_ref = React.DOM).h4.apply(_ref, arguments);
  };

  h5 = function() {
    var _ref;
    return (_ref = React.DOM).h5.apply(_ref, arguments);
  };

  h6 = function() {
    var _ref;
    return (_ref = React.DOM).h6.apply(_ref, arguments);
  };

  icon = function() {
    var _ref;
    return (_ref = React.DOM).i.apply(_ref, arguments);
  };

  input = function() {
    var _ref;
    return (_ref = React.DOM).input.apply(_ref, arguments);
  };

  p = function() {
    var _ref;
    return (_ref = React.DOM).p.apply(_ref, arguments);
  };

  span = function() {
    var _ref;
    return (_ref = React.DOM).span.apply(_ref, arguments);
  };

  table = function() {
    var _ref;
    return (_ref = React.DOM).table.apply(_ref, arguments);
  };

  tbody = function() {
    var _ref;
    return (_ref = React.DOM).tbody.apply(_ref, arguments);
  };

  td = function() {
    var _ref;
    return (_ref = React.DOM).td.apply(_ref, arguments);
  };

  th = function() {
    var _ref;
    return (_ref = React.DOM).th.apply(_ref, arguments);
  };

  thead = function() {
    var _ref;
    return (_ref = React.DOM).thead.apply(_ref, arguments);
  };

  tr = function() {
    var _ref;
    return (_ref = React.DOM).tr.apply(_ref, arguments);
  };

  strong = function() {
    var _ref;
    return (_ref = React.DOM).strong.apply(_ref, arguments);
  };

  window.uwapi = {
    courseInfo: window.data.courseInfo || {},
    getCourse: function(subject, catalog_number, callback) {
      var course, that;
      course = {};
      that = this;
      return $.getJSON("/course/" + subject + "/" + catalog_number, function(course) {
        if (!course) {
          callback(null);
        }
        console.log(course);
        if (course.prerequisites && course.prerequisites.substr(0, 7) === "Prereq:") {
          course.prerequisites = course.prerequisites.substr(8);
        }
        course.name = getCourseName(course);
        that.courseInfo[course.name] = course;
        return callback(course.name);
      }).fail(function() {
        return callback(null);
      });
    },
    getInfo: function(course) {
      return this.courseInfo[getCourseName(course)];
    }
  };

  window.getCourseName = function(obj) {
    return obj.subject + obj.catalog_number;
  };

  window.calculateTerm = function(startYear, startTerm, i) {
    startYear = startYear + Math.floor((startTerm + i) / 3);
    startTerm = (startTerm + i) % 3;
    switch (startTerm) {
      case 0:
        return startYear + " Winter";
      case 1:
        return startYear + " Spring";
      case 2:
        return startYear + " Fall";
    }
  };

  window.getTermNameArray = function(terms_offered) {
    return terms_offered.map(function(i) {
      switch (i) {
        case "F":
          return "Fall";
        case "W":
          return "Winter";
        default:
          return "Spring";
      }
    });
  };

  Preview = React.createClass({
    getInitialState: function() {
      return {
        top: 0,
        left: 0,
        html: "",
        show: false
      };
    },
    componentDidMount: function() {
      $(window).on('mousemove', this.handleMouseMove);
      window.showPreview = this.showPreview;
      window.showCoursePreview = this.showCoursePreview;
      return window.hidePreview = this.hidePreview;
    },
    componentWillUnmount: function() {
      return $(window).off('mousemove', this.handleMouseMove);
    },
    handleMouseMove: function(e) {
      if (this.state.show) {
        return this.setState({
          top: e.clientY + 20,
          left: e.clientX + 15
        });
      }
    },
    showCoursePreview: (function(_this) {
      return function(course) {
        var html;
        course = uwapi.getInfo(course);
        html = div(null, h3(null, strong(null, course.name), " - ", course.title), p(null, course.description), p(null, strong(null, "Antireq: "), course.antirequisite || "none"), p(null, strong(null, "Prereq: "), course.prerequisites || "none"), p(null, strong(null, "Terms offered: "), getTermNameArray(course.terms_offered).join(", ")));
        return _this.showPreview(html);
      };
    })(this),
    showPreview: function(data) {
      return this.setState({
        html: data,
        show: true
      });
    },
    hidePreview: function() {
      return this.setState({
        show: false
      });
    },
    render: function() {
      return div({
        className: "preview " + (this.state.show ? " show" : ""),
        style: {
          top: this.state.top,
          left: this.state.left
        }
      }, this.state.html);
    }
  });

  $(function() {
    $('body').append($("<div id='preview'></div>"));
    return React.renderComponent(Preview(null), $("#preview").get(0));
  });

}).call(this);


/** @jsx React.DOM */

AddCourseModal=React.createClass({displayName: 'AddCourseModal',
  getInitialState: function() {
    return {input:"",focus:false,loading:false,searched:false,subject:"",catalog_number:"",message:"",dataList:[],dataListSelected:0, dataListType:"None"};
  },
  componentDidMount:function(){
    $("body").on('mousedown', this.handleBlur);
    $(".navbar-form").on('mousedown', this.blockClick);
    $(".deleteBtn").tooltip({container:'.navbar'})
  },
  componentWillUnmount: function() {
    $("body").off('mousedown', this.handleBlur);
    $(".navbar-form").on('mousedown', this.blockClick);
  },
  handleSubmit:function(e){
    if(e) e.preventDefault();
    var that=this;
    if(this.state.dataList.length>0){
      var selected = this.state.dataList[this.state.dataListSelected]
      if(this.state.dataListType=="Subject"){
        this.setState({dataList:selected.courses, dataListSelected:0, input:selected.name,subject:selected.name, dataListType:"Course", message:""})
        return;
      }else if(this.state.dataListType=="Course"){
        that.setState({loading:true,catalog_number:selected.catalog_number,input:this.state.subject+selected.catalog_number});
        uwapi.getCourse(this.state.subject,selected.catalog_number,function(course){
          if(course){
            that.setState({loading:false,searched:true,message:"",dataListType:"None",dataList:""});
          }else{
            that.setState({loading:false,searched:true,dataListType:"None",dataList:"",message:"Error loading course info"});
          }
        })
      }
    }else if(this.state.searched&&this.state.message==""&&data&&data.courseList){
      this.setState({searched:false,input:"",subject:"",catalog_number:""})
      this.handleAddCourse(e);
      return;
    }
    return false;
  },
  handleChange:function(e){
    var inputValue=e.target.value.toUpperCase();
    subject=inputValue.match(/^\D+/);
    catalog_number=subject?inputValue.substr(subject[0].length):"";
    subject=(subject)?subject[0].replace(/ /g,''):"";
    catalog_number=catalog_number.replace(/ /g,'');
    var state = {
      focus:true,
      input:inputValue,
      subject:subject,
      catalog_number:catalog_number,
      searched:false,
      message:""
    }
    if(subject!=""){
      var matchedSubjects = allSubjects.filter(function(subjectData){
        return subjectData.name.lastIndexOf(subject, 0) === 0
      })
      if(matchedSubjects.length>0&&matchedSubjects[0].name==subject&&catalog_number!=""){
        state.dataList=matchedSubjects[0].courses.filter(function(courseData){
          return courseData.catalog_number.lastIndexOf(catalog_number, 0) === 0
        })
        state.dataListType="Course"
      }else{
        state.dataList=matchedSubjects
        state.dataListType="Subject"
      }
    }else{
      state.dataListType="None"
    }
    if(this.state.input!=inputValue){
      state.dataListSelected=0
    }
    this.setState(state,function(){
      $('.searchResult .container').scrollTop(0)
    });

  },
  handleBlur:function(e){
    this.setState({focus:false})
  },
  handleFocus:function(e){
    this.setState({focus:true})
  },
  handleAddCourse:function(e){
    var course = {
      subject:this.state.subject,
      catalog_number:this.state.catalog_number
    }
    if(data&&data.courseList){
      if(hasCourse(course)){
        alert("Course already added")
      }else{
        data.courseList.push(course)
        $(document).trigger("dataUpdated")
        $("#searchInput").focus()
      }
    }
  },
  blockClick:function(e){
    e.stopPropagation();
  },
  drop:function(e){
    var courseName = e.dataTransfer.getData("text/course")
    for (var termIndex = -1; termIndex < data.schedule.length; termIndex++) {
      var term = getTermList(termIndex)
      for (var courseIndex = 0; courseIndex < term.length; courseIndex++) {
        if(name(term[courseIndex])==courseName){
          term.splice(courseIndex,1);
          return;
        }
      };
    };
  },
  dragOver:function(e){
    e.preventDefault();
  },
  handleKeydown:function(e){
    scrolled = false
    if(e.keyCode==40){//down
      if(this.state.dataListSelected<this.state.dataList.length-1)
        this.setState({dataListSelected:this.state.dataListSelected+1},function(){
          $('.searchResult .container').scrollTop(($(".suggestion.active").index()-5)*28)
        })
      e.preventDefault()
    }else if(e.keyCode==38){//up
      if(this.state.dataListSelected>0)
        this.setState({dataListSelected:this.state.dataListSelected-1},function(){
          $('.searchResult .container').scrollTop(($(".suggestion.active").index()-5)*28)
        })
      e.preventDefault()
    }
  },
  handleClick:function(indexSelected){
    var that=this;
    this.setState({dataListSelected:indexSelected},function(){
      $("#searchInput").focus()
      that.handleSubmit()
    })
  },
  render: function() {
    var cName = "searchResult"+(this.state.focus?"":" hideUp")
    var that = this;
    if(this.state.message!=""){
      var content=(
              React.DOM.div({className: "container"}, 
                this.state.message
              ))
    }else if(this.state.searched){
      var course=uwapi.getInfo({subject:this.state.subject,
        catalog_number:this.state.catalog_number});
      var content=(
              React.DOM.div({className: "container"}, 
                React.DOM.h3(null, React.DOM.a({target: "_blank", href: course.url}, course.subject+" "+course.catalog_number+" - "+course.title)), 
                React.DOM.p(null, course.description), 
                React.DOM.div(null, React.DOM.strong(null, "Antireq: "), course.antirequisite||"none"), 
                React.DOM.div(null, React.DOM.strong(null, "Prereq: "), course.prerequisites||"none"), 
                React.DOM.div(null, React.DOM.strong(null, "Terms offered: "), getTermNameArray(course.terms_offered).join(", ")), 
                React.DOM.div({className: "pull-right col-xs-12 col-md-6"}, 
                  ($("#admin-btn").length)?React.DOM.div({className: "col-xs-4"}, React.DOM.a({className: "btn btn-default btn-block", href: "/admin/app/course/"+course.id}, "Edit")):{}, 
                  (data&&data.courseList)?React.DOM.div({className: "col-xs-8"}, React.DOM.button({className: "btn btn-primary btn-block"}, "Add to list")):{}
                )
              )
              )
    }else{
      //show suggestion
      if(this.state.dataListType=="Subject"){
        var dataList = this.state.dataList
        var subjectEls = dataList.map(function(subject,i){
          return(
            React.DOM.div({className: "suggestion"+(that.state.dataListSelected==i?" active":""), onClick: that.handleClick.bind(that,i)}, 
              React.DOM.strong(null, subject.name), " - ", subject.description
            )
            )
        })
        var content=(
          React.DOM.div({className: "container"}, 
            subjectEls.length>0?subjectEls:(
              "Subject not found "+that.state.subject
              )
          )
          )
      }else if(this.state.dataListType=="Course"){
        var dataList = this.state.dataList
        var courseEls = dataList.map(function(course,i){
          return(
            React.DOM.div({className: "suggestion"+(that.state.dataListSelected==i?" active":""), onClick: that.handleClick.bind(that,i)}, 
              React.DOM.strong(null, that.state.subject+course.catalog_number), " - ", course.title
            )
            )
        })
        var content=(
          React.DOM.div({className: "container"}, 
            courseEls.length>0?courseEls:(
              "Course not found: "+that.state.subject+" "+that.state.catalog_number
              )
          )
          )
      }else{
        var content=(
          React.DOM.div({className: "container"}, 
            "Enter Course Code: i.e ", React.DOM.strong(null, "CS241"), ", ", React.DOM.strong(null, "ENGL109"), ", ..."
          )
        )
      }
    }

    return(
      React.DOM.form({className: "navbar-form navbar-left", onSubmit: this.handleSubmit}, 
        React.DOM.div({className: "form-group"}, 
          React.DOM.input({id: "searchInput", type: "text", placeholder: "Search for Course", className: 'form-control'+(this.state.focus?" focused":""), value: this.state.input, onChange: this.handleChange, onFocus: this.handleFocus, ref: "searchInput", onKeyDown: this.handleKeydown}), 
          React.DOM.i({className: "fa fa-spin fa-spinner searchIndicator "+(this.state.loading?"":"hide")})
        ), 
        (data&&data.courseList)?React.DOM.div({className: "form-group deleteBtn", 'data-toggle': "tooltip", title: "Drag course here to delete", 'data-placement': "bottom", ref: "deleteBtn", onDrop: this.drop, onDragOver: this.dragOver}, 
          React.DOM.i({className: "pe-7s-trash fa-fw"})
        ):{}, 
        React.DOM.div({className: cName}, 
          content
        )
      )
    );
  }
})



$(function(){
  React.renderComponent(
    AddCourseModal(null),
    $("#searchBtnWrapper").get(0)
  );
})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvaGVscGVycy5jb2ZmZWUiLCJzZWFyY2hJbnB1dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0hBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsQ0FBVixhQUFZLFNBQVosRUFBSDtFQUFBLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxDQUFWLGFBQVksU0FBWixFQUFIO0VBQUEsQ0FEUCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLE1BQVYsYUFBaUIsU0FBakIsRUFBSDtFQUFBLENBRlQsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxHQUFWLGFBQWMsU0FBZCxFQUFIO0VBQUEsQ0FITixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLEVBQVYsYUFBYSxTQUFiLEVBQUg7RUFBQSxDQUpMLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQUssU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsRUFBVixhQUFhLFNBQWIsRUFBSDtFQUFBLENBTEwsQ0FBQTs7QUFBQSxFQU1BLEVBQUEsR0FBSyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxFQUFWLGFBQWEs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USxDQTVEVixDQUFBOztBQUFBLEVBK0dBLENBQUEsQ0FBRSxTQUFBLEdBQUE7QUFDQSxJQUFBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQWlCLENBQUEsQ0FBRSwwQkFBRixDQUFqQixDQUFBLENBQUE7V0FDQSxLQUFLLENBQUMsZUFBTixDQUFzQixPQUFBLENBQVEsSUFBUixDQUF0QixFQUFxQyxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsR0FBZCxDQUFrQixDQUFsQixDQUFyQyxFQUZBO0VBQUEsQ0FBRixDQS9HQSxDQUFBO0FBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJhc2ljLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYSA9IC0+IFJlYWN0LkRPTS5hIGFyZ3VtZW50cy4uLlxuYm9sZCA9IC0+IFJlYWN0LkRPTS5iIGFyZ3VtZW50cy4uLlxuYnV0dG9uID0gLT4gUmVhY3QuRE9NLmJ1dHRvbiBhcmd1bWVudHMuLi5cbmRpdiA9IC0+IFJlYWN0LkRPTS5kaXYgYXJndW1lbnRzLi4uXG5oMSA9IC0+IFJlYWN0LkRPTS5oMSBhcmd1bWVudHMuLi5cbmgyID0gLT4gUmVhY3QuRE9NLmgyIGFyZ3VtZW50cy4uLlxuaDMgPSAtPiBSZWFjdC5ET00uaDMgYXJndW1lbnRzLi4uXG5oNCA9IC0+IFJlYWN0LkRPTS5oNCBhcmd1bWVudHMuLi5cbmg1ID0gLT4gUmVhY3QuRE9NLmg1IGFyZ3VtZW50cy4uLlxuaDYgPSAtPiBSZWFjdC5ET00uaDYgYXJndW1lbnRzLi4uXG5pY29uID0gLT4gUmVhY3QuRE9NLmkgYXJndW1lbnRzLi4uXG5pbnB1dCA9IC0+IFJlYWN0LkRPTS5pbnB1dCBhcmd1bWVudHMuLi5cbnAgPSAtPiBSZWFjdC5ET00ucCBhcmd1bWVudHMuLi5cbnNwYW4gPSAtPiBSZWFjdC5ET00uc3BhbiBhcmd1bWVudHMuLi5cbnRhYmxlID0gLT4gUmVhY3QuRE9NLnRhYmxlIGFyZ3VtZW50cy4uLlxudGJvZHkgPSAtPiBSZWFjdC5ET00udGJvZHkgYXJndW1lbnRzLi4uXG50ZCA9IC0+IFJlYWN0LkRPTS50ZCBhcmd1bWVudHMuLi5cbnRoID0gLT4gUmVhY3QuRE9NLnRoIGFyZ3VtZW50cy4uLlxudGhlYWQgPSAtPiBSZWFjdC5ET00udGhlYWQgYXJndW1lbnRzLi4uXG50ciA9IC0+IFJlYWN0LkRPTS50ciBhcmd1bWVudHMuLi5cbnN0cm9uZyA9IC0+IFJlYWN0LkRPTS5zdHJvbmcgYXJndW1lbnRzLi4uXG5cblxuXG53aW5kb3cudXdhcGkgPSBcbiAgY291cnNlSW5mbzogd2luZG93LmRhdGEuY291cnNlSW5mb3x8e30sXG4gIGdldENvdXJzZTogKHN1YmplY3QsIGNhdGFsb2dfbnVtYmVyLCBjYWxsYmFjayktPlxuICAgIGNvdXJzZSA9IHt9XG4gICAgdGhhdCA9IHRoaXNcbiAgICAkLmdldEpTT04oXCIvY291cnNlL1wiK3N1YmplY3QrXCIvXCIrY2F0YWxvZ19udW1iZXIsIChjb3Vyc2UpLT5cbiAgICAgICAgaWYgbm90IGNvdXJzZVxuICAgICAgICAgIGNhbGxiYWNrKG51bGwpXG4gICAgICAgIGNvbnNvbGUubG9nIGNvdXJzZVxuICAgICAgICBpZiBjb3Vyc2UucHJlcmVxdWlzaXRlcyYmY291cnNlLnByZXJlcXVpc2l0ZXMuc3Vic3RyKDAsNyk9PVwiUHJlcmVxOlwiXG4gICAgICAgICAgY291cnNlLnByZXJlcXVpc2l0ZXM9Y291cnNlLnByZXJlcXVpc2l0ZXMuc3Vic3RyKDgpXG4gICAgICAgIGNvdXJzZS5uYW1lPWdldENvdXJzZU5hbWUoY291cnNlKVxuICAgICAgICB0aGF0LmNvdXJzZUluZm9bY291cnNlLm5hbWVdPWNvdXJzZVxuICAgICAgICBjYWxsYmFjayhjb3Vyc2UubmFtZSlcbiAgICApLmZhaWwoLT4gY2FsbGJhY2sobnVsbCkpXG4gIGdldEluZm86IChjb3Vyc2UpLT5cbiAgICBAY291cnNlSW5mb1tnZXRDb3Vyc2VOYW1lKGNvdXJzZSldXG5cbndpbmRvdy5nZXRDb3Vyc2VOYW1lID0gKG9iaikgLT4gXG4gIG9iai5zdWJqZWN0ICsgb2JqLmNhdGFsb2dfbnVtYmVyXG5cbndpbmRvdy5jYWxjdWxhdGVUZXJtID0gKHN0YXJ0WWVhciwgc3RhcnRUZXJtLCBpKSAtPlxuICBzdGFydFllYXIgPSBzdGFydFllYXIgKyBNYXRoLmZsb29yKChzdGFydFRlcm0gKyBpKSAvIDMpXG4gIHN0YXJ0VGVybSA9IChzdGFydFRlcm0gKyBpKSAlIDNcbiAgc3dpdGNoIHN0YXJ0VGVybVxuICAgIHdoZW4gMCB0aGVuIHN0YXJ0WWVhciArIFwiIFdpbnRlclwiXG4gICAgd2hlbiAxIHRoZW4gc3RhcnRZZWFyICsgXCIgU3ByaW5nXCJcbiAgICB3aGVuIDIgdGhlbiBzdGFydFllYXIgKyBcIiBGYWxsXCJcblxud2luZG93LmdldFRlcm1OYW1lQXJyYXkgPSAodGVybXNfb2ZmZXJlZCkgLT5cbiAgdGVybXNfb2ZmZXJlZC5tYXAgKGkpIC0+XG4gICAgc3dpdGNoIGlcbiAgICAgIHdoZW4gXCJGXCIgdGhlbiBcIkZhbGxcIlxuICAgICAgd2hlbiBcIldcIiB0aGVuIFwiV2ludGVyXCJcbiAgICAgIGVsc2UgXCJTcHJpbmdcIlxuXG5QcmV2aWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3NcbiAgZ2V0SW5pdGlhbFN0YXRlOiAtPlxuICAgIHRvcDowXG4gICAgbGVmdDowXG4gICAgaHRtbDpcIlwiXG4gICAgc2hvdzpub1xuICBjb21wb25lbnREaWRNb3VudDogKCkgLT5cbiAgICAkKHdpbmRvdykub24gJ21vdXNlbW92ZScsIEBoYW5kbGVNb3VzZU1vdmVcbiAgICB3aW5kb3cuc2hvd1ByZXZpZXcgPSBAc2hvd1ByZXZpZXdcbiAgICB3aW5kb3cuc2hvd0NvdXJzZVByZXZpZXcgPSBAc2hvd0NvdXJzZVByZXZpZXdcbiAgICB3aW5kb3cuaGlkZVByZXZpZXcgPSBAaGlkZVByZXZpZXdcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6ICgpIC0+XG4gICAgJCh3aW5kb3cpLm9mZiAnbW91c2Vtb3ZlJywgQGhhbmRsZU1vdXNlTW92ZVxuICBoYW5kbGVNb3VzZU1vdmU6KGUpLT5cbiAgICBpZiBAc3RhdGUuc2hvd1xuICAgICAgQHNldFN0YXRlXG4gICAgICAgIHRvcDplLmNsaWVudFkrMjBcbiAgICAgICAgbGVmdDplLmNsaWVudFgrMTVcbiAgc2hvd0NvdXJzZVByZXZpZXc6IChjb3Vyc2UpPT5cbiAgICBjb3Vyc2UgPSB1d2FwaS5nZXRJbmZvIGNvdXJzZVxuICAgIGh0bWwgPSBcbiAgICAgIGRpdihudWxsLFxuICAgICAgICBoMyhudWxsLFxuICAgICAgICAgIHN0cm9uZyhudWxsLCBjb3Vyc2UubmFtZSksXG4gICAgICAgICAgXCIgLSBcIixcbiAgICAgICAgICBjb3Vyc2UudGl0bGUpLFxuICAgICAgICBwKG51bGwsIGNvdXJzZS5kZXNjcmlwdGlvbilcbiAgICAgICAgcChudWxsLFxuICAgICAgICAgIHN0cm9uZyhudWxsLCBcIkFudGlyZXE6IFwiKSxcbiAgICAgICAgICBjb3Vyc2UuYW50aXJlcXVpc2l0ZXx8XCJub25lXCIpLFxuICAgICAgICBwKG51bGwsXG4gICAgICAgICAgc3Ryb25nKG51bGwsIFwiUHJlcmVxOiBcIiksXG4gICAgICAgICAgY291cnNlLnByZXJlcXVpc2l0ZXN8fFwibm9uZVwiKSxcbiAgICAgICAgcChudWxsLFxuICAgICAgICAgIHN0cm9uZyhudWxsLCBcIlRlcm1zIG9mZmVyZWQ6IFwiKSxcbiAgICAgICAgICBnZXRUZXJtTmFtZUFycmF5KGNvdXJzZS50ZXJtc19vZmZlcmVkKS5qb2luKFwiLCBcIikpKVxuICAgIEBzaG93UHJldmlldyBodG1sXG4gIHNob3dQcmV2aWV3OiAoZGF0YSkgLT5cbiAgICBAc2V0U3RhdGUgXG4gICAgICBodG1sOmRhdGFcbiAgICAgIHNob3c6eWVzXG4gIGhpZGVQcmV2aWV3OiAtPlxuICAgIEBzZXRTdGF0ZSBzaG93Om5vXG4gIHJlbmRlcjogLT5cbiAgICBkaXYoe1xuICAgICAgY2xhc3NOYW1lOiBcInByZXZpZXcgXCIrKGlmIEBzdGF0ZS5zaG93IHRoZW4gXCIgc2hvd1wiIGVsc2UgXCJcIilcbiAgICAgIHN0eWxlOlxuICAgICAgICB0b3A6QHN0YXRlLnRvcFxuICAgICAgICBsZWZ0OkBzdGF0ZS5sZWZ0XG4gICAgICB9LCBAc3RhdGUuaHRtbClcblxuJCgtPlxuICAkKCdib2R5JykuYXBwZW5kICQoXCI8ZGl2IGlkPSdwcmV2aWV3Jz48L2Rpdj5cIilcbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50IFByZXZpZXcobnVsbCksICQoXCIjcHJldmlld1wiKS5nZXQoMClcbilcblxuIiwiXG5BZGRDb3Vyc2VNb2RhbD1SZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtpbnB1dDpcIlwiLGZvY3VzOmZhbHNlLGxvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6ZmFsc2Usc3ViamVjdDpcIlwiLGNhdGFsb2dfbnVtYmVyOlwiXCIsbWVzc2FnZTpcIlwiLGRhdGFMaXN0OltdLGRhdGFMaXN0U2VsZWN0ZWQ6MCwgZGF0YUxpc3RUeXBlOlwiTm9uZVwifTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKXtcbiAgICAkKFwiYm9keVwiKS5vbignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVCbHVyKTtcbiAgICAkKFwiLm5hdmJhci1mb3JtXCIpLm9uKCdtb3VzZWRvd24nLCB0aGlzLmJsb2NrQ2xpY2spO1xuICAgICQoXCIuZGVsZXRlQnRuXCIpLnRvb2x0aXAoe2NvbnRhaW5lcjonLm5hdmJhcid9KVxuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgJChcImJvZHlcIikub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICQoXCIubmF2YmFyLWZvcm1cIikub24oJ21vdXNlZG93bicsIHRoaXMuYmxvY2tDbGljayk7XG4gIH0sXG4gIGhhbmRsZVN1Ym1pdDpmdW5jdGlvbihlKXtcbiAgICBpZihlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0Lmxlbmd0aD4wKXtcbiAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RbdGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkXVxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3Q6c2VsZWN0ZWQuY291cnNlcywgZGF0YUxpc3RTZWxlY3RlZDowLCBpbnB1dDpzZWxlY3RlZC5uYW1lLHN1YmplY3Q6c2VsZWN0ZWQubmFtZSwgZGF0YUxpc3RUeXBlOlwiQ291cnNlXCIsIG1lc3NhZ2U6XCJcIn0pXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIkNvdXJzZVwiKXtcbiAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzp0cnVlLGNhdGFsb2dfbnVtYmVyOnNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGlucHV0OnRoaXMuc3RhdGUuc3ViamVjdCtzZWxlY3RlZC5jYXRhbG9nX251bWJlcn0pO1xuICAgICAgICB1d2FwaS5nZXRDb3Vyc2UodGhpcy5zdGF0ZS5zdWJqZWN0LHNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGZ1bmN0aW9uKGNvdXJzZSl7XG4gICAgICAgICAgaWYoY291cnNlKXtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6dHJ1ZSxtZXNzYWdlOlwiXCIsZGF0YUxpc3RUeXBlOlwiTm9uZVwiLGRhdGFMaXN0OlwiXCJ9KTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6dHJ1ZSxkYXRhTGlzdFR5cGU6XCJOb25lXCIsZGF0YUxpc3Q6XCJcIixtZXNzYWdlOlwiRXJyb3IgbG9hZGluZyBjb3Vyc2UgaW5mb1wifSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuc2VhcmNoZWQmJnRoaXMuc3RhdGUubWVzc2FnZT09XCJcIiYmZGF0YSYmZGF0YS5jb3Vyc2VMaXN0KXtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlYXJjaGVkOmZhbHNlLGlucHV0OlwiXCIsc3ViamVjdDpcIlwiLGNhdGFsb2dfbnVtYmVyOlwiXCJ9KVxuICAgICAgdGhpcy5oYW5kbGVBZGRDb3Vyc2UoZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgaGFuZGxlQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBpbnB1dFZhbHVlPWUudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCk7XG4gICAgc3ViamVjdD1pbnB1dFZhbHVlLm1hdGNoKC9eXFxEKy8pO1xuICAgIGNhdGFsb2dfbnVtYmVyPXN1YmplY3Q/aW5wdXRWYWx1ZS5zdWJzdHIoc3ViamVjdFswXS5sZW5ndGgpOlwiXCI7XG4gICAgc3ViamVjdD0oc3ViamVjdCk/c3ViamVjdFswXS5yZXBsYWNlKC8gL2csJycpOlwiXCI7XG4gICAgY2F0YWxvZ19udW1iZXI9Y2F0YWxvZ19udW1iZXIucmVwbGFjZSgvIC9nLCcnKTtcbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICBmb2N1czp0cnVlLFxuICAgICAgaW5wdXQ6aW5wdXRWYWx1ZSxcbiAgICAgIHN1YmplY3Q6c3ViamVjdCxcbiAgICAgIGNhdGFsb2dfbnVtYmVyOmNhdGFsb2dfbnVtYmVyLFxuICAgICAgc2VhcmNoZWQ6ZmFsc2UsXG4gICAgICBtZXNzYWdlOlwiXCJcbiAgICB9XG4gICAgaWYoc3ViamVjdCE9XCJcIil7XG4gICAgICB2YXIgbWF0Y2hlZFN1YmplY3RzID0gYWxsU3ViamVjdHMuZmlsdGVyKGZ1bmN0aW9uKHN1YmplY3REYXRhKXtcbiAgICAgICAgcmV0dXJuIHN1YmplY3REYXRhLm5hbWUubGFzdEluZGV4T2Yoc3ViamVjdCwgMCkgPT09IDBcbiAgICAgIH0pXG4gICAgICBpZihtYXRjaGVkU3ViamVjdHMubGVuZ3RoPjAmJm1hdGNoZWRTdWJqZWN0c1swXS5uYW1lPT1zdWJqZWN0JiZjYXRhbG9nX251bWJlciE9XCJcIil7XG4gICAgICAgIHN0YXRlLmRhdGFMaXN0PW1hdGNoZWRTdWJqZWN0c1swXS5jb3Vyc2VzLmZpbHRlcihmdW5jdGlvbihjb3Vyc2VEYXRhKXtcbiAgICAgICAgICByZXR1cm4gY291cnNlRGF0YS5jYXRhbG9nX251bWJlci5sYXN0SW5kZXhPZihjYXRhbG9nX251bWJlciwgMCkgPT09IDBcbiAgICAgICAgfSlcbiAgICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiQ291cnNlXCJcbiAgICAgIH1lbHNle1xuICAgICAgICBzdGF0ZS5kYXRhTGlzdD1tYXRjaGVkU3ViamVjdHNcbiAgICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiU3ViamVjdFwiXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBzdGF0ZS5kYXRhTGlzdFR5cGU9XCJOb25lXCJcbiAgICB9XG4gICAgaWYodGhpcy5zdGF0ZS5pbnB1dCE9aW5wdXRWYWx1ZSl7XG4gICAgICBzdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPTBcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSxmdW5jdGlvbigpe1xuICAgICAgJCgnLnNlYXJjaFJlc3VsdCAuY29udGFpbmVyJykuc2Nyb2xsVG9wKDApXG4gICAgfSk7XG5cbiAgfSxcbiAgaGFuZGxlQmx1cjpmdW5jdGlvbihlKXtcbiAgICB0aGlzLnNldFN0YXRlKHtmb2N1czpmYWxzZX0pXG4gIH0sXG4gIGhhbmRsZUZvY3VzOmZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzOnRydWV9KVxuICB9LFxuICBoYW5kbGVBZGRDb3Vyc2U6ZnVuY3Rpb24oZSl7XG4gICAgdmFyIGNvdXJzZSA9IHtcbiAgICAgIHN1YmplY3Q6dGhpcy5zdGF0ZS5zdWJqZWN0LFxuICAgICAgY2F0YWxvZ19udW1iZXI6dGhpcy5zdGF0ZS5jYXRhbG9nX251bWJlclxuICAgIH1cbiAgICBpZihkYXRhJiZkYXRhLmNvdXJzZUxpc3Qpe1xuICAgICAgaWYoaGFzQ291cnNlKGNvdXJzZSkpe1xuICAgICAgICBhbGVydChcIkNvdXJzZSBhbHJlYWR5IGFkZGVkXCIpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZGF0YS5jb3Vyc2VMaXN0LnB1c2goY291cnNlKVxuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwiZGF0YVVwZGF0ZWRcIilcbiAgICAgICAgJChcIiNzZWFyY2hJbnB1dFwiKS5mb2N1cygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBibG9ja0NsaWNrOmZ1bmN0aW9uKGUpe1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG4gIGRyb3A6ZnVuY3Rpb24oZSl7XG4gICAgdmFyIGNvdXJzZU5hbWUgPSBlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9jb3Vyc2VcIilcbiAgICBmb3IgKHZhciB0ZXJtSW5kZXggPSAtMTsgdGVybUluZGV4IDwgZGF0YS5zY2hlZHVsZS5sZW5ndGg7IHRlcm1JbmRleCsrKSB7XG4gICAgICB2YXIgdGVybSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClcbiAgICAgIGZvciAodmFyIGNvdXJzZUluZGV4ID0gMDsgY291cnNlSW5kZXggPCB0ZXJtLmxlbmd0aDsgY291cnNlSW5kZXgrKykge1xuICAgICAgICBpZihuYW1lKHRlcm1bY291cnNlSW5kZXhdKT09Y291cnNlTmFtZSl7XG4gICAgICAgICAgdGVybS5zcGxpY2UoY291cnNlSW5kZXgsMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gIH0sXG4gIGRyYWdPdmVyOmZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSxcbiAgaGFuZGxlS2V5ZG93bjpmdW5jdGlvbihlKXtcbiAgICBzY3JvbGxlZCA9IGZhbHNlXG4gICAgaWYoZS5rZXlDb2RlPT00MCl7Ly9kb3duXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ8dGhpcy5zdGF0ZS5kYXRhTGlzdC5sZW5ndGgtMSlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3RTZWxlY3RlZDp0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQrMX0sZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoKCQoXCIuc3VnZ2VzdGlvbi5hY3RpdmVcIikuaW5kZXgoKS01KSoyOClcbiAgICAgICAgfSlcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIH1lbHNlIGlmKGUua2V5Q29kZT09Mzgpey8vdXBcbiAgICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD4wKVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdFNlbGVjdGVkOnRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZC0xfSxmdW5jdGlvbigpe1xuICAgICAgICAgICQoJy5zZWFyY2hSZXN1bHQgLmNvbnRhaW5lcicpLnNjcm9sbFRvcCgoJChcIi5zdWdnZXN0aW9uLmFjdGl2ZVwiKS5pbmRleCgpLTUpKjI4KVxuICAgICAgICB9KVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfVxuICB9LFxuICBoYW5kbGVDbGljazpmdW5jdGlvbihpbmRleFNlbGVjdGVkKXtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0U2VsZWN0ZWQ6aW5kZXhTZWxlY3RlZH0sZnVuY3Rpb24oKXtcbiAgICAgICQoXCIjc2VhcmNoSW5wdXRcIikuZm9jdXMoKVxuICAgICAgdGhhdC5oYW5kbGVTdWJtaXQoKVxuICAgIH0pXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNOYW1lID0gXCJzZWFyY2hSZXN1bHRcIisodGhpcy5zdGF0ZS5mb2N1cz9cIlwiOlwiIGhpZGVVcFwiKVxuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZih0aGlzLnN0YXRlLm1lc3NhZ2UhPVwiXCIpe1xuICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLm1lc3NhZ2V9XG4gICAgICAgICAgICAgIDwvZGl2PilcbiAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLnNlYXJjaGVkKXtcbiAgICAgIHZhciBjb3Vyc2U9dXdhcGkuZ2V0SW5mbyh7c3ViamVjdDp0aGlzLnN0YXRlLnN1YmplY3QsXG4gICAgICAgIGNhdGFsb2dfbnVtYmVyOnRoaXMuc3RhdGUuY2F0YWxvZ19udW1iZXJ9KTtcbiAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8aDM+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj17Y291cnNlLnVybH0+e2NvdXJzZS5zdWJqZWN0K1wiIFwiK2NvdXJzZS5jYXRhbG9nX251bWJlcitcIiAtIFwiK2NvdXJzZS50aXRsZX08L2E+PC9oMz5cbiAgICAgICAgICAgICAgICA8cD57Y291cnNlLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+QW50aXJlcTogPC9zdHJvbmc+e2NvdXJzZS5hbnRpcmVxdWlzaXRlfHxcIm5vbmVcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+UHJlcmVxOiA8L3N0cm9uZz57Y291cnNlLnByZXJlcXVpc2l0ZXN8fFwibm9uZVwifTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5UZXJtcyBvZmZlcmVkOiA8L3N0cm9uZz57Z2V0VGVybU5hbWVBcnJheShjb3Vyc2UudGVybXNfb2ZmZXJlZCkuam9pbihcIiwgXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHVsbC1yaWdodCBjb2wteHMtMTIgY29sLW1kLTZcIj5cbiAgICAgICAgICAgICAgICAgIHsoJChcIiNhZG1pbi1idG5cIikubGVuZ3RoKT88ZGl2IGNsYXNzTmFtZT1cImNvbC14cy00XCI+PGEgY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1ibG9ja1wiIGhyZWY9e1wiL2FkbWluL2FwcC9jb3Vyc2UvXCIrY291cnNlLmlkfT5FZGl0PC9hPjwvZGl2Pjp7fX1cbiAgICAgICAgICAgICAgICAgIHsoZGF0YSYmZGF0YS5jb3Vyc2VMaXN0KT88ZGl2IGNsYXNzTmFtZT1cImNvbC14cy04XCI+PGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgYnRuLWJsb2NrXCI+QWRkIHRvIGxpc3Q8L2J1dHRvbj48L2Rpdj46e319XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgfWVsc2V7XG4gICAgICAvL3Nob3cgc3VnZ2VzdGlvblxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5zdGF0ZS5kYXRhTGlzdFxuICAgICAgICB2YXIgc3ViamVjdEVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihzdWJqZWN0LGkpe1xuICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcInN1Z2dlc3Rpb25cIisodGhhdC5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPT1pP1wiIGFjdGl2ZVwiOlwiXCIpfSBvbkNsaWNrPXt0aGF0LmhhbmRsZUNsaWNrLmJpbmQodGhhdCxpKX0+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e3N1YmplY3QubmFtZX08L3N0cm9uZz4gLSB7c3ViamVjdC5kZXNjcmlwdGlvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICB7c3ViamVjdEVscy5sZW5ndGg+MD9zdWJqZWN0RWxzOihcbiAgICAgICAgICAgICAgXCJTdWJqZWN0IG5vdCBmb3VuZCBcIit0aGF0LnN0YXRlLnN1YmplY3RcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJDb3Vyc2VcIil7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RcbiAgICAgICAgdmFyIGNvdXJzZUVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihjb3Vyc2UsaSl7XG4gICAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e1wic3VnZ2VzdGlvblwiKyh0aGF0LnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ9PWk/XCIgYWN0aXZlXCI6XCJcIil9IG9uQ2xpY2s9e3RoYXQuaGFuZGxlQ2xpY2suYmluZCh0aGF0LGkpfT5cbiAgICAgICAgICAgICAgPHN0cm9uZz57dGhhdC5zdGF0ZS5zdWJqZWN0K2NvdXJzZS5jYXRhbG9nX251bWJlcn08L3N0cm9uZz4gLSB7Y291cnNlLnRpdGxlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiID5cbiAgICAgICAgICAgIHtjb3Vyc2VFbHMubGVuZ3RoPjA/Y291cnNlRWxzOihcbiAgICAgICAgICAgICAgXCJDb3Vyc2Ugbm90IGZvdW5kOiBcIit0aGF0LnN0YXRlLnN1YmplY3QrXCIgXCIrdGhhdC5zdGF0ZS5jYXRhbG9nX251bWJlclxuICAgICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgIH1lbHNle1xuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICBFbnRlciBDb3Vyc2UgQ29kZTogaS5lIDxzdHJvbmc+Q1MyNDE8L3N0cm9uZz4sIDxzdHJvbmc+RU5HTDEwOTwvc3Ryb25nPiwgLi4uXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4oXG4gICAgICA8Zm9ybSBjbGFzc05hbWU9XCJuYXZiYXItZm9ybSBuYXZiYXItbGVmdFwiIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc2VhcmNoSW5wdXQnIHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPSdTZWFyY2ggZm9yIENvdXJzZScgY2xhc3NOYW1lPXsnZm9ybS1jb250cm9sJysodGhpcy5zdGF0ZS5mb2N1cz9cIiBmb2N1c2VkXCI6XCJcIil9IHZhbHVlPXt0aGlzLnN0YXRlLmlucHV0fSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2V9IG9uRm9jdXM9e3RoaXMuaGFuZGxlRm9jdXN9IHJlZj1cInNlYXJjaElucHV0XCIgb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleWRvd259Lz5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9e1wiZmEgZmEtc3BpbiBmYS1zcGlubmVyIHNlYXJjaEluZGljYXRvciBcIisodGhpcy5zdGF0ZS5sb2FkaW5nP1wiXCI6XCJoaWRlXCIpfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyhkYXRhJiZkYXRhLmNvdXJzZUxpc3QpPzxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cCBkZWxldGVCdG5cIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiB0aXRsZT1cIkRyYWcgY291cnNlIGhlcmUgdG8gZGVsZXRlXCIgZGF0YS1wbGFjZW1lbnQ9XCJib3R0b21cIiByZWY9XCJkZWxldGVCdG5cIiBvbkRyb3A9e3RoaXMuZHJvcH0gb25EcmFnT3Zlcj17dGhpcy5kcmFnT3Zlcn0+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPVwicGUtN3MtdHJhc2ggZmEtZndcIi8+XG4gICAgICAgIDwvZGl2Pjp7fX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NOYW1lfSA+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9mb3JtPlxuICAgICk7XG4gIH1cbn0pXG5cblxuXG4kKGZ1bmN0aW9uKCl7XG4gIFJlYWN0LnJlbmRlckNvbXBvbmVudChcbiAgICA8QWRkQ291cnNlTW9kYWwgLz4sXG4gICAgJChcIiNzZWFyY2hCdG5XcmFwcGVyXCIpLmdldCgwKVxuICApO1xufSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=