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

  window.facebookConnect = function() {
    F.connect($('#facebookForm').get(0));
    return false;
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

  window.EditLabel = React.createClass({
    getInitialState: function() {
      return {
        loading: false,
        text: this.props.initialValue
      };
    },
    handleChange: function(e) {
      return this.setState({
        text: e.target.value
      });
    },
    endEdit: function(e) {
      this.setState({
        loading: true
      });
      return $.ajax({
        url: "/save/" + data.coursePlanId + "/",
        type: "post",
        dataType: "json",
        data: {
          name: this.state.text,
          csrfmiddlewaretoken: data.csrf_token
        },
        success: (function(_this) {
          return function(json) {
            if (json.success) {
              return _this.setState({
                loading: false
              });
            } else {
              return alert("Failed to save");
            }
          };
        })(this),
        error: (function(_this) {
          return function() {
            return alert("Failed to save");
          };
        })(this)
      });
    },
    render: function() {
      var inputProp;
      inputProp = {
        ref: "input",
        className: "form-control editlabel",
        value: this.state.text,
        onChange: this.handleChange,
        onBlur: this.endEdit
      };
      if (this.state.loading) {
        inputProp.disabled = true;
      }
      return input(inputProp);
    }
  });

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
  componentDidUpdate:function(){
    $(document).trigger("result.updated.uwcs", this.state)
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
            $(document).trigger("result.searched.uwcs")
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
        $(document).trigger("course.added.uwcs")
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
        if(getCourseName(term[courseIndex])==courseName){
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
                  (window.editing)?React.DOM.div({className: "col-xs-8"}, React.DOM.button({className: "btn btn-primary btn-block addToListBtn"}, "Add to list")):{}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvaGVscGVycy5jb2ZmZWUiLCJzZWFyY2hJbnB1dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0hBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsQ0FBVixhQUFZLFNBQVosRUFBSDtFQUFBLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxDQUFWLGFBQVksU0FBWixFQUFIO0VBQUEsQ0FEUCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLE1BQVYsYUFBaUIsU0FBakIsRUFBSDtFQUFBLENBRlQsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxHQUFWLGFBQWMsU0FBZCxFQUFIO0VBQUEsQ0FITixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLEVBQVYsYUFBYSxTQUFiLEVBQUg7RUFBQSxDQUpMLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQUssU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsRUFBVixhQUFhLFNBQWIsRUFBSDtFQUFBLENBTEwsQ0FBQTs7QUFBQSxFQU1BLEVBQUEsR0FBSyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxFQUFWLGFBQWEs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QSxDQUFGLENBckpBLENBQUE7QUFBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJhc2ljLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYSA9IC0+IFJlYWN0LkRPTS5hIGFyZ3VtZW50cy4uLlxuYm9sZCA9IC0+IFJlYWN0LkRPTS5iIGFyZ3VtZW50cy4uLlxuYnV0dG9uID0gLT4gUmVhY3QuRE9NLmJ1dHRvbiBhcmd1bWVudHMuLi5cbmRpdiA9IC0+IFJlYWN0LkRPTS5kaXYgYXJndW1lbnRzLi4uXG5oMSA9IC0+IFJlYWN0LkRPTS5oMSBhcmd1bWVudHMuLi5cbmgyID0gLT4gUmVhY3QuRE9NLmgyIGFyZ3VtZW50cy4uLlxuaDMgPSAtPiBSZWFjdC5ET00uaDMgYXJndW1lbnRzLi4uXG5oNCA9IC0+IFJlYWN0LkRPTS5oNCBhcmd1bWVudHMuLi5cbmg1ID0gLT4gUmVhY3QuRE9NLmg1IGFyZ3VtZW50cy4uLlxuaDYgPSAtPiBSZWFjdC5ET00uaDYgYXJndW1lbnRzLi4uXG5pY29uID0gLT4gUmVhY3QuRE9NLmkgYXJndW1lbnRzLi4uXG5pbnB1dCA9IC0+IFJlYWN0LkRPTS5pbnB1dCBhcmd1bWVudHMuLi5cbnAgPSAtPiBSZWFjdC5ET00ucCBhcmd1bWVudHMuLi5cbnNwYW4gPSAtPiBSZWFjdC5ET00uc3BhbiBhcmd1bWVudHMuLi5cbnRhYmxlID0gLT4gUmVhY3QuRE9NLnRhYmxlIGFyZ3VtZW50cy4uLlxudGJvZHkgPSAtPiBSZWFjdC5ET00udGJvZHkgYXJndW1lbnRzLi4uXG50ZCA9IC0+IFJlYWN0LkRPTS50ZCBhcmd1bWVudHMuLi5cbnRoID0gLT4gUmVhY3QuRE9NLnRoIGFyZ3VtZW50cy4uLlxudGhlYWQgPSAtPiBSZWFjdC5ET00udGhlYWQgYXJndW1lbnRzLi4uXG50ciA9IC0+IFJlYWN0LkRPTS50ciBhcmd1bWVudHMuLi5cbnN0cm9uZyA9IC0+IFJlYWN0LkRPTS5zdHJvbmcgYXJndW1lbnRzLi4uXG5cbndpbmRvdy5mYWNlYm9va0Nvbm5lY3QgPSAtPlxuICBGLmNvbm5lY3QgJCgnI2ZhY2Vib29rRm9ybScpLmdldCgwKVxuICBmYWxzZVxuXG53aW5kb3cudXdhcGkgPSBcbiAgY291cnNlSW5mbzogd2luZG93LmRhdGEuY291cnNlSW5mb3x8e30sXG4gIGdldENvdXJzZTogKHN1YmplY3QsIGNhdGFsb2dfbnVtYmVyLCBjYWxsYmFjayktPlxuICAgIGNvdXJzZSA9IHt9XG4gICAgdGhhdCA9IHRoaXNcbiAgICAkLmdldEpTT04oXCIvY291cnNlL1wiK3N1YmplY3QrXCIvXCIrY2F0YWxvZ19udW1iZXIsIChjb3Vyc2UpLT5cbiAgICAgICAgaWYgbm90IGNvdXJzZVxuICAgICAgICAgIGNhbGxiYWNrKG51bGwpXG4gICAgICAgIGNvbnNvbGUubG9nIGNvdXJzZVxuICAgICAgICBpZiBjb3Vyc2UucHJlcmVxdWlzaXRlcyYmY291cnNlLnByZXJlcXVpc2l0ZXMuc3Vic3RyKDAsNyk9PVwiUHJlcmVxOlwiXG4gICAgICAgICAgY291cnNlLnByZXJlcXVpc2l0ZXM9Y291cnNlLnByZXJlcXVpc2l0ZXMuc3Vic3RyKDgpXG4gICAgICAgIGNvdXJzZS5uYW1lPWdldENvdXJzZU5hbWUoY291cnNlKVxuICAgICAgICB0aGF0LmNvdXJzZUluZm9bY291cnNlLm5hbWVdPWNvdXJzZVxuICAgICAgICBjYWxsYmFjayhjb3Vyc2UubmFtZSlcbiAgICApLmZhaWwoLT4gY2FsbGJhY2sobnVsbCkpXG4gIGdldEluZm86IChjb3Vyc2UpLT5cbiAgICBAY291cnNlSW5mb1tnZXRDb3Vyc2VOYW1lKGNvdXJzZSldXG5cbndpbmRvdy5nZXRDb3Vyc2VOYW1lID0gKG9iaikgLT4gXG4gIG9iai5zdWJqZWN0ICsgb2JqLmNhdGFsb2dfbnVtYmVyXG5cbndpbmRvdy5jYWxjdWxhdGVUZXJtID0gKHN0YXJ0WWVhciwgc3RhcnRUZXJtLCBpKSAtPlxuICBzdGFydFllYXIgPSBzdGFydFllYXIgKyBNYXRoLmZsb29yKChzdGFydFRlcm0gKyBpKSAvIDMpXG4gIHN0YXJ0VGVybSA9IChzdGFydFRlcm0gKyBpKSAlIDNcbiAgc3dpdGNoIHN0YXJ0VGVybVxuICAgIHdoZW4gMCB0aGVuIHN0YXJ0WWVhciArIFwiIFdpbnRlclwiXG4gICAgd2hlbiAxIHRoZW4gc3RhcnRZZWFyICsgXCIgU3ByaW5nXCJcbiAgICB3aGVuIDIgdGhlbiBzdGFydFllYXIgKyBcIiBGYWxsXCJcblxud2luZG93LmdldFRlcm1OYW1lQXJyYXkgPSAodGVybXNfb2ZmZXJlZCkgLT5cbiAgdGVybXNfb2ZmZXJlZC5tYXAgKGkpIC0+XG4gICAgc3dpdGNoIGlcbiAgICAgIHdoZW4gXCJGXCIgdGhlbiBcIkZhbGxcIlxuICAgICAgd2hlbiBcIldcIiB0aGVuIFwiV2ludGVyXCJcbiAgICAgIGVsc2UgXCJTcHJpbmdcIlxuXG5cbndpbmRvdy5FZGl0TGFiZWwgPSBSZWFjdC5jcmVhdGVDbGFzc1xuICBnZXRJbml0aWFsU3RhdGU6IC0+XG4gICAgbG9hZGluZzpub1xuICAgIHRleHQ6QHByb3BzLmluaXRpYWxWYWx1ZVxuICBoYW5kbGVDaGFuZ2U6IChlKSAtPlxuICAgIEBzZXRTdGF0ZSB0ZXh0OiBlLnRhcmdldC52YWx1ZVxuICBlbmRFZGl0OiAoZSkgLT5cbiAgICBAc2V0U3RhdGVcbiAgICAgIGxvYWRpbmc6IHllc1xuICAgICQuYWpheFxuICAgICAgdXJsOlwiL3NhdmUvXCIrZGF0YS5jb3Vyc2VQbGFuSWQrXCIvXCJcbiAgICAgIHR5cGU6XCJwb3N0XCJcbiAgICAgIGRhdGFUeXBlOlwianNvblwiXG4gICAgICBkYXRhOlxuICAgICAgICBuYW1lOkBzdGF0ZS50ZXh0LFxuICAgICAgICBjc3JmbWlkZGxld2FyZXRva2VuOmRhdGEuY3NyZl90b2tlblxuICAgICAgc3VjY2VzczooanNvbik9PlxuICAgICAgICBpZihqc29uLnN1Y2Nlc3MpXG4gICAgICAgICAgQHNldFN0YXRlIGxvYWRpbmc6bm9cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIHNhdmVcIilcbiAgICAgIGVycm9yOigpPT5cbiAgICAgICAgYWxlcnQoXCJGYWlsZWQgdG8gc2F2ZVwiKVxuICByZW5kZXI6IC0+XG4gICAgaW5wdXRQcm9wID1cbiAgICAgIHJlZjogXCJpbnB1dFwiXG4gICAgICBjbGFzc05hbWU6XCJmb3JtLWNvbnRyb2wgZWRpdGxhYmVsXCJcbiAgICAgIHZhbHVlOkBzdGF0ZS50ZXh0XG4gICAgICBvbkNoYW5nZTpAaGFuZGxlQ2hhbmdlXG4gICAgICBvbkJsdXI6QGVuZEVkaXRcbiAgICBpZiBAc3RhdGUubG9hZGluZ1xuICAgICAgaW5wdXRQcm9wLmRpc2FibGVkID0geWVzXG4gICAgaW5wdXQoaW5wdXRQcm9wKVxuXG5cblByZXZpZXcgPSBSZWFjdC5jcmVhdGVDbGFzc1xuICBnZXRJbml0aWFsU3RhdGU6IC0+XG4gICAgdG9wOjBcbiAgICBsZWZ0OjBcbiAgICBodG1sOlwiXCJcbiAgICBzaG93Om5vXG4gIGNvbXBvbmVudERpZE1vdW50OiAoKSAtPlxuICAgICQod2luZG93KS5vbiAnbW91c2Vtb3ZlJywgQGhhbmRsZU1vdXNlTW92ZVxuICAgIHdpbmRvdy5zaG93UHJldmlldyA9IEBzaG93UHJldmlld1xuICAgIHdpbmRvdy5zaG93Q291cnNlUHJldmlldyA9IEBzaG93Q291cnNlUHJldmlld1xuICAgIHdpbmRvdy5oaWRlUHJldmlldyA9IEBoaWRlUHJldmlld1xuICBjb21wb25lbnRXaWxsVW5tb3VudDogKCkgLT5cbiAgICAkKHdpbmRvdykub2ZmICdtb3VzZW1vdmUnLCBAaGFuZGxlTW91c2VNb3ZlXG4gIGhhbmRsZU1vdXNlTW92ZTooZSktPlxuICAgIGlmIEBzdGF0ZS5zaG93XG4gICAgICBAc2V0U3RhdGVcbiAgICAgICAgdG9wOmUuY2xpZW50WSsyMFxuICAgICAgICBsZWZ0OmUuY2xpZW50WCsxNVxuICBzaG93Q291cnNlUHJldmlldzogKGNvdXJzZSk9PlxuICAgIGNvdXJzZSA9IHV3YXBpLmdldEluZm8gY291cnNlXG4gICAgaHRtbCA9IFxuICAgICAgZGl2KG51bGwsXG4gICAgICAgIGgzKG51bGwsXG4gICAgICAgICAgc3Ryb25nKG51bGwsIGNvdXJzZS5uYW1lKSxcbiAgICAgICAgICBcIiAtIFwiLFxuICAgICAgICAgIGNvdXJzZS50aXRsZSksXG4gICAgICAgIHAobnVsbCwgY291cnNlLmRlc2NyaXB0aW9uKVxuICAgICAgICBwKG51bGwsXG4gICAgICAgICAgc3Ryb25nKG51bGwsIFwiQW50aXJlcTogXCIpLFxuICAgICAgICAgIGNvdXJzZS5hbnRpcmVxdWlzaXRlfHxcIm5vbmVcIiksXG4gICAgICAgIHAobnVsbCxcbiAgICAgICAgICBzdHJvbmcobnVsbCwgXCJQcmVyZXE6IFwiKSxcbiAgICAgICAgICBjb3Vyc2UucHJlcmVxdWlzaXRlc3x8XCJub25lXCIpLFxuICAgICAgICBwKG51bGwsXG4gICAgICAgICAgc3Ryb25nKG51bGwsIFwiVGVybXMgb2ZmZXJlZDogXCIpLFxuICAgICAgICAgIGdldFRlcm1OYW1lQXJyYXkoY291cnNlLnRlcm1zX29mZmVyZWQpLmpvaW4oXCIsIFwiKSkpXG4gICAgQHNob3dQcmV2aWV3IGh0bWxcbiAgc2hvd1ByZXZpZXc6IChkYXRhKSAtPlxuICAgIEBzZXRTdGF0ZSBcbiAgICAgIGh0bWw6ZGF0YVxuICAgICAgc2hvdzp5ZXNcbiAgaGlkZVByZXZpZXc6IC0+XG4gICAgQHNldFN0YXRlIHNob3c6bm9cbiAgcmVuZGVyOiAtPlxuICAgIGRpdih7XG4gICAgICBjbGFzc05hbWU6IFwicHJldmlldyBcIisoaWYgQHN0YXRlLnNob3cgdGhlbiBcIiBzaG93XCIgZWxzZSBcIlwiKVxuICAgICAgc3R5bGU6XG4gICAgICAgIHRvcDpAc3RhdGUudG9wXG4gICAgICAgIGxlZnQ6QHN0YXRlLmxlZnRcbiAgICAgIH0sIEBzdGF0ZS5odG1sKVxuXG4kKC0+XG4gICQoJ2JvZHknKS5hcHBlbmQgJChcIjxkaXYgaWQ9J3ByZXZpZXcnPjwvZGl2PlwiKVxuICBSZWFjdC5yZW5kZXJDb21wb25lbnQgUHJldmlldyhudWxsKSwgJChcIiNwcmV2aWV3XCIpLmdldCgwKVxuKVxuXG4iLCJcbkFkZENvdXJzZU1vZGFsPVJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge2lucHV0OlwiXCIsZm9jdXM6ZmFsc2UsbG9hZGluZzpmYWxzZSxzZWFyY2hlZDpmYWxzZSxzdWJqZWN0OlwiXCIsY2F0YWxvZ19udW1iZXI6XCJcIixtZXNzYWdlOlwiXCIsZGF0YUxpc3Q6W10sZGF0YUxpc3RTZWxlY3RlZDowLCBkYXRhTGlzdFR5cGU6XCJOb25lXCJ9O1xuICB9LFxuICBjb21wb25lbnREaWRVcGRhdGU6ZnVuY3Rpb24oKXtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwicmVzdWx0LnVwZGF0ZWQudXdjc1wiLCB0aGlzLnN0YXRlKVxuICB9LFxuICBjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpe1xuICAgICQoXCJib2R5XCIpLm9uKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICQoXCIubmF2YmFyLWZvcm1cIikub24oJ21vdXNlZG93bicsIHRoaXMuYmxvY2tDbGljayk7XG4gICAgJChcIi5kZWxldGVCdG5cIikudG9vbHRpcCh7Y29udGFpbmVyOicubmF2YmFyJ30pXG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAkKFwiYm9keVwiKS5vZmYoJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgJChcIi5uYXZiYXItZm9ybVwiKS5vbignbW91c2Vkb3duJywgdGhpcy5ibG9ja0NsaWNrKTtcbiAgfSxcbiAgaGFuZGxlU3VibWl0OmZ1bmN0aW9uKGUpe1xuICAgIGlmKGUpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3QubGVuZ3RoPjApe1xuICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zdGF0ZS5kYXRhTGlzdFt0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWRdXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJTdWJqZWN0XCIpe1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdDpzZWxlY3RlZC5jb3Vyc2VzLCBkYXRhTGlzdFNlbGVjdGVkOjAsIGlucHV0OnNlbGVjdGVkLm5hbWUsc3ViamVjdDpzZWxlY3RlZC5uYW1lLCBkYXRhTGlzdFR5cGU6XCJDb3Vyc2VcIiwgbWVzc2FnZTpcIlwifSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiQ291cnNlXCIpe1xuICAgICAgICB0aGF0LnNldFN0YXRlKHtsb2FkaW5nOnRydWUsY2F0YWxvZ19udW1iZXI6c2VsZWN0ZWQuY2F0YWxvZ19udW1iZXIsaW5wdXQ6dGhpcy5zdGF0ZS5zdWJqZWN0K3NlbGVjdGVkLmNhdGFsb2dfbnVtYmVyfSk7XG4gICAgICAgIHV3YXBpLmdldENvdXJzZSh0aGlzLnN0YXRlLnN1YmplY3Qsc2VsZWN0ZWQuY2F0YWxvZ19udW1iZXIsZnVuY3Rpb24oY291cnNlKXtcbiAgICAgICAgICBpZihjb3Vyc2Upe1xuICAgICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzpmYWxzZSxzZWFyY2hlZDp0cnVlLG1lc3NhZ2U6XCJcIixkYXRhTGlzdFR5cGU6XCJOb25lXCIsZGF0YUxpc3Q6XCJcIn0pO1xuICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcInJlc3VsdC5zZWFyY2hlZC51d2NzXCIpXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtsb2FkaW5nOmZhbHNlLHNlYXJjaGVkOnRydWUsZGF0YUxpc3RUeXBlOlwiTm9uZVwiLGRhdGFMaXN0OlwiXCIsbWVzc2FnZTpcIkVycm9yIGxvYWRpbmcgY291cnNlIGluZm9cIn0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLnNlYXJjaGVkJiZ0aGlzLnN0YXRlLm1lc3NhZ2U9PVwiXCImJndpbmRvdy5lZGl0aW5nKXtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlYXJjaGVkOmZhbHNlLGlucHV0OlwiXCIsc3ViamVjdDpcIlwiLGNhdGFsb2dfbnVtYmVyOlwiXCJ9KVxuICAgICAgdGhpcy5oYW5kbGVBZGRDb3Vyc2UoZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgaGFuZGxlQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBpbnB1dFZhbHVlPWUudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCk7XG4gICAgc3ViamVjdD1pbnB1dFZhbHVlLm1hdGNoKC9eXFxEKy8pO1xuICAgIGNhdGFsb2dfbnVtYmVyPXN1YmplY3Q/aW5wdXRWYWx1ZS5zdWJzdHIoc3ViamVjdFswXS5sZW5ndGgpOlwiXCI7XG4gICAgc3ViamVjdD0oc3ViamVjdCk/c3ViamVjdFswXS5yZXBsYWNlKC8gL2csJycpOlwiXCI7XG4gICAgY2F0YWxvZ19udW1iZXI9Y2F0YWxvZ19udW1iZXIucmVwbGFjZSgvIC9nLCcnKTtcbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICBmb2N1czp0cnVlLFxuICAgICAgaW5wdXQ6aW5wdXRWYWx1ZSxcbiAgICAgIHN1YmplY3Q6c3ViamVjdCxcbiAgICAgIGNhdGFsb2dfbnVtYmVyOmNhdGFsb2dfbnVtYmVyLFxuICAgICAgc2VhcmNoZWQ6ZmFsc2UsXG4gICAgICBtZXNzYWdlOlwiXCJcbiAgICB9XG4gICAgaWYoc3ViamVjdCE9XCJcIil7XG4gICAgICB2YXIgbWF0Y2hlZFN1YmplY3RzID0gYWxsU3ViamVjdHMuZmlsdGVyKGZ1bmN0aW9uKHN1YmplY3REYXRhKXtcbiAgICAgICAgcmV0dXJuIHN1YmplY3REYXRhLm5hbWUubGFzdEluZGV4T2Yoc3ViamVjdCwgMCkgPT09IDBcbiAgICAgIH0pXG4gICAgICBpZihtYXRjaGVkU3ViamVjdHMubGVuZ3RoPjAmJm1hdGNoZWRTdWJqZWN0c1swXS5uYW1lPT1zdWJqZWN0JiZjYXRhbG9nX251bWJlciE9XCJcIil7XG4gICAgICAgIHN0YXRlLmRhdGFMaXN0PW1hdGNoZWRTdWJqZWN0c1swXS5jb3Vyc2VzLmZpbHRlcihmdW5jdGlvbihjb3Vyc2VEYXRhKXtcbiAgICAgICAgICByZXR1cm4gY291cnNlRGF0YS5jYXRhbG9nX251bWJlci5sYXN0SW5kZXhPZihjYXRhbG9nX251bWJlciwgMCkgPT09IDBcbiAgICAgICAgfSlcbiAgICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiQ291cnNlXCJcbiAgICAgIH1lbHNle1xuICAgICAgICBzdGF0ZS5kYXRhTGlzdD1tYXRjaGVkU3ViamVjdHNcbiAgICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiU3ViamVjdFwiXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBzdGF0ZS5kYXRhTGlzdFR5cGU9XCJOb25lXCJcbiAgICB9XG4gICAgaWYodGhpcy5zdGF0ZS5pbnB1dCE9aW5wdXRWYWx1ZSl7XG4gICAgICBzdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPTBcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSxmdW5jdGlvbigpe1xuICAgICAgJCgnLnNlYXJjaFJlc3VsdCAuY29udGFpbmVyJykuc2Nyb2xsVG9wKDApXG4gICAgfSk7XG4gIH0sXG4gIGhhbmRsZUJsdXI6ZnVuY3Rpb24oZSl7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Zm9jdXM6ZmFsc2V9KVxuICB9LFxuICBoYW5kbGVGb2N1czpmdW5jdGlvbihlKXtcbiAgICB0aGlzLnNldFN0YXRlKHtmb2N1czp0cnVlfSlcbiAgfSxcbiAgaGFuZGxlQWRkQ291cnNlOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBjb3Vyc2UgPSB7XG4gICAgICBzdWJqZWN0OnRoaXMuc3RhdGUuc3ViamVjdCxcbiAgICAgIGNhdGFsb2dfbnVtYmVyOnRoaXMuc3RhdGUuY2F0YWxvZ19udW1iZXJcbiAgICB9XG4gICAgaWYod2luZG93LmVkaXRpbmcpe1xuICAgICAgaWYoaGFzQ291cnNlKGNvdXJzZSkpe1xuICAgICAgICBhbGVydChcIkNvdXJzZSBhbHJlYWR5IGFkZGVkXCIpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZGF0YS5jb3Vyc2VMaXN0LnB1c2goY291cnNlKVxuICAgICAgICBhbmltYXRlRWxlbSA9ICQoXCIuc2VhcmNoUmVzdWx0XCIpLmNsb25lKCkuYWRkQ2xhc3MoXCJhbmltYXRlLWNvdXJzZVwiKVxuICAgICAgICBhbmltYXRlRWxlbS5yZW1vdmVBdHRyKFwiZGF0YS1yZWFjdGlkXCIpLmZpbmQoXCJbZGF0YS1yZWFjdGlkXVwiKS5yZW1vdmVBdHRyKFwiZGF0YS1yZWFjdGlkXCIpXG4gICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChhbmltYXRlRWxlbSlcbiAgICAgICAgYW5pbWF0ZUVsZW0uY3NzKHtcbiAgICAgICAgICB0b3A6JChcIi5zZWFyY2hSZXN1bHRcIikub2Zmc2V0KCkudG9wLFxuICAgICAgICAgIGxlZnQ6JChcIi5zZWFyY2hSZXN1bHRcIikub2Zmc2V0KCkubGVmdCxcbiAgICAgICAgICB3aWR0aDokKFwiLnNlYXJjaFJlc3VsdFwiKS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgaGVpZ2h0OiQoXCIuc2VhcmNoUmVzdWx0XCIpLm91dGVySGVpZ2h0KClcbiAgICAgICAgfSkuYW5pbWF0ZSh7XG4gICAgICAgICAgdG9wOiQoXCIuYnVja2V0IC5tb3ZlQmxvY2tcIikub2Zmc2V0KCkudG9wLFxuICAgICAgICAgIGxlZnQ6JChcIi5idWNrZXQgLm1vdmVCbG9ja1wiKS5vZmZzZXQoKS5sZWZ0LFxuICAgICAgICAgIHdpZHRoOiQoXCIuYnVja2V0IC5tb3ZlQmxvY2tcIikub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgIGhlaWdodDokKFwiLmJ1Y2tldCAubW92ZUJsb2NrXCIpLm91dGVySGVpZ2h0KClcbiAgICAgICAgfSwgNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGFuaW1hdGVFbGVtLnJlbW92ZSgpXG4gICAgICAgIH0pXG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJkYXRhVXBkYXRlZFwiKVxuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwiY291cnNlLmFkZGVkLnV3Y3NcIilcbiAgICAgICAgJChcIiNzZWFyY2hJbnB1dFwiKS5mb2N1cygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBibG9ja0NsaWNrOmZ1bmN0aW9uKGUpe1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG4gIGRyb3A6ZnVuY3Rpb24oZSl7XG4gICAgdmFyIGNvdXJzZU5hbWUgPSBlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9jb3Vyc2VcIilcbiAgICBmb3IgKHZhciB0ZXJtSW5kZXggPSAtMTsgdGVybUluZGV4IDwgZGF0YS5zY2hlZHVsZS5sZW5ndGg7IHRlcm1JbmRleCsrKSB7XG4gICAgICB2YXIgdGVybSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClcbiAgICAgIGZvciAodmFyIGNvdXJzZUluZGV4ID0gMDsgY291cnNlSW5kZXggPCB0ZXJtLmxlbmd0aDsgY291cnNlSW5kZXgrKykge1xuICAgICAgICBpZihnZXRDb3Vyc2VOYW1lKHRlcm1bY291cnNlSW5kZXhdKT09Y291cnNlTmFtZSl7XG4gICAgICAgICAgdGVybS5zcGxpY2UoY291cnNlSW5kZXgsMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gIH0sXG4gIGRyYWdPdmVyOmZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSxcbiAgaGFuZGxlS2V5ZG93bjpmdW5jdGlvbihlKXtcbiAgICBzY3JvbGxlZCA9IGZhbHNlXG4gICAgaWYoZS5rZXlDb2RlPT00MCl7Ly9kb3duXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ8dGhpcy5zdGF0ZS5kYXRhTGlzdC5sZW5ndGgtMSlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3RTZWxlY3RlZDp0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQrMX0sZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoKCQoXCIuc3VnZ2VzdGlvbi5hY3RpdmVcIikuaW5kZXgoKS01KSoyOClcbiAgICAgICAgfSlcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIH1lbHNlIGlmKGUua2V5Q29kZT09Mzgpey8vdXBcbiAgICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD4wKVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdFNlbGVjdGVkOnRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZC0xfSxmdW5jdGlvbigpe1xuICAgICAgICAgICQoJy5zZWFyY2hSZXN1bHQgLmNvbnRhaW5lcicpLnNjcm9sbFRvcCgoJChcIi5zdWdnZXN0aW9uLmFjdGl2ZVwiKS5pbmRleCgpLTUpKjI4KVxuICAgICAgICB9KVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfVxuICB9LFxuICBoYW5kbGVDbGljazpmdW5jdGlvbihpbmRleFNlbGVjdGVkKXtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0U2VsZWN0ZWQ6aW5kZXhTZWxlY3RlZH0sZnVuY3Rpb24oKXtcbiAgICAgICQoXCIjc2VhcmNoSW5wdXRcIikuZm9jdXMoKVxuICAgICAgdGhhdC5oYW5kbGVTdWJtaXQoKVxuICAgIH0pXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNOYW1lID0gXCJzZWFyY2hSZXN1bHRcIisodGhpcy5zdGF0ZS5mb2N1cz9cIlwiOlwiIGhpZGVVcFwiKVxuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZih0aGlzLnN0YXRlLm1lc3NhZ2UhPVwiXCIpe1xuICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLm1lc3NhZ2V9XG4gICAgICAgICAgICAgIDwvZGl2PilcbiAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLnNlYXJjaGVkKXtcbiAgICAgIHZhciBjb3Vyc2U9dXdhcGkuZ2V0SW5mbyh7c3ViamVjdDp0aGlzLnN0YXRlLnN1YmplY3QsXG4gICAgICAgIGNhdGFsb2dfbnVtYmVyOnRoaXMuc3RhdGUuY2F0YWxvZ19udW1iZXJ9KTtcbiAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8aDM+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj17Y291cnNlLnVybH0+e2NvdXJzZS5zdWJqZWN0K1wiIFwiK2NvdXJzZS5jYXRhbG9nX251bWJlcitcIiAtIFwiK2NvdXJzZS50aXRsZX08L2E+PC9oMz5cbiAgICAgICAgICAgICAgICA8cD57Y291cnNlLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+QW50aXJlcTogPC9zdHJvbmc+e2NvdXJzZS5hbnRpcmVxdWlzaXRlfHxcIm5vbmVcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+UHJlcmVxOiA8L3N0cm9uZz57Y291cnNlLnByZXJlcXVpc2l0ZXN8fFwibm9uZVwifTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5UZXJtcyBvZmZlcmVkOiA8L3N0cm9uZz57Z2V0VGVybU5hbWVBcnJheShjb3Vyc2UudGVybXNfb2ZmZXJlZCkuam9pbihcIiwgXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHVsbC1yaWdodCBjb2wteHMtMTIgY29sLW1kLTZcIj5cbiAgICAgICAgICAgICAgICAgIHsoJChcIiNhZG1pbi1idG5cIikubGVuZ3RoKT88ZGl2IGNsYXNzTmFtZT1cImNvbC14cy00XCI+PGEgY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1ibG9ja1wiIGhyZWY9e1wiL2FkbWluL2FwcC9jb3Vyc2UvXCIrY291cnNlLmlkfT5FZGl0PC9hPjwvZGl2Pjp7fX1cbiAgICAgICAgICAgICAgICAgIHsod2luZG93LmVkaXRpbmcpPzxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLThcIj48YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeSBidG4tYmxvY2sgYWRkVG9MaXN0QnRuXCI+QWRkIHRvIGxpc3Q8L2J1dHRvbj48L2Rpdj46e319XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgfWVsc2V7XG4gICAgICAvL3Nob3cgc3VnZ2VzdGlvblxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5zdGF0ZS5kYXRhTGlzdFxuICAgICAgICB2YXIgc3ViamVjdEVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihzdWJqZWN0LGkpe1xuICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcInN1Z2dlc3Rpb25cIisodGhhdC5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPT1pP1wiIGFjdGl2ZVwiOlwiXCIpfSBvbkNsaWNrPXt0aGF0LmhhbmRsZUNsaWNrLmJpbmQodGhhdCxpKX0+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e3N1YmplY3QubmFtZX08L3N0cm9uZz4gLSB7c3ViamVjdC5kZXNjcmlwdGlvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICB7c3ViamVjdEVscy5sZW5ndGg+MD9zdWJqZWN0RWxzOihcbiAgICAgICAgICAgICAgXCJTdWJqZWN0IG5vdCBmb3VuZCBcIit0aGF0LnN0YXRlLnN1YmplY3RcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJDb3Vyc2VcIil7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RcbiAgICAgICAgdmFyIGNvdXJzZUVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihjb3Vyc2UsaSl7XG4gICAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e1wic3VnZ2VzdGlvblwiKyh0aGF0LnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ9PWk/XCIgYWN0aXZlXCI6XCJcIil9IG9uQ2xpY2s9e3RoYXQuaGFuZGxlQ2xpY2suYmluZCh0aGF0LGkpfT5cbiAgICAgICAgICAgICAgPHN0cm9uZz57dGhhdC5zdGF0ZS5zdWJqZWN0K2NvdXJzZS5jYXRhbG9nX251bWJlcn08L3N0cm9uZz4gLSB7Y291cnNlLnRpdGxlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiID5cbiAgICAgICAgICAgIHtjb3Vyc2VFbHMubGVuZ3RoPjA/Y291cnNlRWxzOihcbiAgICAgICAgICAgICAgXCJDb3Vyc2Ugbm90IGZvdW5kOiBcIit0aGF0LnN0YXRlLnN1YmplY3QrXCIgXCIrdGhhdC5zdGF0ZS5jYXRhbG9nX251bWJlclxuICAgICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgIH1lbHNle1xuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICBFbnRlciBDb3Vyc2UgQ29kZTogaS5lIDxzdHJvbmc+Q1MyNDE8L3N0cm9uZz4sIDxzdHJvbmc+RU5HTDEwOTwvc3Ryb25nPiwgLi4uXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4oXG4gICAgICA8Zm9ybSBjbGFzc05hbWU9XCJuYXZiYXItZm9ybSBuYXZiYXItbGVmdFwiIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc2VhcmNoSW5wdXQnIHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPSdTZWFyY2ggZm9yIENvdXJzZScgY2xhc3NOYW1lPXsnZm9ybS1jb250cm9sJysodGhpcy5zdGF0ZS5mb2N1cz9cIiBmb2N1c2VkXCI6XCJcIil9IHZhbHVlPXt0aGlzLnN0YXRlLmlucHV0fSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2V9IG9uRm9jdXM9e3RoaXMuaGFuZGxlRm9jdXN9IHJlZj1cInNlYXJjaElucHV0XCIgb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleWRvd259Lz5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9e1wiZmEgZmEtc3BpbiBmYS1zcGlubmVyIHNlYXJjaEluZGljYXRvciBcIisodGhpcy5zdGF0ZS5sb2FkaW5nP1wiXCI6XCJoaWRlXCIpfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyh3aW5kb3cuZWRpdGluZyk/PGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwIGRlbGV0ZUJ0blwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIHRpdGxlPVwiRHJhZyBjb3Vyc2UgaGVyZSB0byBkZWxldGVcIiBkYXRhLXBsYWNlbWVudD1cImJvdHRvbVwiIHJlZj1cImRlbGV0ZUJ0blwiIG9uRHJvcD17dGhpcy5kcm9wfSBvbkRyYWdPdmVyPXt0aGlzLmRyYWdPdmVyfT5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9XCJwZS03cy10cmFzaCBmYS1md1wiLz5cbiAgICAgICAgPC9kaXY+Ont9fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y05hbWV9ID5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxufSlcblxuXG5cbiQoZnVuY3Rpb24oKXtcbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFxuICAgIDxBZGRDb3Vyc2VNb2RhbCAvPixcbiAgICAkKFwiI3NlYXJjaEJ0bldyYXBwZXJcIikuZ2V0KDApXG4gICk7XG59KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==