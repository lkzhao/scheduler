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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvaGVscGVycy5jb2ZmZWUiLCJzZWFyY2hJbnB1dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0hBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsQ0FBVixhQUFZLFNBQVosRUFBSDtFQUFBLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxDQUFWLGFBQVksU0FBWixFQUFIO0VBQUEsQ0FEUCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLE1BQVYsYUFBaUIsU0FBakIsRUFBSDtFQUFBLENBRlQsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxHQUFWLGFBQWMsU0FBZCxFQUFIO0VBQUEsQ0FITixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLFNBQUEsR0FBQTtBQUFHLFFBQUEsSUFBQTtXQUFBLFFBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBUyxDQUFDLEVBQVYsYUFBYSxTQUFiLEVBQUg7RUFBQSxDQUpMLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQUssU0FBQSxHQUFBO0FBQUcsUUFBQSxJQUFBO1dBQUEsUUFBQSxLQUFLLENBQUMsR0FBTixDQUFTLENBQUMsRUFBVixhQUFhLFNBQWIsRUFBSDtFQUFBLENBTEwsQ0FBQTs7QUFBQSxFQU1BLEVBQUEsR0FBSyxTQUFBLEdBQUE7QUFBRyxRQUFBLElBQUE7V0FBQSxRQUFBLEtBQUssQ0FBQyxHQUFOLENBQVMsQ0FBQyxFQUFWLGFBQWEs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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJiYXNpYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImEgPSAtPiBSZWFjdC5ET00uYSBhcmd1bWVudHMuLi5cbmJvbGQgPSAtPiBSZWFjdC5ET00uYiBhcmd1bWVudHMuLi5cbmJ1dHRvbiA9IC0+IFJlYWN0LkRPTS5idXR0b24gYXJndW1lbnRzLi4uXG5kaXYgPSAtPiBSZWFjdC5ET00uZGl2IGFyZ3VtZW50cy4uLlxuaDEgPSAtPiBSZWFjdC5ET00uaDEgYXJndW1lbnRzLi4uXG5oMiA9IC0+IFJlYWN0LkRPTS5oMiBhcmd1bWVudHMuLi5cbmgzID0gLT4gUmVhY3QuRE9NLmgzIGFyZ3VtZW50cy4uLlxuaDQgPSAtPiBSZWFjdC5ET00uaDQgYXJndW1lbnRzLi4uXG5oNSA9IC0+IFJlYWN0LkRPTS5oNSBhcmd1bWVudHMuLi5cbmg2ID0gLT4gUmVhY3QuRE9NLmg2IGFyZ3VtZW50cy4uLlxuaWNvbiA9IC0+IFJlYWN0LkRPTS5pIGFyZ3VtZW50cy4uLlxuaW5wdXQgPSAtPiBSZWFjdC5ET00uaW5wdXQgYXJndW1lbnRzLi4uXG5wID0gLT4gUmVhY3QuRE9NLnAgYXJndW1lbnRzLi4uXG5zcGFuID0gLT4gUmVhY3QuRE9NLnNwYW4gYXJndW1lbnRzLi4uXG50YWJsZSA9IC0+IFJlYWN0LkRPTS50YWJsZSBhcmd1bWVudHMuLi5cbnRib2R5ID0gLT4gUmVhY3QuRE9NLnRib2R5IGFyZ3VtZW50cy4uLlxudGQgPSAtPiBSZWFjdC5ET00udGQgYXJndW1lbnRzLi4uXG50aCA9IC0+IFJlYWN0LkRPTS50aCBhcmd1bWVudHMuLi5cbnRoZWFkID0gLT4gUmVhY3QuRE9NLnRoZWFkIGFyZ3VtZW50cy4uLlxudHIgPSAtPiBSZWFjdC5ET00udHIgYXJndW1lbnRzLi4uXG5zdHJvbmcgPSAtPiBSZWFjdC5ET00uc3Ryb25nIGFyZ3VtZW50cy4uLlxuXG53aW5kb3cuZmFjZWJvb2tDb25uZWN0ID0gLT5cbiAgRi5jb25uZWN0ICQoJyNmYWNlYm9va0Zvcm0nKS5nZXQoMClcbiAgZmFsc2Vcblxud2luZG93LnV3YXBpID0gXG4gIGNvdXJzZUluZm86IHdpbmRvdy5kYXRhLmNvdXJzZUluZm98fHt9LFxuICBnZXRDb3Vyc2U6IChzdWJqZWN0LCBjYXRhbG9nX251bWJlciwgY2FsbGJhY2spLT5cbiAgICBjb3Vyc2UgPSB7fVxuICAgIHRoYXQgPSB0aGlzXG4gICAgJC5nZXRKU09OKFwiL2NvdXJzZS9cIitzdWJqZWN0K1wiL1wiK2NhdGFsb2dfbnVtYmVyLCAoY291cnNlKS0+XG4gICAgICAgIGlmIG5vdCBjb3Vyc2VcbiAgICAgICAgICBjYWxsYmFjayhudWxsKVxuICAgICAgICBjb25zb2xlLmxvZyBjb3Vyc2VcbiAgICAgICAgaWYgY291cnNlLnByZXJlcXVpc2l0ZXMmJmNvdXJzZS5wcmVyZXF1aXNpdGVzLnN1YnN0cigwLDcpPT1cIlByZXJlcTpcIlxuICAgICAgICAgIGNvdXJzZS5wcmVyZXF1aXNpdGVzPWNvdXJzZS5wcmVyZXF1aXNpdGVzLnN1YnN0cig4KVxuICAgICAgICBjb3Vyc2UubmFtZT1nZXRDb3Vyc2VOYW1lKGNvdXJzZSlcbiAgICAgICAgdGhhdC5jb3Vyc2VJbmZvW2NvdXJzZS5uYW1lXT1jb3Vyc2VcbiAgICAgICAgY2FsbGJhY2soY291cnNlLm5hbWUpXG4gICAgKS5mYWlsKC0+IGNhbGxiYWNrKG51bGwpKVxuICBnZXRJbmZvOiAoY291cnNlKS0+XG4gICAgQGNvdXJzZUluZm9bZ2V0Q291cnNlTmFtZShjb3Vyc2UpXVxuXG53aW5kb3cuZ2V0Q291cnNlTmFtZSA9IChvYmopIC0+IFxuICBvYmouc3ViamVjdCArIG9iai5jYXRhbG9nX251bWJlclxuXG53aW5kb3cuY2FsY3VsYXRlVGVybSA9IChzdGFydFllYXIsIHN0YXJ0VGVybSwgaSkgLT5cbiAgc3RhcnRZZWFyID0gc3RhcnRZZWFyICsgTWF0aC5mbG9vcigoc3RhcnRUZXJtICsgaSkgLyAzKVxuICBzdGFydFRlcm0gPSAoc3RhcnRUZXJtICsgaSkgJSAzXG4gIHN3aXRjaCBzdGFydFRlcm1cbiAgICB3aGVuIDAgdGhlbiBzdGFydFllYXIgKyBcIiBXaW50ZXJcIlxuICAgIHdoZW4gMSB0aGVuIHN0YXJ0WWVhciArIFwiIFNwcmluZ1wiXG4gICAgd2hlbiAyIHRoZW4gc3RhcnRZZWFyICsgXCIgRmFsbFwiXG5cbndpbmRvdy5nZXRUZXJtTmFtZUFycmF5ID0gKHRlcm1zX29mZmVyZWQpIC0+XG4gIHRlcm1zX29mZmVyZWQubWFwIChpKSAtPlxuICAgIHN3aXRjaCBpXG4gICAgICB3aGVuIFwiRlwiIHRoZW4gXCJGYWxsXCJcbiAgICAgIHdoZW4gXCJXXCIgdGhlbiBcIldpbnRlclwiXG4gICAgICBlbHNlIFwiU3ByaW5nXCJcblxuUHJldmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzXG4gIGdldEluaXRpYWxTdGF0ZTogLT5cbiAgICB0b3A6MFxuICAgIGxlZnQ6MFxuICAgIGh0bWw6XCJcIlxuICAgIHNob3c6bm9cbiAgY29tcG9uZW50RGlkTW91bnQ6ICgpIC0+XG4gICAgJCh3aW5kb3cpLm9uICdtb3VzZW1vdmUnLCBAaGFuZGxlTW91c2VNb3ZlXG4gICAgd2luZG93LnNob3dQcmV2aWV3ID0gQHNob3dQcmV2aWV3XG4gICAgd2luZG93LnNob3dDb3Vyc2VQcmV2aWV3ID0gQHNob3dDb3Vyc2VQcmV2aWV3XG4gICAgd2luZG93LmhpZGVQcmV2aWV3ID0gQGhpZGVQcmV2aWV3XG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiAoKSAtPlxuICAgICQod2luZG93KS5vZmYgJ21vdXNlbW92ZScsIEBoYW5kbGVNb3VzZU1vdmVcbiAgaGFuZGxlTW91c2VNb3ZlOihlKS0+XG4gICAgaWYgQHN0YXRlLnNob3dcbiAgICAgIEBzZXRTdGF0ZVxuICAgICAgICB0b3A6ZS5jbGllbnRZKzIwXG4gICAgICAgIGxlZnQ6ZS5jbGllbnRYKzE1XG4gIHNob3dDb3Vyc2VQcmV2aWV3OiAoY291cnNlKT0+XG4gICAgY291cnNlID0gdXdhcGkuZ2V0SW5mbyBjb3Vyc2VcbiAgICBodG1sID0gXG4gICAgICBkaXYobnVsbCxcbiAgICAgICAgaDMobnVsbCxcbiAgICAgICAgICBzdHJvbmcobnVsbCwgY291cnNlLm5hbWUpLFxuICAgICAgICAgIFwiIC0gXCIsXG4gICAgICAgICAgY291cnNlLnRpdGxlKSxcbiAgICAgICAgcChudWxsLCBjb3Vyc2UuZGVzY3JpcHRpb24pXG4gICAgICAgIHAobnVsbCxcbiAgICAgICAgICBzdHJvbmcobnVsbCwgXCJBbnRpcmVxOiBcIiksXG4gICAgICAgICAgY291cnNlLmFudGlyZXF1aXNpdGV8fFwibm9uZVwiKSxcbiAgICAgICAgcChudWxsLFxuICAgICAgICAgIHN0cm9uZyhudWxsLCBcIlByZXJlcTogXCIpLFxuICAgICAgICAgIGNvdXJzZS5wcmVyZXF1aXNpdGVzfHxcIm5vbmVcIiksXG4gICAgICAgIHAobnVsbCxcbiAgICAgICAgICBzdHJvbmcobnVsbCwgXCJUZXJtcyBvZmZlcmVkOiBcIiksXG4gICAgICAgICAgZ2V0VGVybU5hbWVBcnJheShjb3Vyc2UudGVybXNfb2ZmZXJlZCkuam9pbihcIiwgXCIpKSlcbiAgICBAc2hvd1ByZXZpZXcgaHRtbFxuICBzaG93UHJldmlldzogKGRhdGEpIC0+XG4gICAgQHNldFN0YXRlIFxuICAgICAgaHRtbDpkYXRhXG4gICAgICBzaG93Onllc1xuICBoaWRlUHJldmlldzogLT5cbiAgICBAc2V0U3RhdGUgc2hvdzpub1xuICByZW5kZXI6IC0+XG4gICAgZGl2KHtcbiAgICAgIGNsYXNzTmFtZTogXCJwcmV2aWV3IFwiKyhpZiBAc3RhdGUuc2hvdyB0aGVuIFwiIHNob3dcIiBlbHNlIFwiXCIpXG4gICAgICBzdHlsZTpcbiAgICAgICAgdG9wOkBzdGF0ZS50b3BcbiAgICAgICAgbGVmdDpAc3RhdGUubGVmdFxuICAgICAgfSwgQHN0YXRlLmh0bWwpXG5cbiQoLT5cbiAgJCgnYm9keScpLmFwcGVuZCAkKFwiPGRpdiBpZD0ncHJldmlldyc+PC9kaXY+XCIpXG4gIFJlYWN0LnJlbmRlckNvbXBvbmVudCBQcmV2aWV3KG51bGwpLCAkKFwiI3ByZXZpZXdcIikuZ2V0KDApXG4pXG5cbiIsIlxuQWRkQ291cnNlTW9kYWw9UmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7aW5wdXQ6XCJcIixmb2N1czpmYWxzZSxsb2FkaW5nOmZhbHNlLHNlYXJjaGVkOmZhbHNlLHN1YmplY3Q6XCJcIixjYXRhbG9nX251bWJlcjpcIlwiLG1lc3NhZ2U6XCJcIixkYXRhTGlzdDpbXSxkYXRhTGlzdFNlbGVjdGVkOjAsIGRhdGFMaXN0VHlwZTpcIk5vbmVcIn07XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OmZ1bmN0aW9uKCl7XG4gICAgJChcImJvZHlcIikub24oJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlQmx1cik7XG4gICAgJChcIi5uYXZiYXItZm9ybVwiKS5vbignbW91c2Vkb3duJywgdGhpcy5ibG9ja0NsaWNrKTtcbiAgICAkKFwiLmRlbGV0ZUJ0blwiKS50b29sdGlwKHtjb250YWluZXI6Jy5uYXZiYXInfSlcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICQoXCJib2R5XCIpLm9mZignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVCbHVyKTtcbiAgICAkKFwiLm5hdmJhci1mb3JtXCIpLm9uKCdtb3VzZWRvd24nLCB0aGlzLmJsb2NrQ2xpY2spO1xuICB9LFxuICBoYW5kbGVTdWJtaXQ6ZnVuY3Rpb24oZSl7XG4gICAgaWYoZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciB0aGF0PXRoaXM7XG4gICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdC5sZW5ndGg+MCl7XG4gICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLnN0YXRlLmRhdGFMaXN0W3RoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZF1cbiAgICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIlN1YmplY3RcIil7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0OnNlbGVjdGVkLmNvdXJzZXMsIGRhdGFMaXN0U2VsZWN0ZWQ6MCwgaW5wdXQ6c2VsZWN0ZWQubmFtZSxzdWJqZWN0OnNlbGVjdGVkLm5hbWUsIGRhdGFMaXN0VHlwZTpcIkNvdXJzZVwiLCBtZXNzYWdlOlwiXCJ9KVxuICAgICAgICByZXR1cm47XG4gICAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJDb3Vyc2VcIil7XG4gICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6dHJ1ZSxjYXRhbG9nX251bWJlcjpzZWxlY3RlZC5jYXRhbG9nX251bWJlcixpbnB1dDp0aGlzLnN0YXRlLnN1YmplY3Qrc2VsZWN0ZWQuY2F0YWxvZ19udW1iZXJ9KTtcbiAgICAgICAgdXdhcGkuZ2V0Q291cnNlKHRoaXMuc3RhdGUuc3ViamVjdCxzZWxlY3RlZC5jYXRhbG9nX251bWJlcixmdW5jdGlvbihjb3Vyc2Upe1xuICAgICAgICAgIGlmKGNvdXJzZSl7XG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtsb2FkaW5nOmZhbHNlLHNlYXJjaGVkOnRydWUsbWVzc2FnZTpcIlwiLGRhdGFMaXN0VHlwZTpcIk5vbmVcIixkYXRhTGlzdDpcIlwifSk7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtsb2FkaW5nOmZhbHNlLHNlYXJjaGVkOnRydWUsZGF0YUxpc3RUeXBlOlwiTm9uZVwiLGRhdGFMaXN0OlwiXCIsbWVzc2FnZTpcIkVycm9yIGxvYWRpbmcgY291cnNlIGluZm9cIn0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLnNlYXJjaGVkJiZ0aGlzLnN0YXRlLm1lc3NhZ2U9PVwiXCImJndpbmRvdy5lZGl0aW5nKXtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlYXJjaGVkOmZhbHNlLGlucHV0OlwiXCIsc3ViamVjdDpcIlwiLGNhdGFsb2dfbnVtYmVyOlwiXCJ9KVxuICAgICAgdGhpcy5oYW5kbGVBZGRDb3Vyc2UoZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgaGFuZGxlQ2hhbmdlOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBpbnB1dFZhbHVlPWUudGFyZ2V0LnZhbHVlLnRvVXBwZXJDYXNlKCk7XG4gICAgc3ViamVjdD1pbnB1dFZhbHVlLm1hdGNoKC9eXFxEKy8pO1xuICAgIGNhdGFsb2dfbnVtYmVyPXN1YmplY3Q/aW5wdXRWYWx1ZS5zdWJzdHIoc3ViamVjdFswXS5sZW5ndGgpOlwiXCI7XG4gICAgc3ViamVjdD0oc3ViamVjdCk/c3ViamVjdFswXS5yZXBsYWNlKC8gL2csJycpOlwiXCI7XG4gICAgY2F0YWxvZ19udW1iZXI9Y2F0YWxvZ19udW1iZXIucmVwbGFjZSgvIC9nLCcnKTtcbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICBmb2N1czp0cnVlLFxuICAgICAgaW5wdXQ6aW5wdXRWYWx1ZSxcbiAgICAgIHN1YmplY3Q6c3ViamVjdCxcbiAgICAgIGNhdGFsb2dfbnVtYmVyOmNhdGFsb2dfbnVtYmVyLFxuICAgICAgc2VhcmNoZWQ6ZmFsc2UsXG4gICAgICBtZXNzYWdlOlwiXCJcbiAgICB9XG4gICAgaWYoc3ViamVjdCE9XCJcIil7XG4gICAgICB2YXIgbWF0Y2hlZFN1YmplY3RzID0gYWxsU3ViamVjdHMuZmlsdGVyKGZ1bmN0aW9uKHN1YmplY3REYXRhKXtcbiAgICAgICAgcmV0dXJuIHN1YmplY3REYXRhLm5hbWUubGFzdEluZGV4T2Yoc3ViamVjdCwgMCkgPT09IDBcbiAgICAgIH0pXG4gICAgICBpZihtYXRjaGVkU3ViamVjdHMubGVuZ3RoPjAmJm1hdGNoZWRTdWJqZWN0c1swXS5uYW1lPT1zdWJqZWN0JiZjYXRhbG9nX251bWJlciE9XCJcIil7XG4gICAgICAgIHN0YXRlLmRhdGFMaXN0PW1hdGNoZWRTdWJqZWN0c1swXS5jb3Vyc2VzLmZpbHRlcihmdW5jdGlvbihjb3Vyc2VEYXRhKXtcbiAgICAgICAgICByZXR1cm4gY291cnNlRGF0YS5jYXRhbG9nX251bWJlci5sYXN0SW5kZXhPZihjYXRhbG9nX251bWJlciwgMCkgPT09IDBcbiAgICAgICAgfSlcbiAgICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiQ291cnNlXCJcbiAgICAgIH1lbHNle1xuICAgICAgICBzdGF0ZS5kYXRhTGlzdD1tYXRjaGVkU3ViamVjdHNcbiAgICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiU3ViamVjdFwiXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBzdGF0ZS5kYXRhTGlzdFR5cGU9XCJOb25lXCJcbiAgICB9XG4gICAgaWYodGhpcy5zdGF0ZS5pbnB1dCE9aW5wdXRWYWx1ZSl7XG4gICAgICBzdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPTBcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSxmdW5jdGlvbigpe1xuICAgICAgJCgnLnNlYXJjaFJlc3VsdCAuY29udGFpbmVyJykuc2Nyb2xsVG9wKDApXG4gICAgfSk7XG5cbiAgfSxcbiAgaGFuZGxlQmx1cjpmdW5jdGlvbihlKXtcbiAgICB0aGlzLnNldFN0YXRlKHtmb2N1czpmYWxzZX0pXG4gIH0sXG4gIGhhbmRsZUZvY3VzOmZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzOnRydWV9KVxuICB9LFxuICBoYW5kbGVBZGRDb3Vyc2U6ZnVuY3Rpb24oZSl7XG4gICAgdmFyIGNvdXJzZSA9IHtcbiAgICAgIHN1YmplY3Q6dGhpcy5zdGF0ZS5zdWJqZWN0LFxuICAgICAgY2F0YWxvZ19udW1iZXI6dGhpcy5zdGF0ZS5jYXRhbG9nX251bWJlclxuICAgIH1cbiAgICBpZih3aW5kb3cuZWRpdGluZyl7XG4gICAgICBpZihoYXNDb3Vyc2UoY291cnNlKSl7XG4gICAgICAgIGFsZXJ0KFwiQ291cnNlIGFscmVhZHkgYWRkZWRcIilcbiAgICAgIH1lbHNle1xuICAgICAgICBkYXRhLmNvdXJzZUxpc3QucHVzaChjb3Vyc2UpXG4gICAgICAgIGFuaW1hdGVFbGVtID0gJChcIi5zZWFyY2hSZXN1bHRcIikuY2xvbmUoKS5hZGRDbGFzcyhcImFuaW1hdGUtY291cnNlXCIpXG4gICAgICAgIGFuaW1hdGVFbGVtLnJlbW92ZUF0dHIoXCJkYXRhLXJlYWN0aWRcIikuZmluZChcIltkYXRhLXJlYWN0aWRdXCIpLnJlbW92ZUF0dHIoXCJkYXRhLXJlYWN0aWRcIilcbiAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKGFuaW1hdGVFbGVtKVxuICAgICAgICBhbmltYXRlRWxlbS5jc3Moe1xuICAgICAgICAgIHRvcDokKFwiLnNlYXJjaFJlc3VsdFwiKS5vZmZzZXQoKS50b3AsXG4gICAgICAgICAgbGVmdDokKFwiLnNlYXJjaFJlc3VsdFwiKS5vZmZzZXQoKS5sZWZ0LFxuICAgICAgICAgIHdpZHRoOiQoXCIuc2VhcmNoUmVzdWx0XCIpLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICBoZWlnaHQ6JChcIi5zZWFyY2hSZXN1bHRcIikub3V0ZXJIZWlnaHQoKVxuICAgICAgICB9KS5hbmltYXRlKHtcbiAgICAgICAgICB0b3A6JChcIi5idWNrZXQgLm1vdmVCbG9ja1wiKS5vZmZzZXQoKS50b3AsXG4gICAgICAgICAgbGVmdDokKFwiLmJ1Y2tldCAubW92ZUJsb2NrXCIpLm9mZnNldCgpLmxlZnQsXG4gICAgICAgICAgd2lkdGg6JChcIi5idWNrZXQgLm1vdmVCbG9ja1wiKS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgaGVpZ2h0OiQoXCIuYnVja2V0IC5tb3ZlQmxvY2tcIikub3V0ZXJIZWlnaHQoKVxuICAgICAgICB9LCA1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgYW5pbWF0ZUVsZW0ucmVtb3ZlKClcbiAgICAgICAgfSlcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcImRhdGFVcGRhdGVkXCIpXG4gICAgICAgICQoXCIjc2VhcmNoSW5wdXRcIikuZm9jdXMoKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYmxvY2tDbGljazpmdW5jdGlvbihlKXtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuICBkcm9wOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBjb3Vyc2VOYW1lID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvY291cnNlXCIpXG4gICAgZm9yICh2YXIgdGVybUluZGV4ID0gLTE7IHRlcm1JbmRleCA8IGRhdGEuc2NoZWR1bGUubGVuZ3RoOyB0ZXJtSW5kZXgrKykge1xuICAgICAgdmFyIHRlcm0gPSBnZXRUZXJtTGlzdCh0ZXJtSW5kZXgpXG4gICAgICBmb3IgKHZhciBjb3Vyc2VJbmRleCA9IDA7IGNvdXJzZUluZGV4IDwgdGVybS5sZW5ndGg7IGNvdXJzZUluZGV4KyspIHtcbiAgICAgICAgaWYobmFtZSh0ZXJtW2NvdXJzZUluZGV4XSk9PWNvdXJzZU5hbWUpe1xuICAgICAgICAgIHRlcm0uc3BsaWNlKGNvdXJzZUluZGV4LDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9LFxuICBkcmFnT3ZlcjpmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0sXG4gIGhhbmRsZUtleWRvd246ZnVuY3Rpb24oZSl7XG4gICAgc2Nyb2xsZWQgPSBmYWxzZVxuICAgIGlmKGUua2V5Q29kZT09NDApey8vZG93blxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPHRoaXMuc3RhdGUuZGF0YUxpc3QubGVuZ3RoLTEpXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0U2VsZWN0ZWQ6dGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkKzF9LGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJCgnLnNlYXJjaFJlc3VsdCAuY29udGFpbmVyJykuc2Nyb2xsVG9wKCgkKFwiLnN1Z2dlc3Rpb24uYWN0aXZlXCIpLmluZGV4KCktNSkqMjgpXG4gICAgICAgIH0pXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9ZWxzZSBpZihlLmtleUNvZGU9PTM4KXsvL3VwXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ+MClcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3RTZWxlY3RlZDp0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQtMX0sZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoKCQoXCIuc3VnZ2VzdGlvbi5hY3RpdmVcIikuaW5kZXgoKS01KSoyOClcbiAgICAgICAgfSlcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlQ2xpY2s6ZnVuY3Rpb24oaW5kZXhTZWxlY3RlZCl7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdFNlbGVjdGVkOmluZGV4U2VsZWN0ZWR9LGZ1bmN0aW9uKCl7XG4gICAgICAkKFwiI3NlYXJjaElucHV0XCIpLmZvY3VzKClcbiAgICAgIHRoYXQuaGFuZGxlU3VibWl0KClcbiAgICB9KVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjTmFtZSA9IFwic2VhcmNoUmVzdWx0XCIrKHRoaXMuc3RhdGUuZm9jdXM/XCJcIjpcIiBoaWRlVXBcIilcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYodGhpcy5zdGF0ZS5tZXNzYWdlIT1cIlwiKXtcbiAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5tZXNzYWdlfVxuICAgICAgICAgICAgICA8L2Rpdj4pXG4gICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5zZWFyY2hlZCl7XG4gICAgICB2YXIgY291cnNlPXV3YXBpLmdldEluZm8oe3N1YmplY3Q6dGhpcy5zdGF0ZS5zdWJqZWN0LFxuICAgICAgICBjYXRhbG9nX251bWJlcjp0aGlzLnN0YXRlLmNhdGFsb2dfbnVtYmVyfSk7XG4gICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgzPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9e2NvdXJzZS51cmx9Pntjb3Vyc2Uuc3ViamVjdCtcIiBcIitjb3Vyc2UuY2F0YWxvZ19udW1iZXIrXCIgLSBcIitjb3Vyc2UudGl0bGV9PC9hPjwvaDM+XG4gICAgICAgICAgICAgICAgPHA+e2NvdXJzZS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkFudGlyZXE6IDwvc3Ryb25nPntjb3Vyc2UuYW50aXJlcXVpc2l0ZXx8XCJub25lXCJ9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPlByZXJlcTogPC9zdHJvbmc+e2NvdXJzZS5wcmVyZXF1aXNpdGVzfHxcIm5vbmVcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+VGVybXMgb2ZmZXJlZDogPC9zdHJvbmc+e2dldFRlcm1OYW1lQXJyYXkoY291cnNlLnRlcm1zX29mZmVyZWQpLmpvaW4oXCIsIFwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHQgY29sLXhzLTEyIGNvbC1tZC02XCI+XG4gICAgICAgICAgICAgICAgICB7KCQoXCIjYWRtaW4tYnRuXCIpLmxlbmd0aCk/PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNFwiPjxhIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4tYmxvY2tcIiBocmVmPXtcIi9hZG1pbi9hcHAvY291cnNlL1wiK2NvdXJzZS5pZH0+RWRpdDwvYT48L2Rpdj46e319XG4gICAgICAgICAgICAgICAgICB7KHdpbmRvdy5lZGl0aW5nKT88ZGl2IGNsYXNzTmFtZT1cImNvbC14cy04XCI+PGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgYnRuLWJsb2NrXCI+QWRkIHRvIGxpc3Q8L2J1dHRvbj48L2Rpdj46e319XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgfWVsc2V7XG4gICAgICAvL3Nob3cgc3VnZ2VzdGlvblxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5zdGF0ZS5kYXRhTGlzdFxuICAgICAgICB2YXIgc3ViamVjdEVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihzdWJqZWN0LGkpe1xuICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcInN1Z2dlc3Rpb25cIisodGhhdC5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPT1pP1wiIGFjdGl2ZVwiOlwiXCIpfSBvbkNsaWNrPXt0aGF0LmhhbmRsZUNsaWNrLmJpbmQodGhhdCxpKX0+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e3N1YmplY3QubmFtZX08L3N0cm9uZz4gLSB7c3ViamVjdC5kZXNjcmlwdGlvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICB7c3ViamVjdEVscy5sZW5ndGg+MD9zdWJqZWN0RWxzOihcbiAgICAgICAgICAgICAgXCJTdWJqZWN0IG5vdCBmb3VuZCBcIit0aGF0LnN0YXRlLnN1YmplY3RcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJDb3Vyc2VcIil7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RcbiAgICAgICAgdmFyIGNvdXJzZUVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihjb3Vyc2UsaSl7XG4gICAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e1wic3VnZ2VzdGlvblwiKyh0aGF0LnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ9PWk/XCIgYWN0aXZlXCI6XCJcIil9IG9uQ2xpY2s9e3RoYXQuaGFuZGxlQ2xpY2suYmluZCh0aGF0LGkpfT5cbiAgICAgICAgICAgICAgPHN0cm9uZz57dGhhdC5zdGF0ZS5zdWJqZWN0K2NvdXJzZS5jYXRhbG9nX251bWJlcn08L3N0cm9uZz4gLSB7Y291cnNlLnRpdGxlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiID5cbiAgICAgICAgICAgIHtjb3Vyc2VFbHMubGVuZ3RoPjA/Y291cnNlRWxzOihcbiAgICAgICAgICAgICAgXCJDb3Vyc2Ugbm90IGZvdW5kOiBcIit0aGF0LnN0YXRlLnN1YmplY3QrXCIgXCIrdGhhdC5zdGF0ZS5jYXRhbG9nX251bWJlclxuICAgICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgIH1lbHNle1xuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICBFbnRlciBDb3Vyc2UgQ29kZTogaS5lIDxzdHJvbmc+Q1MyNDE8L3N0cm9uZz4sIDxzdHJvbmc+RU5HTDEwOTwvc3Ryb25nPiwgLi4uXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4oXG4gICAgICA8Zm9ybSBjbGFzc05hbWU9XCJuYXZiYXItZm9ybSBuYXZiYXItbGVmdFwiIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc2VhcmNoSW5wdXQnIHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPSdTZWFyY2ggZm9yIENvdXJzZScgY2xhc3NOYW1lPXsnZm9ybS1jb250cm9sJysodGhpcy5zdGF0ZS5mb2N1cz9cIiBmb2N1c2VkXCI6XCJcIil9IHZhbHVlPXt0aGlzLnN0YXRlLmlucHV0fSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2V9IG9uRm9jdXM9e3RoaXMuaGFuZGxlRm9jdXN9IHJlZj1cInNlYXJjaElucHV0XCIgb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleWRvd259Lz5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9e1wiZmEgZmEtc3BpbiBmYS1zcGlubmVyIHNlYXJjaEluZGljYXRvciBcIisodGhpcy5zdGF0ZS5sb2FkaW5nP1wiXCI6XCJoaWRlXCIpfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyh3aW5kb3cuZWRpdGluZyk/PGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwIGRlbGV0ZUJ0blwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIHRpdGxlPVwiRHJhZyBjb3Vyc2UgaGVyZSB0byBkZWxldGVcIiBkYXRhLXBsYWNlbWVudD1cImJvdHRvbVwiIHJlZj1cImRlbGV0ZUJ0blwiIG9uRHJvcD17dGhpcy5kcm9wfSBvbkRyYWdPdmVyPXt0aGlzLmRyYWdPdmVyfT5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9XCJwZS03cy10cmFzaCBmYS1md1wiLz5cbiAgICAgICAgPC9kaXY+Ont9fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y05hbWV9ID5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxufSlcblxuXG5cbiQoZnVuY3Rpb24oKXtcbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFxuICAgIDxBZGRDb3Vyc2VNb2RhbCAvPixcbiAgICAkKFwiI3NlYXJjaEJ0bldyYXBwZXJcIikuZ2V0KDApXG4gICk7XG59KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==