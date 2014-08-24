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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoSW5wdXQuanMiLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZWFyY2hJbnB1dC5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiXG5BZGRDb3Vyc2VNb2RhbD1SZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtpbnB1dDpcIlwiLGZvY3VzOmZhbHNlLGxvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6ZmFsc2Usc3ViamVjdDpcIlwiLGNhdGFsb2dfbnVtYmVyOlwiXCIsbWVzc2FnZTpcIlwiLGRhdGFMaXN0OltdLGRhdGFMaXN0U2VsZWN0ZWQ6MCwgZGF0YUxpc3RUeXBlOlwiTm9uZVwifTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKXtcbiAgICAkKFwiYm9keVwiKS5vbignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVCbHVyKTtcbiAgICAkKFwiLm5hdmJhci1mb3JtXCIpLm9uKCdtb3VzZWRvd24nLCB0aGlzLmJsb2NrQ2xpY2spO1xuICAgICQoXCIuZGVsZXRlQnRuXCIpLnRvb2x0aXAoe2NvbnRhaW5lcjonLm5hdmJhcid9KVxuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgJChcImJvZHlcIikub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICQoXCIubmF2YmFyLWZvcm1cIikub24oJ21vdXNlZG93bicsIHRoaXMuYmxvY2tDbGljayk7XG4gIH0sXG4gIGhhbmRsZVN1Ym1pdDpmdW5jdGlvbihlKXtcbiAgICBpZihlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0Lmxlbmd0aD4wKXtcbiAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RbdGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkXVxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3Q6c2VsZWN0ZWQuY291cnNlcywgZGF0YUxpc3RTZWxlY3RlZDowLCBpbnB1dDpzZWxlY3RlZC5uYW1lLHN1YmplY3Q6c2VsZWN0ZWQubmFtZSwgZGF0YUxpc3RUeXBlOlwiQ291cnNlXCIsIG1lc3NhZ2U6XCJcIn0pXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIkNvdXJzZVwiKXtcbiAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzp0cnVlLGNhdGFsb2dfbnVtYmVyOnNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGlucHV0OnRoaXMuc3RhdGUuc3ViamVjdCtzZWxlY3RlZC5jYXRhbG9nX251bWJlcn0pO1xuICAgICAgICB1d2FwaS5nZXRDb3Vyc2UodGhpcy5zdGF0ZS5zdWJqZWN0LHNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGZ1bmN0aW9uKGNvdXJzZSl7XG4gICAgICAgICAgaWYoY291cnNlKXtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6dHJ1ZSxtZXNzYWdlOlwiXCIsZGF0YUxpc3RUeXBlOlwiTm9uZVwiLGRhdGFMaXN0OlwiXCJ9KTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6dHJ1ZSxkYXRhTGlzdFR5cGU6XCJOb25lXCIsZGF0YUxpc3Q6XCJcIixtZXNzYWdlOlwiRXJyb3IgbG9hZGluZyBjb3Vyc2UgaW5mb1wifSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuc2VhcmNoZWQmJnRoaXMuc3RhdGUubWVzc2FnZT09XCJcIiYmd2luZG93LmVkaXRpbmcpe1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VhcmNoZWQ6ZmFsc2UsaW5wdXQ6XCJcIixzdWJqZWN0OlwiXCIsY2F0YWxvZ19udW1iZXI6XCJcIn0pXG4gICAgICB0aGlzLmhhbmRsZUFkZENvdXJzZShlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBoYW5kbGVDaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgdmFyIGlucHV0VmFsdWU9ZS50YXJnZXQudmFsdWUudG9VcHBlckNhc2UoKTtcbiAgICBzdWJqZWN0PWlucHV0VmFsdWUubWF0Y2goL15cXEQrLyk7XG4gICAgY2F0YWxvZ19udW1iZXI9c3ViamVjdD9pbnB1dFZhbHVlLnN1YnN0cihzdWJqZWN0WzBdLmxlbmd0aCk6XCJcIjtcbiAgICBzdWJqZWN0PShzdWJqZWN0KT9zdWJqZWN0WzBdLnJlcGxhY2UoLyAvZywnJyk6XCJcIjtcbiAgICBjYXRhbG9nX251bWJlcj1jYXRhbG9nX251bWJlci5yZXBsYWNlKC8gL2csJycpO1xuICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgIGZvY3VzOnRydWUsXG4gICAgICBpbnB1dDppbnB1dFZhbHVlLFxuICAgICAgc3ViamVjdDpzdWJqZWN0LFxuICAgICAgY2F0YWxvZ19udW1iZXI6Y2F0YWxvZ19udW1iZXIsXG4gICAgICBzZWFyY2hlZDpmYWxzZSxcbiAgICAgIG1lc3NhZ2U6XCJcIlxuICAgIH1cbiAgICBpZihzdWJqZWN0IT1cIlwiKXtcbiAgICAgIHZhciBtYXRjaGVkU3ViamVjdHMgPSBhbGxTdWJqZWN0cy5maWx0ZXIoZnVuY3Rpb24oc3ViamVjdERhdGEpe1xuICAgICAgICByZXR1cm4gc3ViamVjdERhdGEubmFtZS5sYXN0SW5kZXhPZihzdWJqZWN0LCAwKSA9PT0gMFxuICAgICAgfSlcbiAgICAgIGlmKG1hdGNoZWRTdWJqZWN0cy5sZW5ndGg+MCYmbWF0Y2hlZFN1YmplY3RzWzBdLm5hbWU9PXN1YmplY3QmJmNhdGFsb2dfbnVtYmVyIT1cIlwiKXtcbiAgICAgICAgc3RhdGUuZGF0YUxpc3Q9bWF0Y2hlZFN1YmplY3RzWzBdLmNvdXJzZXMuZmlsdGVyKGZ1bmN0aW9uKGNvdXJzZURhdGEpe1xuICAgICAgICAgIHJldHVybiBjb3Vyc2VEYXRhLmNhdGFsb2dfbnVtYmVyLmxhc3RJbmRleE9mKGNhdGFsb2dfbnVtYmVyLCAwKSA9PT0gMFxuICAgICAgICB9KVxuICAgICAgICBzdGF0ZS5kYXRhTGlzdFR5cGU9XCJDb3Vyc2VcIlxuICAgICAgfWVsc2V7XG4gICAgICAgIHN0YXRlLmRhdGFMaXN0PW1hdGNoZWRTdWJqZWN0c1xuICAgICAgICBzdGF0ZS5kYXRhTGlzdFR5cGU9XCJTdWJqZWN0XCJcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHN0YXRlLmRhdGFMaXN0VHlwZT1cIk5vbmVcIlxuICAgIH1cbiAgICBpZih0aGlzLnN0YXRlLmlucHV0IT1pbnB1dFZhbHVlKXtcbiAgICAgIHN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ9MFxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHN0YXRlLGZ1bmN0aW9uKCl7XG4gICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoMClcbiAgICB9KTtcblxuICB9LFxuICBoYW5kbGVCbHVyOmZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzOmZhbHNlfSlcbiAgfSxcbiAgaGFuZGxlRm9jdXM6ZnVuY3Rpb24oZSl7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Zm9jdXM6dHJ1ZX0pXG4gIH0sXG4gIGhhbmRsZUFkZENvdXJzZTpmdW5jdGlvbihlKXtcbiAgICB2YXIgY291cnNlID0ge1xuICAgICAgc3ViamVjdDp0aGlzLnN0YXRlLnN1YmplY3QsXG4gICAgICBjYXRhbG9nX251bWJlcjp0aGlzLnN0YXRlLmNhdGFsb2dfbnVtYmVyXG4gICAgfVxuICAgIGlmKHdpbmRvdy5lZGl0aW5nKXtcbiAgICAgIGlmKGhhc0NvdXJzZShjb3Vyc2UpKXtcbiAgICAgICAgYWxlcnQoXCJDb3Vyc2UgYWxyZWFkeSBhZGRlZFwiKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGRhdGEuY291cnNlTGlzdC5wdXNoKGNvdXJzZSlcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcImRhdGFVcGRhdGVkXCIpXG4gICAgICAgICQoXCIjc2VhcmNoSW5wdXRcIikuZm9jdXMoKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYmxvY2tDbGljazpmdW5jdGlvbihlKXtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuICBkcm9wOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBjb3Vyc2VOYW1lID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvY291cnNlXCIpXG4gICAgZm9yICh2YXIgdGVybUluZGV4ID0gLTE7IHRlcm1JbmRleCA8IGRhdGEuc2NoZWR1bGUubGVuZ3RoOyB0ZXJtSW5kZXgrKykge1xuICAgICAgdmFyIHRlcm0gPSBnZXRUZXJtTGlzdCh0ZXJtSW5kZXgpXG4gICAgICBmb3IgKHZhciBjb3Vyc2VJbmRleCA9IDA7IGNvdXJzZUluZGV4IDwgdGVybS5sZW5ndGg7IGNvdXJzZUluZGV4KyspIHtcbiAgICAgICAgaWYobmFtZSh0ZXJtW2NvdXJzZUluZGV4XSk9PWNvdXJzZU5hbWUpe1xuICAgICAgICAgIHRlcm0uc3BsaWNlKGNvdXJzZUluZGV4LDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9LFxuICBkcmFnT3ZlcjpmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0sXG4gIGhhbmRsZUtleWRvd246ZnVuY3Rpb24oZSl7XG4gICAgc2Nyb2xsZWQgPSBmYWxzZVxuICAgIGlmKGUua2V5Q29kZT09NDApey8vZG93blxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPHRoaXMuc3RhdGUuZGF0YUxpc3QubGVuZ3RoLTEpXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0U2VsZWN0ZWQ6dGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkKzF9LGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJCgnLnNlYXJjaFJlc3VsdCAuY29udGFpbmVyJykuc2Nyb2xsVG9wKCgkKFwiLnN1Z2dlc3Rpb24uYWN0aXZlXCIpLmluZGV4KCktNSkqMjgpXG4gICAgICAgIH0pXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9ZWxzZSBpZihlLmtleUNvZGU9PTM4KXsvL3VwXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ+MClcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3RTZWxlY3RlZDp0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQtMX0sZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoKCQoXCIuc3VnZ2VzdGlvbi5hY3RpdmVcIikuaW5kZXgoKS01KSoyOClcbiAgICAgICAgfSlcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlQ2xpY2s6ZnVuY3Rpb24oaW5kZXhTZWxlY3RlZCl7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdFNlbGVjdGVkOmluZGV4U2VsZWN0ZWR9LGZ1bmN0aW9uKCl7XG4gICAgICAkKFwiI3NlYXJjaElucHV0XCIpLmZvY3VzKClcbiAgICAgIHRoYXQuaGFuZGxlU3VibWl0KClcbiAgICB9KVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjTmFtZSA9IFwic2VhcmNoUmVzdWx0XCIrKHRoaXMuc3RhdGUuZm9jdXM/XCJcIjpcIiBoaWRlVXBcIilcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYodGhpcy5zdGF0ZS5tZXNzYWdlIT1cIlwiKXtcbiAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5tZXNzYWdlfVxuICAgICAgICAgICAgICA8L2Rpdj4pXG4gICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5zZWFyY2hlZCl7XG4gICAgICB2YXIgY291cnNlPXV3YXBpLmdldEluZm8oe3N1YmplY3Q6dGhpcy5zdGF0ZS5zdWJqZWN0LFxuICAgICAgICBjYXRhbG9nX251bWJlcjp0aGlzLnN0YXRlLmNhdGFsb2dfbnVtYmVyfSk7XG4gICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgzPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9e2NvdXJzZS51cmx9Pntjb3Vyc2Uuc3ViamVjdCtcIiBcIitjb3Vyc2UuY2F0YWxvZ19udW1iZXIrXCIgLSBcIitjb3Vyc2UudGl0bGV9PC9hPjwvaDM+XG4gICAgICAgICAgICAgICAgPHA+e2NvdXJzZS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkFudGlyZXE6IDwvc3Ryb25nPntjb3Vyc2UuYW50aXJlcXVpc2l0ZXx8XCJub25lXCJ9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPlByZXJlcTogPC9zdHJvbmc+e2NvdXJzZS5wcmVyZXF1aXNpdGVzfHxcIm5vbmVcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+VGVybXMgb2ZmZXJlZDogPC9zdHJvbmc+e2dldFRlcm1OYW1lQXJyYXkoY291cnNlLnRlcm1zX29mZmVyZWQpLmpvaW4oXCIsIFwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHQgY29sLXhzLTEyIGNvbC1tZC02XCI+XG4gICAgICAgICAgICAgICAgICB7KCQoXCIjYWRtaW4tYnRuXCIpLmxlbmd0aCk/PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNFwiPjxhIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4tYmxvY2tcIiBocmVmPXtcIi9hZG1pbi9hcHAvY291cnNlL1wiK2NvdXJzZS5pZH0+RWRpdDwvYT48L2Rpdj46e319XG4gICAgICAgICAgICAgICAgICB7KHdpbmRvdy5lZGl0aW5nKT88ZGl2IGNsYXNzTmFtZT1cImNvbC14cy04XCI+PGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgYnRuLWJsb2NrXCI+QWRkIHRvIGxpc3Q8L2J1dHRvbj48L2Rpdj46e319XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgfWVsc2V7XG4gICAgICAvL3Nob3cgc3VnZ2VzdGlvblxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5zdGF0ZS5kYXRhTGlzdFxuICAgICAgICB2YXIgc3ViamVjdEVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihzdWJqZWN0LGkpe1xuICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcInN1Z2dlc3Rpb25cIisodGhhdC5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPT1pP1wiIGFjdGl2ZVwiOlwiXCIpfSBvbkNsaWNrPXt0aGF0LmhhbmRsZUNsaWNrLmJpbmQodGhhdCxpKX0+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e3N1YmplY3QubmFtZX08L3N0cm9uZz4gLSB7c3ViamVjdC5kZXNjcmlwdGlvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICB7c3ViamVjdEVscy5sZW5ndGg+MD9zdWJqZWN0RWxzOihcbiAgICAgICAgICAgICAgXCJTdWJqZWN0IG5vdCBmb3VuZCBcIit0aGF0LnN0YXRlLnN1YmplY3RcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJDb3Vyc2VcIil7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RcbiAgICAgICAgdmFyIGNvdXJzZUVscyA9IGRhdGFMaXN0Lm1hcChmdW5jdGlvbihjb3Vyc2UsaSl7XG4gICAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e1wic3VnZ2VzdGlvblwiKyh0aGF0LnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ9PWk/XCIgYWN0aXZlXCI6XCJcIil9IG9uQ2xpY2s9e3RoYXQuaGFuZGxlQ2xpY2suYmluZCh0aGF0LGkpfT5cbiAgICAgICAgICAgICAgPHN0cm9uZz57dGhhdC5zdGF0ZS5zdWJqZWN0K2NvdXJzZS5jYXRhbG9nX251bWJlcn08L3N0cm9uZz4gLSB7Y291cnNlLnRpdGxlfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiID5cbiAgICAgICAgICAgIHtjb3Vyc2VFbHMubGVuZ3RoPjA/Y291cnNlRWxzOihcbiAgICAgICAgICAgICAgXCJDb3Vyc2Ugbm90IGZvdW5kOiBcIit0aGF0LnN0YXRlLnN1YmplY3QrXCIgXCIrdGhhdC5zdGF0ZS5jYXRhbG9nX251bWJlclxuICAgICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgIH1lbHNle1xuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICBFbnRlciBDb3Vyc2UgQ29kZTogaS5lIDxzdHJvbmc+Q1MyNDE8L3N0cm9uZz4sIDxzdHJvbmc+RU5HTDEwOTwvc3Ryb25nPiwgLi4uXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4oXG4gICAgICA8Zm9ybSBjbGFzc05hbWU9XCJuYXZiYXItZm9ybSBuYXZiYXItbGVmdFwiIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc2VhcmNoSW5wdXQnIHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPSdTZWFyY2ggZm9yIENvdXJzZScgY2xhc3NOYW1lPXsnZm9ybS1jb250cm9sJysodGhpcy5zdGF0ZS5mb2N1cz9cIiBmb2N1c2VkXCI6XCJcIil9IHZhbHVlPXt0aGlzLnN0YXRlLmlucHV0fSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2V9IG9uRm9jdXM9e3RoaXMuaGFuZGxlRm9jdXN9IHJlZj1cInNlYXJjaElucHV0XCIgb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleWRvd259Lz5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9e1wiZmEgZmEtc3BpbiBmYS1zcGlubmVyIHNlYXJjaEluZGljYXRvciBcIisodGhpcy5zdGF0ZS5sb2FkaW5nP1wiXCI6XCJoaWRlXCIpfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyh3aW5kb3cuZWRpdGluZyk/PGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwIGRlbGV0ZUJ0blwiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIHRpdGxlPVwiRHJhZyBjb3Vyc2UgaGVyZSB0byBkZWxldGVcIiBkYXRhLXBsYWNlbWVudD1cImJvdHRvbVwiIHJlZj1cImRlbGV0ZUJ0blwiIG9uRHJvcD17dGhpcy5kcm9wfSBvbkRyYWdPdmVyPXt0aGlzLmRyYWdPdmVyfT5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9XCJwZS03cy10cmFzaCBmYS1md1wiLz5cbiAgICAgICAgPC9kaXY+Ont9fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y05hbWV9ID5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxufSlcblxuXG5cbiQoZnVuY3Rpb24oKXtcbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFxuICAgIDxBZGRDb3Vyc2VNb2RhbCAvPixcbiAgICAkKFwiI3NlYXJjaEJ0bldyYXBwZXJcIikuZ2V0KDApXG4gICk7XG59KSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==