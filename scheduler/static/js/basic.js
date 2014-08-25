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
    }else if(this.state.searched&&this.state.message==""&&window.editing){
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
    if(window.editing){
      if(hasCourse(course)){
        alert("Course already added")
      }else{
        data.courseList.push(course)
        animateElem = $(".searchResult").clone().addClass("animate-course")
        animateElem.removeAttr("data-reactid").find("[data-reactid]").removeAttr("data-reactid")
        $("body").append(animateElem)
        animateElem.css({
          top:$(".searchResult").offset().top,
          left:$(".searchResult").offset().left,
          width:$(".searchResult").outerWidth(),
          height:$(".searchResult").outerHeight()
        }).animate({
          top:$(".bucket .moveBlock").offset().top,
          left:$(".bucket .moveBlock").offset().left,
          width:$(".bucket .moveBlock").outerWidth(),
          height:$(".bucket .moveBlock").outerHeight()
        }, 500, function(){
          animateElem.remove()
        })
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
                  (window.editing)?React.DOM.div({className: "col-xs-8"}, React.DOM.button({className: "btn btn-primary btn-block"}, "Add to list")):{}
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
        (window.editing)?React.DOM.div({className: "form-group deleteBtn", 'data-toggle': "tooltip", title: "Drag course here to delete", 'data-placement': "bottom", ref: "deleteBtn", onDrop: this.drop, onDragOver: this.dragOver}, 
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvaGVscGVycy5jb2ZmZWUiLCJzZWFyY2hJbnB1dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0hBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsQ0FBVixhQUFZLFNBQVosRUFBSDtFQUFBLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxDQUFWLGFBQVksU0FBWixFQUFIO0VBQUEsQ0FEUCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLE1BQVYsYUFBaUIsU0FBakIsRUFBSDtFQUFBLENBRlQsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxHQUFWLGFBQWMsU0FBZCxFQUFIO0VBQUEsQ0FITixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLEVBQVYsYUFBYSxTQUFiLEVBQUg7RUFBQSxDQUpMLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQUssU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsRUFBVixhQUFhLFNBQWIsRUFBSDtFQUFBLENBTEwsQ0FBQTs7QUFBQSxFQU1BLEVBQUEsR0FBSyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxFQUFWLGFBQWEs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USxDQTVEVixDQUFBOztBQUFBLEVBK0dBLENBQUEsQ0FBRSxTQUFBLEdBQUE7QUFDQSxJQUFBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQWlCLENBQUEsQ0FBRSwwQkFBRixDQUFqQixDQUFBLENBQUE7V0FDQSxLQUFLLENBQUMsZUFBTixDQUFzQixPQUFBLENBQVEsSUFBUixDQUF0QixFQUFxQyxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsR0FBZCxDQUFrQixDQUFsQixDQUFyQyxFQUZBO0VBQUEsQ0FBRixDQS9HQSxDQUFBO0FBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYmFzaWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhID0gLT4gUmVhY3QuRE9NLmEgYXJndW1lbnRzLi4uXG5ib2xkID0gLT4gUmVhY3QuRE9NLmIgYXJndW1lbnRzLi4uXG5idXR0b24gPSAtPiBSZWFjdC5ET00uYnV0dG9uIGFyZ3VtZW50cy4uLlxuZGl2ID0gLT4gUmVhY3QuRE9NLmRpdiBhcmd1bWVudHMuLi5cbmgxID0gLT4gUmVhY3QuRE9NLmgxIGFyZ3VtZW50cy4uLlxuaDIgPSAtPiBSZWFjdC5ET00uaDIgYXJndW1lbnRzLi4uXG5oMyA9IC0+IFJlYWN0LkRPTS5oMyBhcmd1bWVudHMuLi5cbmg0ID0gLT4gUmVhY3QuRE9NLmg0IGFyZ3VtZW50cy4uLlxuaDUgPSAtPiBSZWFjdC5ET00uaDUgYXJndW1lbnRzLi4uXG5oNiA9IC0+IFJlYWN0LkRPTS5oNiBhcmd1bWVudHMuLi5cbmljb24gPSAtPiBSZWFjdC5ET00uaSBhcmd1bWVudHMuLi5cbmlucHV0ID0gLT4gUmVhY3QuRE9NLmlucHV0IGFyZ3VtZW50cy4uLlxucCA9IC0+IFJlYWN0LkRPTS5wIGFyZ3VtZW50cy4uLlxuc3BhbiA9IC0+IFJlYWN0LkRPTS5zcGFuIGFyZ3VtZW50cy4uLlxudGFibGUgPSAtPiBSZWFjdC5ET00udGFibGUgYXJndW1lbnRzLi4uXG50Ym9keSA9IC0+IFJlYWN0LkRPTS50Ym9keSBhcmd1bWVudHMuLi5cbnRkID0gLT4gUmVhY3QuRE9NLnRkIGFyZ3VtZW50cy4uLlxudGggPSAtPiBSZWFjdC5ET00udGggYXJndW1lbnRzLi4uXG50aGVhZCA9IC0+IFJlYWN0LkRPTS50aGVhZCBhcmd1bWVudHMuLi5cbnRyID0gLT4gUmVhY3QuRE9NLnRyIGFyZ3VtZW50cy4uLlxuc3Ryb25nID0gLT4gUmVhY3QuRE9NLnN0cm9uZyBhcmd1bWVudHMuLi5cblxuXG5cbndpbmRvdy51d2FwaSA9IFxuICBjb3Vyc2VJbmZvOiB3aW5kb3cuZGF0YS5jb3Vyc2VJbmZvfHx7fSxcbiAgZ2V0Q291cnNlOiAoc3ViamVjdCwgY2F0YWxvZ19udW1iZXIsIGNhbGxiYWNrKS0+XG4gICAgY291cnNlID0ge31cbiAgICB0aGF0ID0gdGhpc1xuICAgICQuZ2V0SlNPTihcIi9jb3Vyc2UvXCIrc3ViamVjdCtcIi9cIitjYXRhbG9nX251bWJlciwgKGNvdXJzZSktPlxuICAgICAgICBpZiBub3QgY291cnNlXG4gICAgICAgICAgY2FsbGJhY2sobnVsbClcbiAgICAgICAgY29uc29sZS5sb2cgY291cnNlXG4gICAgICAgIGlmIGNvdXJzZS5wcmVyZXF1aXNpdGVzJiZjb3Vyc2UucHJlcmVxdWlzaXRlcy5zdWJzdHIoMCw3KT09XCJQcmVyZXE6XCJcbiAgICAgICAgICBjb3Vyc2UucHJlcmVxdWlzaXRlcz1jb3Vyc2UucHJlcmVxdWlzaXRlcy5zdWJzdHIoOClcbiAgICAgICAgY291cnNlLm5hbWU9Z2V0Q291cnNlTmFtZShjb3Vyc2UpXG4gICAgICAgIHRoYXQuY291cnNlSW5mb1tjb3Vyc2UubmFtZV09Y291cnNlXG4gICAgICAgIGNhbGxiYWNrKGNvdXJzZS5uYW1lKVxuICAgICkuZmFpbCgtPiBjYWxsYmFjayhudWxsKSlcbiAgZ2V0SW5mbzogKGNvdXJzZSktPlxuICAgIEBjb3Vyc2VJbmZvW2dldENvdXJzZU5hbWUoY291cnNlKV1cblxud2luZG93LmdldENvdXJzZU5hbWUgPSAob2JqKSAtPiBcbiAgb2JqLnN1YmplY3QgKyBvYmouY2F0YWxvZ19udW1iZXJcblxud2luZG93LmNhbGN1bGF0ZVRlcm0gPSAoc3RhcnRZZWFyLCBzdGFydFRlcm0sIGkpIC0+XG4gIHN0YXJ0WWVhciA9IHN0YXJ0WWVhciArIE1hdGguZmxvb3IoKHN0YXJ0VGVybSArIGkpIC8gMylcbiAgc3RhcnRUZXJtID0gKHN0YXJ0VGVybSArIGkpICUgM1xuICBzd2l0Y2ggc3RhcnRUZXJtXG4gICAgd2hlbiAwIHRoZW4gc3RhcnRZZWFyICsgXCIgV2ludGVyXCJcbiAgICB3aGVuIDEgdGhlbiBzdGFydFllYXIgKyBcIiBTcHJpbmdcIlxuICAgIHdoZW4gMiB0aGVuIHN0YXJ0WWVhciArIFwiIEZhbGxcIlxuXG53aW5kb3cuZ2V0VGVybU5hbWVBcnJheSA9ICh0ZXJtc19vZmZlcmVkKSAtPlxuICB0ZXJtc19vZmZlcmVkLm1hcCAoaSkgLT5cbiAgICBzd2l0Y2ggaVxuICAgICAgd2hlbiBcIkZcIiB0aGVuIFwiRmFsbFwiXG4gICAgICB3aGVuIFwiV1wiIHRoZW4gXCJXaW50ZXJcIlxuICAgICAgZWxzZSBcIlNwcmluZ1wiXG5cblByZXZpZXcgPSBSZWFjdC5jcmVhdGVDbGFzc1xuICBnZXRJbml0aWFsU3RhdGU6IC0+XG4gICAgdG9wOjBcbiAgICBsZWZ0OjBcbiAgICBodG1sOlwiXCJcbiAgICBzaG93Om5vXG4gIGNvbXBvbmVudERpZE1vdW50OiAoKSAtPlxuICAgICQod2luZG93KS5vbiAnbW91c2Vtb3ZlJywgQGhhbmRsZU1vdXNlTW92ZVxuICAgIHdpbmRvdy5zaG93UHJldmlldyA9IEBzaG93UHJldmlld1xuICAgIHdpbmRvdy5zaG93Q291cnNlUHJldmlldyA9IEBzaG93Q291cnNlUHJldmlld1xuICAgIHdpbmRvdy5oaWRlUHJldmlldyA9IEBoaWRlUHJldmlld1xuICBjb21wb25lbnRXaWxsVW5tb3VudDogKCkgLT5cbiAgICAkKHdpbmRvdykub2ZmICdtb3VzZW1vdmUnLCBAaGFuZGxlTW91c2VNb3ZlXG4gIGhhbmRsZU1vdXNlTW92ZTooZSktPlxuICAgIGlmIEBzdGF0ZS5zaG93XG4gICAgICBAc2V0U3RhdGVcbiAgICAgICAgdG9wOmUuY2xpZW50WSsyMFxuICAgICAgICBsZWZ0OmUuY2xpZW50WCsxNVxuICBzaG93Q291cnNlUHJldmlldzogKGNvdXJzZSk9PlxuICAgIGNvdXJzZSA9IHV3YXBpLmdldEluZm8gY291cnNlXG4gICAgaHRtbCA9IFxuICAgICAgZGl2KG51bGwsXG4gICAgICAgIGgzKG51bGwsXG4gICAgICAgICAgc3Ryb25nKG51bGwsIGNvdXJzZS5uYW1lKSxcbiAgICAgICAgICBcIiAtIFwiLFxuICAgICAgICAgIGNvdXJzZS50aXRsZSksXG4gICAgICAgIHAobnVsbCwgY291cnNlLmRlc2NyaXB0aW9uKVxuICAgICAgICBwKG51bGwsXG4gICAgICAgICAgc3Ryb25nKG51bGwsIFwiQW50aXJlcTogXCIpLFxuICAgICAgICAgIGNvdXJzZS5hbnRpcmVxdWlzaXRlfHxcIm5vbmVcIiksXG4gICAgICAgIHAobnVsbCxcbiAgICAgICAgICBzdHJvbmcobnVsbCwgXCJQcmVyZXE6IFwiKSxcbiAgICAgICAgICBjb3Vyc2UucHJlcmVxdWlzaXRlc3x8XCJub25lXCIpLFxuICAgICAgICBwKG51bGwsXG4gICAgICAgICAgc3Ryb25nKG51bGwsIFwiVGVybXMgb2ZmZXJlZDogXCIpLFxuICAgICAgICAgIGdldFRlcm1OYW1lQXJyYXkoY291cnNlLnRlcm1zX29mZmVyZWQpLmpvaW4oXCIsIFwiKSkpXG4gICAgQHNob3dQcmV2aWV3IGh0bWxcbiAgc2hvd1ByZXZpZXc6IChkYXRhKSAtPlxuICAgIEBzZXRTdGF0ZSBcbiAgICAgIGh0bWw6ZGF0YVxuICAgICAgc2hvdzp5ZXNcbiAgaGlkZVByZXZpZXc6IC0+XG4gICAgQHNldFN0YXRlIHNob3c6bm9cbiAgcmVuZGVyOiAtPlxuICAgIGRpdih7XG4gICAgICBjbGFzc05hbWU6IFwicHJldmlldyBcIisoaWYgQHN0YXRlLnNob3cgdGhlbiBcIiBzaG93XCIgZWxzZSBcIlwiKVxuICAgICAgc3R5bGU6XG4gICAgICAgIHRvcDpAc3RhdGUudG9wXG4gICAgICAgIGxlZnQ6QHN0YXRlLmxlZnRcbiAgICAgIH0sIEBzdGF0ZS5odG1sKVxuXG4kKC0+XG4gICQoJ2JvZHknKS5hcHBlbmQgJChcIjxkaXYgaWQ9J3ByZXZpZXcnPjwvZGl2PlwiKVxuICBSZWFjdC5yZW5kZXJDb21wb25lbnQgUHJldmlldyhudWxsKSwgJChcIiNwcmV2aWV3XCIpLmdldCgwKVxuKVxuXG4iLCJcbkFkZENvdXJzZU1vZGFsPVJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge2lucHV0OlwiXCIsZm9jdXM6ZmFsc2UsbG9hZGluZzpmYWxzZSxzZWFyY2hlZDpmYWxzZSxzdWJqZWN0OlwiXCIsY2F0YWxvZ19udW1iZXI6XCJcIixtZXNzYWdlOlwiXCIsZGF0YUxpc3Q6W10sZGF0YUxpc3RTZWxlY3RlZDowLCBkYXRhTGlzdFR5cGU6XCJOb25lXCJ9O1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpe1xuICAgICQoXCJib2R5XCIpLm9uKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICQoXCIubmF2YmFyLWZvcm1cIikub24oJ21vdXNlZG93bicsIHRoaXMuYmxvY2tDbGljayk7XG4gICAgJChcIi5kZWxldGVCdG5cIikudG9vbHRpcCh7Y29udGFpbmVyOicubmF2YmFyJ30pXG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAkKFwiYm9keVwiKS5vZmYoJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgJChcIi5uYXZiYXItZm9ybVwiKS5vbignbW91c2Vkb3duJywgdGhpcy5ibG9ja0NsaWNrKTtcbiAgfSxcbiAgaGFuZGxlU3VibWl0OmZ1bmN0aW9uKGUpe1xuICAgIGlmKGUpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3QubGVuZ3RoPjApe1xuICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zdGF0ZS5kYXRhTGlzdFt0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWRdXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJTdWJqZWN0XCIpe1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdDpzZWxlY3RlZC5jb3Vyc2VzLCBkYXRhTGlzdFNlbGVjdGVkOjAsIGlucHV0OnNlbGVjdGVkLm5hbWUsc3ViamVjdDpzZWxlY3RlZC5uYW1lLCBkYXRhTGlzdFR5cGU6XCJDb3Vyc2VcIiwgbWVzc2FnZTpcIlwifSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiQ291cnNlXCIpe1xuICAgICAgICB0aGF0LnNldFN0YXRlKHtsb2FkaW5nOnRydWUsY2F0YWxvZ19udW1iZXI6c2VsZWN0ZWQuY2F0YWxvZ19udW1iZXIsaW5wdXQ6dGhpcy5zdGF0ZS5zdWJqZWN0K3NlbGVjdGVkLmNhdGFsb2dfbnVtYmVyfSk7XG4gICAgICAgIHV3YXBpLmdldENvdXJzZSh0aGlzLnN0YXRlLnN1YmplY3Qsc2VsZWN0ZWQuY2F0YWxvZ19udW1iZXIsZnVuY3Rpb24oY291cnNlKXtcbiAgICAgICAgICBpZihjb3Vyc2Upe1xuICAgICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzpmYWxzZSxzZWFyY2hlZDp0cnVlLG1lc3NhZ2U6XCJcIixkYXRhTGlzdFR5cGU6XCJOb25lXCIsZGF0YUxpc3Q6XCJcIn0pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzpmYWxzZSxzZWFyY2hlZDp0cnVlLGRhdGFMaXN0VHlwZTpcIk5vbmVcIixkYXRhTGlzdDpcIlwiLG1lc3NhZ2U6XCJFcnJvciBsb2FkaW5nIGNvdXJzZSBpbmZvXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5zZWFyY2hlZCYmdGhpcy5zdGF0ZS5tZXNzYWdlPT1cIlwiJiZ3aW5kb3cuZWRpdGluZyl7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWFyY2hlZDpmYWxzZSxpbnB1dDpcIlwiLHN1YmplY3Q6XCJcIixjYXRhbG9nX251bWJlcjpcIlwifSlcbiAgICAgIHRoaXMuaGFuZGxlQWRkQ291cnNlKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGhhbmRsZUNoYW5nZTpmdW5jdGlvbihlKXtcbiAgICB2YXIgaW5wdXRWYWx1ZT1lLnRhcmdldC52YWx1ZS50b1VwcGVyQ2FzZSgpO1xuICAgIHN1YmplY3Q9aW5wdXRWYWx1ZS5tYXRjaCgvXlxcRCsvKTtcbiAgICBjYXRhbG9nX251bWJlcj1zdWJqZWN0P2lucHV0VmFsdWUuc3Vic3RyKHN1YmplY3RbMF0ubGVuZ3RoKTpcIlwiO1xuICAgIHN1YmplY3Q9KHN1YmplY3QpP3N1YmplY3RbMF0ucmVwbGFjZSgvIC9nLCcnKTpcIlwiO1xuICAgIGNhdGFsb2dfbnVtYmVyPWNhdGFsb2dfbnVtYmVyLnJlcGxhY2UoLyAvZywnJyk7XG4gICAgdmFyIHN0YXRlID0ge1xuICAgICAgZm9jdXM6dHJ1ZSxcbiAgICAgIGlucHV0OmlucHV0VmFsdWUsXG4gICAgICBzdWJqZWN0OnN1YmplY3QsXG4gICAgICBjYXRhbG9nX251bWJlcjpjYXRhbG9nX251bWJlcixcbiAgICAgIHNlYXJjaGVkOmZhbHNlLFxuICAgICAgbWVzc2FnZTpcIlwiXG4gICAgfVxuICAgIGlmKHN1YmplY3QhPVwiXCIpe1xuICAgICAgdmFyIG1hdGNoZWRTdWJqZWN0cyA9IGFsbFN1YmplY3RzLmZpbHRlcihmdW5jdGlvbihzdWJqZWN0RGF0YSl7XG4gICAgICAgIHJldHVybiBzdWJqZWN0RGF0YS5uYW1lLmxhc3RJbmRleE9mKHN1YmplY3QsIDApID09PSAwXG4gICAgICB9KVxuICAgICAgaWYobWF0Y2hlZFN1YmplY3RzLmxlbmd0aD4wJiZtYXRjaGVkU3ViamVjdHNbMF0ubmFtZT09c3ViamVjdCYmY2F0YWxvZ19udW1iZXIhPVwiXCIpe1xuICAgICAgICBzdGF0ZS5kYXRhTGlzdD1tYXRjaGVkU3ViamVjdHNbMF0uY291cnNlcy5maWx0ZXIoZnVuY3Rpb24oY291cnNlRGF0YSl7XG4gICAgICAgICAgcmV0dXJuIGNvdXJzZURhdGEuY2F0YWxvZ19udW1iZXIubGFzdEluZGV4T2YoY2F0YWxvZ19udW1iZXIsIDApID09PSAwXG4gICAgICAgIH0pXG4gICAgICAgIHN0YXRlLmRhdGFMaXN0VHlwZT1cIkNvdXJzZVwiXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3RhdGUuZGF0YUxpc3Q9bWF0Y2hlZFN1YmplY3RzXG4gICAgICAgIHN0YXRlLmRhdGFMaXN0VHlwZT1cIlN1YmplY3RcIlxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiTm9uZVwiXG4gICAgfVxuICAgIGlmKHRoaXMuc3RhdGUuaW5wdXQhPWlucHV0VmFsdWUpe1xuICAgICAgc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD0wXG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUsZnVuY3Rpb24oKXtcbiAgICAgICQoJy5zZWFyY2hSZXN1bHQgLmNvbnRhaW5lcicpLnNjcm9sbFRvcCgwKVxuICAgIH0pO1xuXG4gIH0sXG4gIGhhbmRsZUJsdXI6ZnVuY3Rpb24oZSl7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Zm9jdXM6ZmFsc2V9KVxuICB9LFxuICBoYW5kbGVGb2N1czpmdW5jdGlvbihlKXtcbiAgICB0aGlzLnNldFN0YXRlKHtmb2N1czp0cnVlfSlcbiAgfSxcbiAgaGFuZGxlQWRkQ291cnNlOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBjb3Vyc2UgPSB7XG4gICAgICBzdWJqZWN0OnRoaXMuc3RhdGUuc3ViamVjdCxcbiAgICAgIGNhdGFsb2dfbnVtYmVyOnRoaXMuc3RhdGUuY2F0YWxvZ19udW1iZXJcbiAgICB9XG4gICAgaWYod2luZG93LmVkaXRpbmcpe1xuICAgICAgaWYoaGFzQ291cnNlKGNvdXJzZSkpe1xuICAgICAgICBhbGVydChcIkNvdXJzZSBhbHJlYWR5IGFkZGVkXCIpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZGF0YS5jb3Vyc2VMaXN0LnB1c2goY291cnNlKVxuICAgICAgICBhbmltYXRlRWxlbSA9ICQoXCIuc2VhcmNoUmVzdWx0XCIpLmNsb25lKCkuYWRkQ2xhc3MoXCJhbmltYXRlLWNvdXJzZVwiKVxuICAgICAgICBhbmltYXRlRWxlbS5yZW1vdmVBdHRyKFwiZGF0YS1yZWFjdGlkXCIpLmZpbmQoXCJbZGF0YS1yZWFjdGlkXVwiKS5yZW1vdmVBdHRyKFwiZGF0YS1yZWFjdGlkXCIpXG4gICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChhbmltYXRlRWxlbSlcbiAgICAgICAgYW5pbWF0ZUVsZW0uY3NzKHtcbiAgICAgICAgICB0b3A6JChcIi5zZWFyY2hSZXN1bHRcIikub2Zmc2V0KCkudG9wLFxuICAgICAgICAgIGxlZnQ6JChcIi5zZWFyY2hSZXN1bHRcIikub2Zmc2V0KCkubGVmdCxcbiAgICAgICAgICB3aWR0aDokKFwiLnNlYXJjaFJlc3VsdFwiKS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgaGVpZ2h0OiQoXCIuc2VhcmNoUmVzdWx0XCIpLm91dGVySGVpZ2h0KClcbiAgICAgICAgfSkuYW5pbWF0ZSh7XG4gICAgICAgICAgdG9wOiQoXCIuYnVja2V0IC5tb3ZlQmxvY2tcIikub2Zmc2V0KCkudG9wLFxuICAgICAgICAgIGxlZnQ6JChcIi5idWNrZXQgLm1vdmVCbG9ja1wiKS5vZmZzZXQoKS5sZWZ0LFxuICAgICAgICAgIHdpZHRoOiQoXCIuYnVja2V0IC5tb3ZlQmxvY2tcIikub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgIGhlaWdodDokKFwiLmJ1Y2tldCAubW92ZUJsb2NrXCIpLm91dGVySGVpZ2h0KClcbiAgICAgICAgfSwgNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGFuaW1hdGVFbGVtLnJlbW92ZSgpXG4gICAgICAgIH0pXG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJkYXRhVXBkYXRlZFwiKVxuICAgICAgICAkKFwiI3NlYXJjaElucHV0XCIpLmZvY3VzKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJsb2NrQ2xpY2s6ZnVuY3Rpb24oZSl7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcbiAgZHJvcDpmdW5jdGlvbihlKXtcbiAgICB2YXIgY291cnNlTmFtZSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJ0ZXh0L2NvdXJzZVwiKVxuICAgIGZvciAodmFyIHRlcm1JbmRleCA9IC0xOyB0ZXJtSW5kZXggPCBkYXRhLnNjaGVkdWxlLmxlbmd0aDsgdGVybUluZGV4KyspIHtcbiAgICAgIHZhciB0ZXJtID0gZ2V0VGVybUxpc3QodGVybUluZGV4KVxuICAgICAgZm9yICh2YXIgY291cnNlSW5kZXggPSAwOyBjb3Vyc2VJbmRleCA8IHRlcm0ubGVuZ3RoOyBjb3Vyc2VJbmRleCsrKSB7XG4gICAgICAgIGlmKG5hbWUodGVybVtjb3Vyc2VJbmRleF0pPT1jb3Vyc2VOYW1lKXtcbiAgICAgICAgICB0ZXJtLnNwbGljZShjb3Vyc2VJbmRleCwxKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgfSxcbiAgZHJhZ092ZXI6ZnVuY3Rpb24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9LFxuICBoYW5kbGVLZXlkb3duOmZ1bmN0aW9uKGUpe1xuICAgIHNjcm9sbGVkID0gZmFsc2VcbiAgICBpZihlLmtleUNvZGU9PTQwKXsvL2Rvd25cbiAgICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZDx0aGlzLnN0YXRlLmRhdGFMaXN0Lmxlbmd0aC0xKVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdFNlbGVjdGVkOnRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZCsxfSxmdW5jdGlvbigpe1xuICAgICAgICAgICQoJy5zZWFyY2hSZXN1bHQgLmNvbnRhaW5lcicpLnNjcm9sbFRvcCgoJChcIi5zdWdnZXN0aW9uLmFjdGl2ZVwiKS5pbmRleCgpLTUpKjI4KVxuICAgICAgICB9KVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfWVsc2UgaWYoZS5rZXlDb2RlPT0zOCl7Ly91cFxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPjApXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0U2VsZWN0ZWQ6dGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkLTF9LGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJCgnLnNlYXJjaFJlc3VsdCAuY29udGFpbmVyJykuc2Nyb2xsVG9wKCgkKFwiLnN1Z2dlc3Rpb24uYWN0aXZlXCIpLmluZGV4KCktNSkqMjgpXG4gICAgICAgIH0pXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9XG4gIH0sXG4gIGhhbmRsZUNsaWNrOmZ1bmN0aW9uKGluZGV4U2VsZWN0ZWQpe1xuICAgIHZhciB0aGF0PXRoaXM7XG4gICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3RTZWxlY3RlZDppbmRleFNlbGVjdGVkfSxmdW5jdGlvbigpe1xuICAgICAgJChcIiNzZWFyY2hJbnB1dFwiKS5mb2N1cygpXG4gICAgICB0aGF0LmhhbmRsZVN1Ym1pdCgpXG4gICAgfSlcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY05hbWUgPSBcInNlYXJjaFJlc3VsdFwiKyh0aGlzLnN0YXRlLmZvY3VzP1wiXCI6XCIgaGlkZVVwXCIpXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGlmKHRoaXMuc3RhdGUubWVzc2FnZSE9XCJcIil7XG4gICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAge3RoaXMuc3RhdGUubWVzc2FnZX1cbiAgICAgICAgICAgICAgPC9kaXY+KVxuICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuc2VhcmNoZWQpe1xuICAgICAgdmFyIGNvdXJzZT11d2FwaS5nZXRJbmZvKHtzdWJqZWN0OnRoaXMuc3RhdGUuc3ViamVjdCxcbiAgICAgICAgY2F0YWxvZ19udW1iZXI6dGhpcy5zdGF0ZS5jYXRhbG9nX251bWJlcn0pO1xuICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxoMz48YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPXtjb3Vyc2UudXJsfT57Y291cnNlLnN1YmplY3QrXCIgXCIrY291cnNlLmNhdGFsb2dfbnVtYmVyK1wiIC0gXCIrY291cnNlLnRpdGxlfTwvYT48L2gzPlxuICAgICAgICAgICAgICAgIDxwPntjb3Vyc2UuZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5BbnRpcmVxOiA8L3N0cm9uZz57Y291cnNlLmFudGlyZXF1aXNpdGV8fFwibm9uZVwifTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5QcmVyZXE6IDwvc3Ryb25nPntjb3Vyc2UucHJlcmVxdWlzaXRlc3x8XCJub25lXCJ9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPlRlcm1zIG9mZmVyZWQ6IDwvc3Ryb25nPntnZXRUZXJtTmFtZUFycmF5KGNvdXJzZS50ZXJtc19vZmZlcmVkKS5qb2luKFwiLCBcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0IGNvbC14cy0xMiBjb2wtbWQtNlwiPlxuICAgICAgICAgICAgICAgICAgeygkKFwiI2FkbWluLWJ0blwiKS5sZW5ndGgpPzxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTRcIj48YSBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHQgYnRuLWJsb2NrXCIgaHJlZj17XCIvYWRtaW4vYXBwL2NvdXJzZS9cIitjb3Vyc2UuaWR9PkVkaXQ8L2E+PC9kaXY+Ont9fVxuICAgICAgICAgICAgICAgICAgeyh3aW5kb3cuZWRpdGluZyk/PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtOFwiPjxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1ibG9ja1wiPkFkZCB0byBsaXN0PC9idXR0b24+PC9kaXY+Ont9fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKVxuICAgIH1lbHNle1xuICAgICAgLy9zaG93IHN1Z2dlc3Rpb25cbiAgICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIlN1YmplY3RcIil7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RcbiAgICAgICAgdmFyIHN1YmplY3RFbHMgPSBkYXRhTGlzdC5tYXAoZnVuY3Rpb24oc3ViamVjdCxpKXtcbiAgICAgICAgICByZXR1cm4oXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17XCJzdWdnZXN0aW9uXCIrKHRoYXQuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD09aT9cIiBhY3RpdmVcIjpcIlwiKX0gb25DbGljaz17dGhhdC5oYW5kbGVDbGljay5iaW5kKHRoYXQsaSl9PlxuICAgICAgICAgICAgICA8c3Ryb25nPntzdWJqZWN0Lm5hbWV9PC9zdHJvbmc+IC0ge3N1YmplY3QuZGVzY3JpcHRpb259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgPlxuICAgICAgICAgICAge3N1YmplY3RFbHMubGVuZ3RoPjA/c3ViamVjdEVsczooXG4gICAgICAgICAgICAgIFwiU3ViamVjdCBub3QgZm91bmQgXCIrdGhhdC5zdGF0ZS5zdWJqZWN0XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKVxuICAgICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiQ291cnNlXCIpe1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLnN0YXRlLmRhdGFMaXN0XG4gICAgICAgIHZhciBjb3Vyc2VFbHMgPSBkYXRhTGlzdC5tYXAoZnVuY3Rpb24oY291cnNlLGkpe1xuICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcInN1Z2dlc3Rpb25cIisodGhhdC5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPT1pP1wiIGFjdGl2ZVwiOlwiXCIpfSBvbkNsaWNrPXt0aGF0LmhhbmRsZUNsaWNrLmJpbmQodGhhdCxpKX0+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e3RoYXQuc3RhdGUuc3ViamVjdCtjb3Vyc2UuY2F0YWxvZ19udW1iZXJ9PC9zdHJvbmc+IC0ge2NvdXJzZS50aXRsZX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICB7Y291cnNlRWxzLmxlbmd0aD4wP2NvdXJzZUVsczooXG4gICAgICAgICAgICAgIFwiQ291cnNlIG5vdCBmb3VuZDogXCIrdGhhdC5zdGF0ZS5zdWJqZWN0K1wiIFwiK3RoYXQuc3RhdGUuY2F0YWxvZ19udW1iZXJcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgPlxuICAgICAgICAgICAgRW50ZXIgQ291cnNlIENvZGU6IGkuZSA8c3Ryb25nPkNTMjQxPC9zdHJvbmc+LCA8c3Ryb25nPkVOR0wxMDk8L3N0cm9uZz4sIC4uLlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuKFxuICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibmF2YmFyLWZvcm0gbmF2YmFyLWxlZnRcIiBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3NlYXJjaElucHV0JyB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0nU2VhcmNoIGZvciBDb3Vyc2UnIGNsYXNzTmFtZT17J2Zvcm0tY29udHJvbCcrKHRoaXMuc3RhdGUuZm9jdXM/XCIgZm9jdXNlZFwiOlwiXCIpfSB2YWx1ZT17dGhpcy5zdGF0ZS5pbnB1dH0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlfSBvbkZvY3VzPXt0aGlzLmhhbmRsZUZvY3VzfSByZWY9XCJzZWFyY2hJbnB1dFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlkb3dufS8+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPXtcImZhIGZhLXNwaW4gZmEtc3Bpbm5lciBzZWFyY2hJbmRpY2F0b3IgXCIrKHRoaXMuc3RhdGUubG9hZGluZz9cIlwiOlwiaGlkZVwiKX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHsod2luZG93LmVkaXRpbmcpPzxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cCBkZWxldGVCdG5cIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiB0aXRsZT1cIkRyYWcgY291cnNlIGhlcmUgdG8gZGVsZXRlXCIgZGF0YS1wbGFjZW1lbnQ9XCJib3R0b21cIiByZWY9XCJkZWxldGVCdG5cIiBvbkRyb3A9e3RoaXMuZHJvcH0gb25EcmFnT3Zlcj17dGhpcy5kcmFnT3Zlcn0+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPVwicGUtN3MtdHJhc2ggZmEtZndcIi8+XG4gICAgICAgIDwvZGl2Pjp7fX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NOYW1lfSA+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9mb3JtPlxuICAgICk7XG4gIH1cbn0pXG5cblxuXG4kKGZ1bmN0aW9uKCl7XG4gIFJlYWN0LnJlbmRlckNvbXBvbmVudChcbiAgICA8QWRkQ291cnNlTW9kYWwgLz4sXG4gICAgJChcIiNzZWFyY2hCdG5XcmFwcGVyXCIpLmdldCgwKVxuICApO1xufSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=