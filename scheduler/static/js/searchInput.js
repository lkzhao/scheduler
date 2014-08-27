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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoSW5wdXQuanMiLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZWFyY2hJbnB1dC5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiXG5BZGRDb3Vyc2VNb2RhbD1SZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtpbnB1dDpcIlwiLGZvY3VzOmZhbHNlLGxvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6ZmFsc2Usc3ViamVjdDpcIlwiLGNhdGFsb2dfbnVtYmVyOlwiXCIsbWVzc2FnZTpcIlwiLGRhdGFMaXN0OltdLGRhdGFMaXN0U2VsZWN0ZWQ6MCwgZGF0YUxpc3RUeXBlOlwiTm9uZVwifTtcbiAgfSxcbiAgY29tcG9uZW50RGlkVXBkYXRlOmZ1bmN0aW9uKCl7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcihcInJlc3VsdC51cGRhdGVkLnV3Y3NcIiwgdGhpcy5zdGF0ZSlcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKXtcbiAgICAkKFwiYm9keVwiKS5vbignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVCbHVyKTtcbiAgICAkKFwiLm5hdmJhci1mb3JtXCIpLm9uKCdtb3VzZWRvd24nLCB0aGlzLmJsb2NrQ2xpY2spO1xuICAgICQoXCIuZGVsZXRlQnRuXCIpLnRvb2x0aXAoe2NvbnRhaW5lcjonLm5hdmJhcid9KVxuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgJChcImJvZHlcIikub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmhhbmRsZUJsdXIpO1xuICAgICQoXCIubmF2YmFyLWZvcm1cIikub24oJ21vdXNlZG93bicsIHRoaXMuYmxvY2tDbGljayk7XG4gIH0sXG4gIGhhbmRsZVN1Ym1pdDpmdW5jdGlvbihlKXtcbiAgICBpZihlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0Lmxlbmd0aD4wKXtcbiAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RbdGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkXVxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiU3ViamVjdFwiKXtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3Q6c2VsZWN0ZWQuY291cnNlcywgZGF0YUxpc3RTZWxlY3RlZDowLCBpbnB1dDpzZWxlY3RlZC5uYW1lLHN1YmplY3Q6c2VsZWN0ZWQubmFtZSwgZGF0YUxpc3RUeXBlOlwiQ291cnNlXCIsIG1lc3NhZ2U6XCJcIn0pXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1lbHNlIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIkNvdXJzZVwiKXtcbiAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzp0cnVlLGNhdGFsb2dfbnVtYmVyOnNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGlucHV0OnRoaXMuc3RhdGUuc3ViamVjdCtzZWxlY3RlZC5jYXRhbG9nX251bWJlcn0pO1xuICAgICAgICB1d2FwaS5nZXRDb3Vyc2UodGhpcy5zdGF0ZS5zdWJqZWN0LHNlbGVjdGVkLmNhdGFsb2dfbnVtYmVyLGZ1bmN0aW9uKGNvdXJzZSl7XG4gICAgICAgICAgaWYoY291cnNlKXtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2xvYWRpbmc6ZmFsc2Usc2VhcmNoZWQ6dHJ1ZSxtZXNzYWdlOlwiXCIsZGF0YUxpc3RUeXBlOlwiTm9uZVwiLGRhdGFMaXN0OlwiXCJ9KTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoXCJyZXN1bHQuc2VhcmNoZWQudXdjc1wiKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bG9hZGluZzpmYWxzZSxzZWFyY2hlZDp0cnVlLGRhdGFMaXN0VHlwZTpcIk5vbmVcIixkYXRhTGlzdDpcIlwiLG1lc3NhZ2U6XCJFcnJvciBsb2FkaW5nIGNvdXJzZSBpbmZvXCJ9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5zZWFyY2hlZCYmdGhpcy5zdGF0ZS5tZXNzYWdlPT1cIlwiJiZ3aW5kb3cuZWRpdGluZyl7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWFyY2hlZDpmYWxzZSxpbnB1dDpcIlwiLHN1YmplY3Q6XCJcIixjYXRhbG9nX251bWJlcjpcIlwifSlcbiAgICAgIHRoaXMuaGFuZGxlQWRkQ291cnNlKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGhhbmRsZUNoYW5nZTpmdW5jdGlvbihlKXtcbiAgICB2YXIgaW5wdXRWYWx1ZT1lLnRhcmdldC52YWx1ZS50b1VwcGVyQ2FzZSgpO1xuICAgIHN1YmplY3Q9aW5wdXRWYWx1ZS5tYXRjaCgvXlxcRCsvKTtcbiAgICBjYXRhbG9nX251bWJlcj1zdWJqZWN0P2lucHV0VmFsdWUuc3Vic3RyKHN1YmplY3RbMF0ubGVuZ3RoKTpcIlwiO1xuICAgIHN1YmplY3Q9KHN1YmplY3QpP3N1YmplY3RbMF0ucmVwbGFjZSgvIC9nLCcnKTpcIlwiO1xuICAgIGNhdGFsb2dfbnVtYmVyPWNhdGFsb2dfbnVtYmVyLnJlcGxhY2UoLyAvZywnJyk7XG4gICAgdmFyIHN0YXRlID0ge1xuICAgICAgZm9jdXM6dHJ1ZSxcbiAgICAgIGlucHV0OmlucHV0VmFsdWUsXG4gICAgICBzdWJqZWN0OnN1YmplY3QsXG4gICAgICBjYXRhbG9nX251bWJlcjpjYXRhbG9nX251bWJlcixcbiAgICAgIHNlYXJjaGVkOmZhbHNlLFxuICAgICAgbWVzc2FnZTpcIlwiXG4gICAgfVxuICAgIGlmKHN1YmplY3QhPVwiXCIpe1xuICAgICAgdmFyIG1hdGNoZWRTdWJqZWN0cyA9IGFsbFN1YmplY3RzLmZpbHRlcihmdW5jdGlvbihzdWJqZWN0RGF0YSl7XG4gICAgICAgIHJldHVybiBzdWJqZWN0RGF0YS5uYW1lLmxhc3RJbmRleE9mKHN1YmplY3QsIDApID09PSAwXG4gICAgICB9KVxuICAgICAgaWYobWF0Y2hlZFN1YmplY3RzLmxlbmd0aD4wJiZtYXRjaGVkU3ViamVjdHNbMF0ubmFtZT09c3ViamVjdCYmY2F0YWxvZ19udW1iZXIhPVwiXCIpe1xuICAgICAgICBzdGF0ZS5kYXRhTGlzdD1tYXRjaGVkU3ViamVjdHNbMF0uY291cnNlcy5maWx0ZXIoZnVuY3Rpb24oY291cnNlRGF0YSl7XG4gICAgICAgICAgcmV0dXJuIGNvdXJzZURhdGEuY2F0YWxvZ19udW1iZXIubGFzdEluZGV4T2YoY2F0YWxvZ19udW1iZXIsIDApID09PSAwXG4gICAgICAgIH0pXG4gICAgICAgIHN0YXRlLmRhdGFMaXN0VHlwZT1cIkNvdXJzZVwiXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3RhdGUuZGF0YUxpc3Q9bWF0Y2hlZFN1YmplY3RzXG4gICAgICAgIHN0YXRlLmRhdGFMaXN0VHlwZT1cIlN1YmplY3RcIlxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgc3RhdGUuZGF0YUxpc3RUeXBlPVwiTm9uZVwiXG4gICAgfVxuICAgIGlmKHRoaXMuc3RhdGUuaW5wdXQhPWlucHV0VmFsdWUpe1xuICAgICAgc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD0wXG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUsZnVuY3Rpb24oKXtcbiAgICAgICQoJy5zZWFyY2hSZXN1bHQgLmNvbnRhaW5lcicpLnNjcm9sbFRvcCgwKVxuICAgIH0pO1xuICB9LFxuICBoYW5kbGVCbHVyOmZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzOmZhbHNlfSlcbiAgfSxcbiAgaGFuZGxlRm9jdXM6ZnVuY3Rpb24oZSl7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Zm9jdXM6dHJ1ZX0pXG4gIH0sXG4gIGhhbmRsZUFkZENvdXJzZTpmdW5jdGlvbihlKXtcbiAgICB2YXIgY291cnNlID0ge1xuICAgICAgc3ViamVjdDp0aGlzLnN0YXRlLnN1YmplY3QsXG4gICAgICBjYXRhbG9nX251bWJlcjp0aGlzLnN0YXRlLmNhdGFsb2dfbnVtYmVyXG4gICAgfVxuICAgIGlmKHdpbmRvdy5lZGl0aW5nKXtcbiAgICAgIGlmKGhhc0NvdXJzZShjb3Vyc2UpKXtcbiAgICAgICAgYWxlcnQoXCJDb3Vyc2UgYWxyZWFkeSBhZGRlZFwiKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGRhdGEuY291cnNlTGlzdC5wdXNoKGNvdXJzZSlcbiAgICAgICAgYW5pbWF0ZUVsZW0gPSAkKFwiLnNlYXJjaFJlc3VsdFwiKS5jbG9uZSgpLmFkZENsYXNzKFwiYW5pbWF0ZS1jb3Vyc2VcIilcbiAgICAgICAgYW5pbWF0ZUVsZW0ucmVtb3ZlQXR0cihcImRhdGEtcmVhY3RpZFwiKS5maW5kKFwiW2RhdGEtcmVhY3RpZF1cIikucmVtb3ZlQXR0cihcImRhdGEtcmVhY3RpZFwiKVxuICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQoYW5pbWF0ZUVsZW0pXG4gICAgICAgIGFuaW1hdGVFbGVtLmNzcyh7XG4gICAgICAgICAgdG9wOiQoXCIuc2VhcmNoUmVzdWx0XCIpLm9mZnNldCgpLnRvcCxcbiAgICAgICAgICBsZWZ0OiQoXCIuc2VhcmNoUmVzdWx0XCIpLm9mZnNldCgpLmxlZnQsXG4gICAgICAgICAgd2lkdGg6JChcIi5zZWFyY2hSZXN1bHRcIikub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgIGhlaWdodDokKFwiLnNlYXJjaFJlc3VsdFwiKS5vdXRlckhlaWdodCgpXG4gICAgICAgIH0pLmFuaW1hdGUoe1xuICAgICAgICAgIHRvcDokKFwiLmJ1Y2tldCAubW92ZUJsb2NrXCIpLm9mZnNldCgpLnRvcCxcbiAgICAgICAgICBsZWZ0OiQoXCIuYnVja2V0IC5tb3ZlQmxvY2tcIikub2Zmc2V0KCkubGVmdCxcbiAgICAgICAgICB3aWR0aDokKFwiLmJ1Y2tldCAubW92ZUJsb2NrXCIpLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICBoZWlnaHQ6JChcIi5idWNrZXQgLm1vdmVCbG9ja1wiKS5vdXRlckhlaWdodCgpXG4gICAgICAgIH0sIDUwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICBhbmltYXRlRWxlbS5yZW1vdmUoKVxuICAgICAgICB9KVxuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKFwiZGF0YVVwZGF0ZWRcIilcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcihcImNvdXJzZS5hZGRlZC51d2NzXCIpXG4gICAgICAgICQoXCIjc2VhcmNoSW5wdXRcIikuZm9jdXMoKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYmxvY2tDbGljazpmdW5jdGlvbihlKXtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuICBkcm9wOmZ1bmN0aW9uKGUpe1xuICAgIHZhciBjb3Vyc2VOYW1lID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcInRleHQvY291cnNlXCIpXG4gICAgZm9yICh2YXIgdGVybUluZGV4ID0gLTE7IHRlcm1JbmRleCA8IGRhdGEuc2NoZWR1bGUubGVuZ3RoOyB0ZXJtSW5kZXgrKykge1xuICAgICAgdmFyIHRlcm0gPSBnZXRUZXJtTGlzdCh0ZXJtSW5kZXgpXG4gICAgICBmb3IgKHZhciBjb3Vyc2VJbmRleCA9IDA7IGNvdXJzZUluZGV4IDwgdGVybS5sZW5ndGg7IGNvdXJzZUluZGV4KyspIHtcbiAgICAgICAgaWYoZ2V0Q291cnNlTmFtZSh0ZXJtW2NvdXJzZUluZGV4XSk9PWNvdXJzZU5hbWUpe1xuICAgICAgICAgIHRlcm0uc3BsaWNlKGNvdXJzZUluZGV4LDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9LFxuICBkcmFnT3ZlcjpmdW5jdGlvbihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0sXG4gIGhhbmRsZUtleWRvd246ZnVuY3Rpb24oZSl7XG4gICAgc2Nyb2xsZWQgPSBmYWxzZVxuICAgIGlmKGUua2V5Q29kZT09NDApey8vZG93blxuICAgICAgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPHRoaXMuc3RhdGUuZGF0YUxpc3QubGVuZ3RoLTEpXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFMaXN0U2VsZWN0ZWQ6dGhpcy5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkKzF9LGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJCgnLnNlYXJjaFJlc3VsdCAuY29udGFpbmVyJykuc2Nyb2xsVG9wKCgkKFwiLnN1Z2dlc3Rpb24uYWN0aXZlXCIpLmluZGV4KCktNSkqMjgpXG4gICAgICAgIH0pXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9ZWxzZSBpZihlLmtleUNvZGU9PTM4KXsvL3VwXG4gICAgICBpZih0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQ+MClcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUxpc3RTZWxlY3RlZDp0aGlzLnN0YXRlLmRhdGFMaXN0U2VsZWN0ZWQtMX0sZnVuY3Rpb24oKXtcbiAgICAgICAgICAkKCcuc2VhcmNoUmVzdWx0IC5jb250YWluZXInKS5zY3JvbGxUb3AoKCQoXCIuc3VnZ2VzdGlvbi5hY3RpdmVcIikuaW5kZXgoKS01KSoyOClcbiAgICAgICAgfSlcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlQ2xpY2s6ZnVuY3Rpb24oaW5kZXhTZWxlY3RlZCl7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICB0aGlzLnNldFN0YXRlKHtkYXRhTGlzdFNlbGVjdGVkOmluZGV4U2VsZWN0ZWR9LGZ1bmN0aW9uKCl7XG4gICAgICAkKFwiI3NlYXJjaElucHV0XCIpLmZvY3VzKClcbiAgICAgIHRoYXQuaGFuZGxlU3VibWl0KClcbiAgICB9KVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjTmFtZSA9IFwic2VhcmNoUmVzdWx0XCIrKHRoaXMuc3RhdGUuZm9jdXM/XCJcIjpcIiBoaWRlVXBcIilcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgaWYodGhpcy5zdGF0ZS5tZXNzYWdlIT1cIlwiKXtcbiAgICAgIHZhciBjb250ZW50PShcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5tZXNzYWdlfVxuICAgICAgICAgICAgICA8L2Rpdj4pXG4gICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5zZWFyY2hlZCl7XG4gICAgICB2YXIgY291cnNlPXV3YXBpLmdldEluZm8oe3N1YmplY3Q6dGhpcy5zdGF0ZS5zdWJqZWN0LFxuICAgICAgICBjYXRhbG9nX251bWJlcjp0aGlzLnN0YXRlLmNhdGFsb2dfbnVtYmVyfSk7XG4gICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgzPjxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9e2NvdXJzZS51cmx9Pntjb3Vyc2Uuc3ViamVjdCtcIiBcIitjb3Vyc2UuY2F0YWxvZ19udW1iZXIrXCIgLSBcIitjb3Vyc2UudGl0bGV9PC9hPjwvaDM+XG4gICAgICAgICAgICAgICAgPHA+e2NvdXJzZS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPkFudGlyZXE6IDwvc3Ryb25nPntjb3Vyc2UuYW50aXJlcXVpc2l0ZXx8XCJub25lXCJ9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48c3Ryb25nPlByZXJlcTogPC9zdHJvbmc+e2NvdXJzZS5wcmVyZXF1aXNpdGVzfHxcIm5vbmVcIn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxzdHJvbmc+VGVybXMgb2ZmZXJlZDogPC9zdHJvbmc+e2dldFRlcm1OYW1lQXJyYXkoY291cnNlLnRlcm1zX29mZmVyZWQpLmpvaW4oXCIsIFwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHQgY29sLXhzLTEyIGNvbC1tZC02XCI+XG4gICAgICAgICAgICAgICAgICB7KCQoXCIjYWRtaW4tYnRuXCIpLmxlbmd0aCk/PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNFwiPjxhIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdCBidG4tYmxvY2tcIiBocmVmPXtcIi9hZG1pbi9hcHAvY291cnNlL1wiK2NvdXJzZS5pZH0+RWRpdDwvYT48L2Rpdj46e319XG4gICAgICAgICAgICAgICAgICB7KHdpbmRvdy5lZGl0aW5nKT88ZGl2IGNsYXNzTmFtZT1cImNvbC14cy04XCI+PGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgYnRuLWJsb2NrIGFkZFRvTGlzdEJ0blwiPkFkZCB0byBsaXN0PC9idXR0b24+PC9kaXY+Ont9fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKVxuICAgIH1lbHNle1xuICAgICAgLy9zaG93IHN1Z2dlc3Rpb25cbiAgICAgIGlmKHRoaXMuc3RhdGUuZGF0YUxpc3RUeXBlPT1cIlN1YmplY3RcIil7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc3RhdGUuZGF0YUxpc3RcbiAgICAgICAgdmFyIHN1YmplY3RFbHMgPSBkYXRhTGlzdC5tYXAoZnVuY3Rpb24oc3ViamVjdCxpKXtcbiAgICAgICAgICByZXR1cm4oXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17XCJzdWdnZXN0aW9uXCIrKHRoYXQuc3RhdGUuZGF0YUxpc3RTZWxlY3RlZD09aT9cIiBhY3RpdmVcIjpcIlwiKX0gb25DbGljaz17dGhhdC5oYW5kbGVDbGljay5iaW5kKHRoYXQsaSl9PlxuICAgICAgICAgICAgICA8c3Ryb25nPntzdWJqZWN0Lm5hbWV9PC9zdHJvbmc+IC0ge3N1YmplY3QuZGVzY3JpcHRpb259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgPlxuICAgICAgICAgICAge3N1YmplY3RFbHMubGVuZ3RoPjA/c3ViamVjdEVsczooXG4gICAgICAgICAgICAgIFwiU3ViamVjdCBub3QgZm91bmQgXCIrdGhhdC5zdGF0ZS5zdWJqZWN0XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKVxuICAgICAgfWVsc2UgaWYodGhpcy5zdGF0ZS5kYXRhTGlzdFR5cGU9PVwiQ291cnNlXCIpe1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLnN0YXRlLmRhdGFMaXN0XG4gICAgICAgIHZhciBjb3Vyc2VFbHMgPSBkYXRhTGlzdC5tYXAoZnVuY3Rpb24oY291cnNlLGkpe1xuICAgICAgICAgIHJldHVybihcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcInN1Z2dlc3Rpb25cIisodGhhdC5zdGF0ZS5kYXRhTGlzdFNlbGVjdGVkPT1pP1wiIGFjdGl2ZVwiOlwiXCIpfSBvbkNsaWNrPXt0aGF0LmhhbmRsZUNsaWNrLmJpbmQodGhhdCxpKX0+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e3RoYXQuc3RhdGUuc3ViamVjdCtjb3Vyc2UuY2F0YWxvZ19udW1iZXJ9PC9zdHJvbmc+IC0ge2NvdXJzZS50aXRsZX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgICB2YXIgY29udGVudD0oXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIiA+XG4gICAgICAgICAgICB7Y291cnNlRWxzLmxlbmd0aD4wP2NvdXJzZUVsczooXG4gICAgICAgICAgICAgIFwiQ291cnNlIG5vdCBmb3VuZDogXCIrdGhhdC5zdGF0ZS5zdWJqZWN0K1wiIFwiK3RoYXQuc3RhdGUuY2F0YWxvZ19udW1iZXJcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdmFyIGNvbnRlbnQ9KFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgPlxuICAgICAgICAgICAgRW50ZXIgQ291cnNlIENvZGU6IGkuZSA8c3Ryb25nPkNTMjQxPC9zdHJvbmc+LCA8c3Ryb25nPkVOR0wxMDk8L3N0cm9uZz4sIC4uLlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuKFxuICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibmF2YmFyLWZvcm0gbmF2YmFyLWxlZnRcIiBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3NlYXJjaElucHV0JyB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0nU2VhcmNoIGZvciBDb3Vyc2UnIGNsYXNzTmFtZT17J2Zvcm0tY29udHJvbCcrKHRoaXMuc3RhdGUuZm9jdXM/XCIgZm9jdXNlZFwiOlwiXCIpfSB2YWx1ZT17dGhpcy5zdGF0ZS5pbnB1dH0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlfSBvbkZvY3VzPXt0aGlzLmhhbmRsZUZvY3VzfSByZWY9XCJzZWFyY2hJbnB1dFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlkb3dufS8+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPXtcImZhIGZhLXNwaW4gZmEtc3Bpbm5lciBzZWFyY2hJbmRpY2F0b3IgXCIrKHRoaXMuc3RhdGUubG9hZGluZz9cIlwiOlwiaGlkZVwiKX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHsod2luZG93LmVkaXRpbmcpPzxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cCBkZWxldGVCdG5cIiBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiB0aXRsZT1cIkRyYWcgY291cnNlIGhlcmUgdG8gZGVsZXRlXCIgZGF0YS1wbGFjZW1lbnQ9XCJib3R0b21cIiByZWY9XCJkZWxldGVCdG5cIiBvbkRyb3A9e3RoaXMuZHJvcH0gb25EcmFnT3Zlcj17dGhpcy5kcmFnT3Zlcn0+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPVwicGUtN3MtdHJhc2ggZmEtZndcIi8+XG4gICAgICAgIDwvZGl2Pjp7fX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NOYW1lfSA+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9mb3JtPlxuICAgICk7XG4gIH1cbn0pXG5cblxuXG4kKGZ1bmN0aW9uKCl7XG4gIFJlYWN0LnJlbmRlckNvbXBvbmVudChcbiAgICA8QWRkQ291cnNlTW9kYWwgLz4sXG4gICAgJChcIiNzZWFyY2hCdG5XcmFwcGVyXCIpLmdldCgwKVxuICApO1xufSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=