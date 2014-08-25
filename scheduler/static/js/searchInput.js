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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoSW5wdXQuanMiLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZWFyY2hJbnB1dC5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiXG5BZGRDb3Vyc2VNb2RhbD1SZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtpbnB1dDpcIlwiLGZvY3VzOmZhbHNlLGxvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6ZmFsc2Usc3ViamVjdDpcIlwiLGNhdGFsb2dfbnVtYmVyOlwiXCIsbWVzc2FnZTpcIlwiLGRhdGFMaXN0OltdLGRhdGFMaXN0U2VsZWN0ZWQ6MCwgZGF0YUxpc3RUeXBlOlwiTm9uZVwifTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKXtcbiAgICAkKFwiYm9keVwiKS5vbignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVCbHVyKTtcbiAgICAkKFwiLm5hdmJhci1mb3JtXCIpLm9uKCdtb3VzZWRvd24nLCB0aGlzLmJsb2NrQ2xpY2spO1xuICAgICQoXCIuZGVsZXRlQnRuXCIpLnRvb2x0aXAoe2NvbnRhaW5lcjonLm5hdmJhcid9KVxuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgJChcImJvZHlcIikub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICQoXCIubmF2YmFyLWZvcm1cIikub24oJ21vdXNlZG93bicsIHRoaXMuYmxvY2tDbGljayk7XG4gIH0sXG4gIGhhbmRsZVN1Ym1pdDpmdW5jdGlvbihlKXtcbiAgICBpZihlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0Lmxlbmd0aD4wKXtcbiAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RbdGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkXVxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3Q6c2VsZWN0ZWQuY291cnNlcywgZGF0YUxpc3RTZWxlY3RlZDowLCBpbnB1dDpzZWxlY3RlZC5uYW1lLHN1YmplY3Q6c2VsZWN0ZWQubmFtZSwgZGF0YUxpc3RUeXBlOlwiQ291cnNlXCIsIG1lc3NhZ2U6XCJcIn0pXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIkNvdXJzZVwiKXtcbiAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzp0cnVlLGNhdGFsb2dfbnVtYmVyOnNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGlucHV0OnRoaXMuc3RhdGUuc3ViamVjdCtzZWxlY3RlZC5jYXRhbG9nX251bWJlcn0pO1xuICAgICAgICB1d2FwaS5nZXRDb3Vyc2UodGhpcy5zdGF0ZS5zdWJqZWN0LHNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGZ1bmN0aW9uKGNvdXJzZSl7XG4gICAgICAgICAgaWYoY291cnNlKXtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6dHJ1ZSxtZXNzYWdlOlwiXCIsZGF0YUxpc3RUeXBlOlwiTm9uZVwiLGRhdGFMaXN0OlwiXCJ9KTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6dHJ1ZSxkYXRhTGlzdFR5cGU6XCJOb25lXCIsZGF0YUxpc3Q6XCJcIixtZXNzYWdlOlwiRXJyb3IgbG9hZGluZyBjb3Vyc2UgaW5mb1wifSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuc2VhcmNoZWQmJnRoaXMuc3RhdGUubWVzc2FnZT09XCJcIiYmd2luZG93LmVkaXRpbmcpe1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VhcmNoZWQ6ZmFsc2UsaW5wdXQ6XCJcIixzdWJqZWN0OlwiXCIsY2F0YWxvZ19udW1iZXI6XCJcIn0pXG4gICAgICB0aGlzLmhhbmRsZUFkZENvdXJzZShlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBoYW5kbGVDaGFuZ2U6ZnVuY3Rpb24oZSl7XG4gICAgdmFyIGlucHV0VmFsdWU9ZS50YXJnZXQudmFsdWUudG9VcHBlckNhc2UoKTtcbiAgICBzdWJqZWN0PWlucHV0VmFsdWUubWF0Y2goL15cXEQrLyk7XG4gICAgY2F0YWxvZ19udW1iZXI9c3ViamVjdD9pbnB1dFZhbHVlLnN1YnN0cihzdWJqZWN0WzBdLmxlbmd0aCk6XCJcIjtcbiAgICBzdWJqZWN0PShzdWJqZWN0KT9zdWJqZWN0WzBdLnJlcGxhY2UoLyAvZywnJyk6XCJcIjtcbiAgICBjYXRhbG9nX251bWJlcj1jYXRhbG9nX251bWJlci5yZXBsYWNlKC8gL2csJycpO1xuICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgIGZvY3VzOnRydWUsXG4gICAgICBpbnB1dDppbnB1dFZhbHVlLFxuICAgICAgc3ViamVjdDpzdWJqZWN0LFxuICAgICAgY2F0YWxvZ19udW1iZXI6Y2F0YWxvZ19udW1iZXIsXG4gICAgICBzZWFyY2hlZDpmYWxzZSxcbiAgICAgIG1lc3NhZ2U6XCJcIlxuICAgIH1cbiAgICBpZihzdWJqZWN0IT1cIlwiKXtcbiAgICAgIHZhciBtYXRjaGVkU3ViamVjdHMgPSBhbGxTdWJqZWN0cy5maWx0ZXIoZnVuY3Rpb24oc3ViamVjdERhdGEpe1xuICAgICAgICByZXR1cm4gc3ViamVjdERhdGEubmFtZS5sYXN0SW5kZXhPZihzdWJqZWN0LCAwKSA9PT0gMFxuICAgICAgfSlcbiAgICAgIGlmKG1hdGNoZWRTdWJqZWN0cy5sZW5ndGg+MCYmbWF0Y2hlZFN1YmplY3RzWzBdLm5hbWU9PXN1YmplY3QmJmNhdGFsb2dfbnVtYmVyIT1cIlwiKXtcbiAgICAgICAgc3RhdGUuZGF0YUxpc3Q9bWF0Y2hlZFN1YmplY3RzWzBdLmNvdXJzZXMuZmlsdGVyKGZ1bmN0aW9uKGNvdXJzZURhdGEpe1xuICAgICAgICAgIHJldHVybiBjb3Vyc2VEYXRhLmNhdGFsb2dfbnVtYmVyLmxhc3RJbmRleE9mKGNhdGFsb2dfbnVtYmVyLCAwKSA9PT0gMFxuICAgICAgICB9KVxuICAgICAgICBzdGF0ZS5kYXRhTGlzdFR5cGU9XCJDb3Vyc2VcIlxuICAgICAgfWVsc2V7XG4gICAgICAgIHN0YXRlLmRhdGFMaXN0PW1hdGNoZWRTdWJqZWN0c1xuICAgICAgICBzdGF0ZS5kYXRhTGlzdFR5cGU9XCJTdWJqZWN0XCJcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHN0YXRlLmRhdGFMaXN0VHlwZT1cIk5vbmVcIlxuICAgIH1cbiAgICBpZih0aGlzLnN0YXRlLmlucHV0IT1pbnB1dFZhbHVlKXtcbiAgICAgIHN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ9MFxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHN0YXRlLGZ1bmN0aW9uKCl7XG4gICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoMClcbiAgICB9KTtcblxuICB9LFxuICBoYW5kbGVCbHVyOmZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzOmZhbHNlfSlcbiAgfSxcbiAgaGFuZGxlRm9jdXM6ZnVuY3Rpb24oZSl7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Zm9jdXM6dHJ1ZX0pXG4gIH0sXG4gIGhhbmRsZUFkZENvdXJzZTpmdW5jdGlvbihlKXtcbiAgICB2YXIgY291cnNlID0ge1xuICAgICAgc3ViamVjdDp0aGlzLnN0YXRlLnN1YmplY3QsXG4gICAgICBjYXRhbG9nX251bWJlcjp0aGlzLnN0YXRlLmNhdGFsb2dfbnVtYmVyXG4gICAgfVxuICAgIGlmKHdpbmRvdy5lZGl0aW5nKXtcbiAgICAgIGlmKGhhc0NvdXJzZShjb3Vyc2UpKXtcbiAgICAgICAgYWxlcnQoXCJDb3Vyc2UgYWxyZWFkeSBhZGRlZFwiKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGRhdGEuY291cnNlTGlzdC5wdXNoKGNvdXJzZSlcbiAgICAgICAgYW5pbWF0ZUVsZW0gPSAkKFwiLnNlYXJjaFJlc3VsdFwiKS5jbG9uZSgpLmFkZENsYXNzKFwiYW5pbWF0ZS1jb3Vyc2VcIilcbiAgICAgICAgYW5pbWF0ZUVsZW0ucmVtb3ZlQXR0cihcImRhdGEtcmVhY3RpZFwiKS5maW5kKFwiW2RhdGEtcmVhY3RpZF1cIikucmVtb3ZlQXR0cihcImRhdGEtcmVhY3RpZFwiKVxuICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQoYW5pbWF0ZUVsZW0pXG4gICAgICAgIGFuaW1hdGVFbGVtLmNzcyh7XG4gICAgICAgICAgdG9wOiQoXCIuc2VhcmNoUmVzdWx0XCIpLm9mZnNldCgpLnRvcCxcbiAgICAgICAgICBsZWZ0OiQoXCIuc2VhcmNoUmVzdWx0XCIpLm9mZnNldCgpLmxlZnQsXG4gICAgICAgICAgd2lkdGg6JChcIi5zZWFyY2hSZXN1bHRcIikub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgIGhlaWdodDokKFwiLnNlYXJjaFJlc3VsdFwiKS5vdXRlckhlaWdodCgpXG4gICAgICAgIH0pLmFuaW1hdGUoe1xuICAgICAgICAgIHRvcDokKFwiLmJ1Y2tldCAubW92ZUJsb2NrXCIpLm9mZnNldCgpLnRvcCxcbiAgICAgICAgICBsZWZ0OiQoXCIuYnVja2V0IC5tb3ZlQmxvY2tcIikub2Zmc2V0KCkubGVmdCxcbiAgICAgICAgICB3aWR0aDokKFwiLmJ1Y2tldCAubW92ZUJsb2NrXCIpLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICBoZWlnaHQ6JChcIi5idWNrZXQgLm1vdmVCbG9ja1wiKS5vdXRlckhlaWdodCgpXG4gICAgICAgIH0sIDUwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICBhbmltYXRlRWxlbS5yZW1vdmUoKVxuICAgICAgICB9KVxuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwiZGF0YVVwZGF0ZWRcIilcbiAgICAgICAgJChcIiNzZWFyY2hJbnB1dFwiKS5mb2N1cygpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBibG9ja0NsaWNrOmZ1bmN0aW9uKGUpe1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG4gIGRyb3A6ZnVuY3Rpb24oZSl7XG4gICAgdmFyIGNvdXJzZU5hbWUgPSBlLmRhdGFUcmFuc2Zlci5nZXREYXRhKFwidGV4dC9jb3Vyc2VcIilcbiAgICBmb3IgKHZhciB0ZXJtSW5kZXggPSAtMTsgdGVybUluZGV4IDwgZGF0YS5zY2hlZHVsZS5sZW5ndGg7IHRlcm1JbmRleCsrKSB7XG4gICAgICB2YXIgdGVybSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClcbiAgICAgIGZvciAodmFyIGNvdXJzZUluZGV4ID0gMDsgY291cnNlSW5kZXggPCB0ZXJtLmxlbmd0aDsgY291cnNlSW5kZXgrKykge1xuICAgICAgICBpZihuYW1lKHRlcm1bY291cnNlSW5kZXhdKT09Y291cnNlTmFtZSl7XG4gICAgICAgICAgdGVybS5zcGxpY2UoY291cnNlSW5kZXgsMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gIH0sXG4gIGRyYWdPdmVyOmZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSxcbiAgaGFuZGxlS2V5ZG93bjpmdW5jdGlvbihlKXtcbiAgICBzY3JvbGxlZCA9IGZhbHNlXG4gICAgaWYoZS5rZXlDb2RlPT00MCl7Ly9kb3duXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ8dGhpcy5zdGF0ZS5kYXRhTGlzdC5sZW5ndGgtMSlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3RTZWxlY3RlZDp0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQrMX0sZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoKCQoXCIuc3VnZ2VzdGlvbi5hY3RpdmVcIikuaW5kZXgoKS01KSoyOClcbiAgICAgICAgfSlcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIH1lbHNlIGlmKGUua2V5Q29kZT09Mzgpey8vdXBcbiAgICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD4wKVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdFNlbGVjdGVkOnRoaXMuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZC0xfSxmdW5jdGlvbigpe1xuICAgICAgICAgICQoJy5zZWFyY2hSZXN1bHQgLmNvbnRhaW5lcicpLnNjcm9sbFRvcCgoJChcIi5zdWdnZXN0aW9uLmFjdGl2ZVwiKS5pbmRleCgpLTUpKjI4KVxuICAgICAgICB9KVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfVxuICB9LFxuICBoYW5kbGVDbGljazpmdW5jdGlvbihpbmRleFNlbGVjdGVkKXtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0U2VsZWN0ZWQ6aW5kZXhTZWxlY3RlZH0sZnVuY3Rpb24oKXtcbiAgICAgICQoXCIjc2VhcmNoSW5wdXRcIikuZm9jdXMoKVxuICAgICAgdGhhdC5oYW5kbGVTdWJtaXQoKVxuICAgIH0pXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNOYW1lID0gXCJzZWFyY2hSZXN1bHRcIisodGhpcy5zdGF0ZS5mb2N1cz9cIlwiOlwiIGhpZGVVcFwiKVxuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICBpZih0aGlzLnN0YXRlLm1lc3NhZ2UhPVwiXCIpe1xuICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLm1lc3NhZ2V9XG4gICAgICAgICAgICAgIDwvZGl2PilcbiAgICB9ZWxzZSBpZih0aGlzLnN0YXRlLnNlYXJjaGVkKXtcbiAgICAgIHZhciBjb3Vyc2U9dXdhcGkuZ2V0SW5mbyh7c3ViamVjdDp0aGlzLnN0YXRlLnN1YmplY3QsXG4gICAgICAgIGNhdGFsb2dfbnVtYmVyOnRoaXMuc3RhdGUuY2F0YWxvZ19udW1iZXJ9KTtcbiAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8aDM+PGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj17Y291cnNlLnVybH0+e2NvdXJzZS5zdWJqZWN0K1wiIFwiK2NvdXJzZS5jYXRhbG9nX251bWJlcitcIiAtIFwiK2NvdXJzZS50aXRsZX08L2E+PC9oMz5cbiAgICAgICAgICAgICAgICA8cD57Y291cnNlLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+QW50aXJlcTogPC9zdHJvbmc+e2NvdXJzZS5hbnRpcmVxdWlzaXRlfHxcIm5vbmVcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+UHJlcmVxOiA8L3N0cm9uZz57Y291cnNlLnByZXJlcXVpc2l0ZXN8fFwibm9uZVwifTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PHN0cm9uZz5UZXJtcyBvZmZlcmVkOiA8L3N0cm9uZz57Z2V0VGVybU5hbWVBcnJheShjb3Vyc2UudGVybXNfb2ZmZXJlZCkuam9pbihcIiwgXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHVsbC1yaWdodCBjb2wteHMtMTIgY29sLW1kLTZcIj5cbiAgICAgICAgICAgICAgICAgIHsoJChcIiNhZG1pbi1idG5cIikubGVuZ3RoKT88ZGl2IGNsYXNzTmFtZT1cImNvbC14cy00XCI+PGEgY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1ibG9ja1wiIGhyZWY9e1wiL2FkbWluL2FwcC9jb3Vyc2UvXCIrY291cnNlLmlkfT5FZGl0PC9hPjwvZGl2Pjp7fX1cbiAgICAgICAgICAgICAgICAgIHsod2luZG93LmVkaXRpbmcpPzxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLThcIj48YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeSBidG4tYmxvY2tcIj5BZGQgdG8gbGlzdDwvYnV0dG9uPjwvZGl2Pjp7fX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICB9ZWxzZXtcbiAgICAgIC8vc2hvdyBzdWdnZXN0aW9uXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0VHlwZT09XCJTdWJqZWN0XCIpe1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLnN0YXRlLmRhdGFMaXN0XG4gICAgICAgIHZhciBzdWJqZWN0RWxzID0gZGF0YUxpc3QubWFwKGZ1bmN0aW9uKHN1YmplY3QsaSl7XG4gICAgICAgICAgcmV0dXJuKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e1wic3VnZ2VzdGlvblwiKyh0aGF0LnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ9PWk/XCIgYWN0aXZlXCI6XCJcIil9IG9uQ2xpY2s9e3RoYXQuaGFuZGxlQ2xpY2suYmluZCh0aGF0LGkpfT5cbiAgICAgICAgICAgICAgPHN0cm9uZz57c3ViamVjdC5uYW1lfTwvc3Ryb25nPiAtIHtzdWJqZWN0LmRlc2NyaXB0aW9ufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiID5cbiAgICAgICAgICAgIHtzdWJqZWN0RWxzLmxlbmd0aD4wP3N1YmplY3RFbHM6KFxuICAgICAgICAgICAgICBcIlN1YmplY3Qgbm90IGZvdW5kIFwiK3RoYXQuc3RhdGUuc3ViamVjdFxuICAgICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIkNvdXJzZVwiKXtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5zdGF0ZS5kYXRhTGlzdFxuICAgICAgICB2YXIgY291cnNlRWxzID0gZGF0YUxpc3QubWFwKGZ1bmN0aW9uKGNvdXJzZSxpKXtcbiAgICAgICAgICByZXR1cm4oXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17XCJzdWdnZXN0aW9uXCIrKHRoYXQuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD09aT9cIiBhY3RpdmVcIjpcIlwiKX0gb25DbGljaz17dGhhdC5oYW5kbGVDbGljay5iaW5kKHRoYXQsaSl9PlxuICAgICAgICAgICAgICA8c3Ryb25nPnt0aGF0LnN0YXRlLnN1YmplY3QrY291cnNlLmNhdGFsb2dfbnVtYmVyfTwvc3Ryb25nPiAtIHtjb3Vyc2UudGl0bGV9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgPlxuICAgICAgICAgICAge2NvdXJzZUVscy5sZW5ndGg+MD9jb3Vyc2VFbHM6KFxuICAgICAgICAgICAgICBcIkNvdXJzZSBub3QgZm91bmQ6IFwiK3RoYXQuc3RhdGUuc3ViamVjdCtcIiBcIit0aGF0LnN0YXRlLmNhdGFsb2dfbnVtYmVyXG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiID5cbiAgICAgICAgICAgIEVudGVyIENvdXJzZSBDb2RlOiBpLmUgPHN0cm9uZz5DUzI0MTwvc3Ryb25nPiwgPHN0cm9uZz5FTkdMMTA5PC9zdHJvbmc+LCAuLi5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybihcbiAgICAgIDxmb3JtIGNsYXNzTmFtZT1cIm5hdmJhci1mb3JtIG5hdmJhci1sZWZ0XCIgb25TdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgPGlucHV0IGlkPSdzZWFyY2hJbnB1dCcgdHlwZT0ndGV4dCcgcGxhY2Vob2xkZXI9J1NlYXJjaCBmb3IgQ291cnNlJyBjbGFzc05hbWU9eydmb3JtLWNvbnRyb2wnKyh0aGlzLnN0YXRlLmZvY3VzP1wiIGZvY3VzZWRcIjpcIlwiKX0gdmFsdWU9e3RoaXMuc3RhdGUuaW5wdXR9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZX0gb25Gb2N1cz17dGhpcy5oYW5kbGVGb2N1c30gcmVmPVwic2VhcmNoSW5wdXRcIiBvbktleURvd249e3RoaXMuaGFuZGxlS2V5ZG93bn0vPlxuICAgICAgICAgIDxpIGNsYXNzTmFtZT17XCJmYSBmYS1zcGluIGZhLXNwaW5uZXIgc2VhcmNoSW5kaWNhdG9yIFwiKyh0aGlzLnN0YXRlLmxvYWRpbmc/XCJcIjpcImhpZGVcIil9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7KHdpbmRvdy5lZGl0aW5nKT88ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXAgZGVsZXRlQnRuXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgdGl0bGU9XCJEcmFnIGNvdXJzZSBoZXJlIHRvIGRlbGV0ZVwiIGRhdGEtcGxhY2VtZW50PVwiYm90dG9tXCIgcmVmPVwiZGVsZXRlQnRuXCIgb25Ecm9wPXt0aGlzLmRyb3B9IG9uRHJhZ092ZXI9e3RoaXMuZHJhZ092ZXJ9PlxuICAgICAgICAgIDxpIGNsYXNzTmFtZT1cInBlLTdzLXRyYXNoIGZhLWZ3XCIvPlxuICAgICAgICA8L2Rpdj46e319XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjTmFtZX0gPlxuICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZm9ybT5cbiAgICApO1xuICB9XG59KVxuXG5cblxuJChmdW5jdGlvbigpe1xuICBSZWFjdC5yZW5kZXJDb21wb25lbnQoXG4gICAgPEFkZENvdXJzZU1vZGFsIC8+LFxuICAgICQoXCIjc2VhcmNoQnRuV3JhcHBlclwiKS5nZXQoMClcbiAgKTtcbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9