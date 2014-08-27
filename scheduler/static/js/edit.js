/** @jsx React.DOM */

function isAllString(list){
  for (var i = 0; i < list.length; i++) {
    if(typeof list[i]!="string")return false
  };
  return true;
}
function checkPrereq(courseTaken,prereq,isRecur){
  if(!prereq)return true;
  var count=isRecur?1:isAllString(prereq)?1:prereq.length;
  if(typeof prereq[0] === "number"){
    count=prereq.shift();
  }
  for (var i = 0; i < prereq.length; i++) {
    if(typeof prereq[i]==="string"){
      if(courseTaken.indexOf(prereq[i])!=-1){
        //condition satisfied
        count--;
        if(count==0)break;
      }else{
        //condition not satisfied

      }
    }else{
      if(checkPrereq(courseTaken,prereq[i],true)){
        //condition satisfied
        count--;
        if(count==0)break;
      }else{
        //condition not satisfied
      }
    }
  };
  return count<=0;
}
function getTermNameArray(terms_offered){
  return terms_offered.map(function(i){return i=="F"?"Fall":i=="W"?"Winter":"Spring"})
}
function hasCourse(course){
  for (var i = 0; i < data.courseList.length; i++) {
    if(getCourseName(data.courseList[i])==getCourseName(course))
      return true;
  };
  for (var i = 0; i < data.schedule.length; i++) {
    for (var j = 0; j < data.schedule[i].courses.length; j++) {
      if(data.schedule[i].courses[j].subject==course.subject&&
        data.schedule[i].courses[j].catalog_number==course.catalog_number)
        return true;
    };
  };
  return false;
}
function getTermList(termIndex){
  return termIndex==-1?data.courseList:data.schedule[termIndex].courses
}


SaveBtnGroup=React.createClass({displayName: 'SaveBtnGroup',
  defaultSaveInterval:60,
  getInitialState: function() {
    return {saveTime:this.defaultSaveInterval, saveText:"", saving:false};
  },
  setTimer:function(){
    var that=this;
    this.timer=setInterval(function(){
      if(!data.autoSave) return;
      if(that.state.saveTime<=1){
        that.save();
        that.setState({saveTime:that.defaultSaveInterval})
      }else{
        that.setState({saveTime:that.state.saveTime-1})
      }
    },1000);
  },
  componentDidMount:function(prevProps, prevState){
    this.setTimer();
  },
  save:function(e){
    var that = this
    this.setState({saveText:"", saveTime:this.defaultSaveInterval, saving:true})
    $.ajax({
      url:"/save/"+data.coursePlanId+"/",
      type:"post",
      dataType:"json",
      data:{
        courseList:JSON.stringify(data.courseList),
        csrfmiddlewaretoken:data.csrf_token,
        schedule:JSON.stringify(data.schedule)
      },
      success:function(json){
        if(json.success){
          that.setState({saving:false})
        }else{
          that.setState({saveText:"save failed. check your internet connection",saving:false})
        }
      },
      error:function(){
        that.setState({saveText:"save failed. check your internet connection",saving:false})
      }
    })
  },
  loadModal:function(){
    $("#modalContainer").load("/share/"+data.coursePlanId+"/")
  },
  render: function() {
    saveText=this.state.saveText
    if(data.autoSave){
      saveText = this.state.saveText!=""?this.state.saveText:React.DOM.span(null, "Auto Save in ", React.DOM.strong({className: "important"}, this.state.saveTime), "s")
    }
    if(this.state.saving){
      var saveBtn = (
        React.DOM.a({className: "btn btn-primary disabled"}, 
          React.DOM.i({className: "fa fa-save fa-fw fa-spin"}), " Saving"
        )
        )
    }else{
      var saveBtn = (
        React.DOM.a({className: "btn btn-primary", onClick: this.save}, 
          React.DOM.i({className: "fa fa-save fa-fw"}), " Save"
        )
        )
    }
    return(
      React.DOM.span(null, 
        saveText, "    ", 
        saveBtn, "    ", 
        React.DOM.a({className: "btn btn-primary", onClick: this.loadModal}, 
          React.DOM.i({className: "fa fa-share fa-fw"}), " Share"
        )
      )
    );
  }
})

MainView=React.createClass({displayName: 'MainView',
  getInitialState: function() {
    return {
            dragingCourse:""
          };
  },
  componentDidMount:function(){
    $(document).on('dataUpdated', this.refresh);
    $(document).trigger('ready.uwcs')
  },
  componentWillUnmount: function() {
    $(document).off('dataUpdated', this.refresh);
  },
  toggleSkipTerm:function(termIndex){
    if(data.schedule[termIndex].skiped){
      data.schedule[termIndex].skiped = false
    }else{
      data.schedule.splice(termIndex, 0, {skiped:true,courses:[]});
    }
    this.forceUpdate();
  },
  refresh:function(e){
    console.log("force refresh")
    this.forceUpdate()
  },
  addTerm:function(termIndex){
    data.schedule.splice(termIndex,0,{courses:[]});
    this.forceUpdate();
  },
  addCourse:function(termIndex,course){
    getTermList(termIndex).push(course);
  },
  removeTerm:function(termIndex){
    data.schedule.splice(termIndex, 1);
    this.forceUpdate();
  },
  removeCourse:function(termIndex, courseIndex){
    getTermList(termIndex).splice(courseIndex,1);
  },
  dragStart:function(termIndex, courseIndex, e){
    var course = getTermList(termIndex)[courseIndex]
    e.dataTransfer.setData("text/course", course.subject+course.catalog_number);
    if(this.state.dragingCourse!="") return false;
    this.hidePreview();
    this.setState({dragingCourse:{
      termIndex:termIndex,
      courseIndex:courseIndex
    }},function(){
      $(document).trigger('course.move.uwcs')
    });
    return true;
  },
  dragEnd:function(e){
    this.setState({dragingCourse:""});
    $(document).trigger('course.movecanceled.uwcs')
  },
  dragOver:function(e){
    e.preventDefault();
  },
  drop:function(termIndex, courseIndex, e){
    var fromTermIndex = this.state.dragingCourse.termIndex
    var fromCourseIndex = this.state.dragingCourse.courseIndex
    var fromCourse = getTermList(fromTermIndex)[fromCourseIndex]
    if(getTermList(termIndex).length==courseIndex){
      this.removeCourse(fromTermIndex, fromCourseIndex);
      this.addCourse(termIndex, fromCourse);
      $(document).trigger('course.moved.uwcs')
    }else{
      //swap
      var destCourse = getTermList(termIndex)[courseIndex]
      getTermList(termIndex)[courseIndex] = fromCourse
      getTermList(fromTermIndex)[fromCourseIndex] = destCourse
      $(document).trigger('course.swaped.uwcs')
    }
    this.setState({dragingCourse:""});
  },
  showPreview:function(termIndex, courseIndex){
    var course = getTermList(termIndex)[courseIndex]
    window.showCoursePreview(course)
  },
  hidePreview:function(){
    window.hidePreview()
  },
  showhelp:function(text){
    window.showPreview(text)
  },
  render: function() {
    var that=this;
    var startYear=this.state.startYear;
    var startTerm=this.state.startTerm;
    var courseTaken=[];

    var listEl=data.courseList.map(function(course,i){
      return (
        React.DOM.div({className: "course", key: i, draggable: "true", onDragStart: that.dragStart.bind(that,-1,i), onDragEnd: that.dragEnd, onDragOver: that.dragOver, onDrop: that.drop.bind(that,-1,i), onMouseEnter: that.showPreview.bind(that,-1,i), onMouseLeave: that.hidePreview}, 
          React.DOM.div({className: "panel panel-default"}, 
            React.DOM.div({className: "panel-body"}, 
              React.DOM.strong(null, course.subject+" "+course.catalog_number+" ")
            )
          )
        )
        )
    })
    listEl.push((
      React.DOM.div({className: "course moveBlock "+(that.state.dragingCourse==""||that.state.dragingCourse.termIndex==-1?"invisible":""), onDragOver: that.dragOver, onDrop: that.drop.bind(that,-1,listEl.length)}, 
          "Move Here"
      )
      ))

    var termsEl=data.schedule.map(function(term,i){
      var termName=calculateTerm(data.startYear,data.startTerm,i);
      var buttons=(
        React.DOM.div({className: "term-menu"}, 
          React.DOM.button({onMouseEnter: that.showhelp.bind(that,"Remove this term"), onMouseLeave: that.hidePreview, className: "removeTermBtn btn", onClick: that.removeTerm.bind(that,i)}, React.DOM.i({className: "fa fa-fw fa-times"})), 
          React.DOM.button({onMouseEnter: that.showhelp.bind(that,"Insert a term above"), onMouseLeave: that.hidePreview, className: "insertTermBtn btn", onClick: that.addTerm.bind(that,i)}, React.DOM.i({className: "fa fa-fw fa-plus"})), 
          React.DOM.button({onMouseEnter: that.showhelp.bind(that,(term.skiped?"Un-skip":"Skip")), onMouseLeave: that.hidePreview, className: "skipTermBtn btn", onClick: that.toggleSkipTerm.bind(that,i)}, React.DOM.i({className: "fa fa-fw "+(term.skiped?"fa-reply":"fa-share")}))
        )
      )
      if(term.skiped){
        return(
        React.DOM.div({className: "term skiped", key: i, id: i}, 
          React.DOM.div({className: "term-title"}, React.DOM.h4(null, termName+" ")), 
          buttons, 
          React.DOM.div({className: "courses"}, 
            "Skiped / Coop"
          ), 
          React.DOM.div({className: "clearfix"})
        )
        )
      }
      var currentTermCourses=term.courses.map(function(course,j){
        var courseInfo=uwapi.getInfo(course);
        var offeredInCurrentTerm=getTermNameArray(courseInfo.terms_offered).indexOf(termName.substr(5))>-1;
        var satisfied=checkPrereq(courseTaken,courseInfo.prerequisites_parsed);
        var classStr="course";
        return (
          React.DOM.div({className: classStr, key: j, draggable: "true", onDragStart: that.dragStart.bind(that,i,j), onDragEnd: that.dragEnd, onDragOver: that.dragOver, onDrop: that.drop.bind(that,i,j), 'data-subject': course.subject, 'data-catalog_number': course.catalog_number, onMouseEnter: that.showPreview.bind(that,i,j), onMouseLeave: that.hidePreview}, 
            React.DOM.div({className: "panel panel-"+(satisfied&&offeredInCurrentTerm?"default":"danger")}, 
              React.DOM.div({className: "panel-body"}, 
                React.DOM.strong(null, courseInfo.subject+" "+courseInfo.catalog_number+" ")
              ), 
              satisfied&&offeredInCurrentTerm?(React.DOM.div({className: "panel-footer"}, "All satisfied")):(React.DOM.div({className: "panel-footer"}, 
                !satisfied?(React.DOM.p(null, React.DOM.strong(null, "Prerequisites not satisfied.", React.DOM.br(null), "Prereq: "), courseInfo.prerequisites)):{}, 
                !offeredInCurrentTerm?(React.DOM.p(null, React.DOM.strong(null, "Not offered in this term.", React.DOM.br(null), "Terms offered: "), getTermNameArray(courseInfo.terms_offered).join(", "))):{}
              ))
            )
          ))
      })
      var backgroundText=(
        React.DOM.div({className: "backgroundText"}, 
          "No course for this term."
        )
        )
      $.each(term.courses,function(i,course){courseTaken.push(getCourseName(course))});
      return (
        React.DOM.div({key: i, className: "term", id: i}, 
          React.DOM.div({className: "term-title"}, React.DOM.h4(null, termName+" ")), 
          buttons, 
          React.DOM.div({className: "courses"}, 
            currentTermCourses, 
            !term.courses.length&&that.state.dragingCourse==""?backgroundText:"", 
            React.DOM.div({className: "course moveBlock "+(that.state.dragingCourse==""||i==that.state.dragingCourse.termIndex?"invisible":""), onDragOver: that.dragOver, onDrop: that.drop.bind(that,i,term.courses.length)}, 
                "Move Here"
            )
          ), 
          React.DOM.div({className: "clearfix"})
        )
      )
    })

    return(
      React.DOM.div({className: that.state.dragingCourse!=""?"draging":""}, 
        React.DOM.div({className: "bucket"}, 
          React.DOM.strong(null, "Course Short List"), 
          listEl
        ), 
        React.DOM.div({className: "settingsbar"}, 
          React.DOM.div({className: "container"}, 
            "Total credits: ", 
            React.DOM.strong({className: "important"}, courseTaken.length*0.5), 
            React.DOM.div({className: "pull-right"}, 
              SaveBtnGroup(null)
            )
          )
        ), 
        React.DOM.div({className: "container"}, 
          React.DOM.div({className: "row"}, 
            React.DOM.div({className: "col-xs-12 terms"}, 
              termsEl
            ), 
            React.DOM.div({className: "col-xs-12 text-center"}, 
              React.DOM.button({className: "btn btn-default addTermBtn btn-lg", onClick: that.addTerm.bind(that,data.schedule.length)}, 
                React.DOM.i({className: "fa fa-plus fa-fw"}), " Add a Term"
              )
            )
          )
        )
      )
    );
  }
});


window.editing=true;
$(function(){
  React.renderComponent(
    MainView(null),
    $("#main").get(0)
  );
})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImVkaXQuanN4Il0sInNvdXJjZXNDb250ZW50IjpbIlxuZnVuY3Rpb24gaXNBbGxTdHJpbmcobGlzdCl7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGlmKHR5cGVvZiBsaXN0W2ldIT1cInN0cmluZ1wiKXJldHVybiBmYWxzZVxuICB9O1xuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGNoZWNrUHJlcmVxKGNvdXJzZVRha2VuLHByZXJlcSxpc1JlY3VyKXtcbiAgaWYoIXByZXJlcSlyZXR1cm4gdHJ1ZTtcbiAgdmFyIGNvdW50PWlzUmVjdXI/MTppc0FsbFN0cmluZyhwcmVyZXEpPzE6cHJlcmVxLmxlbmd0aDtcbiAgaWYodHlwZW9mIHByZXJlcVswXSA9PT0gXCJudW1iZXJcIil7XG4gICAgY291bnQ9cHJlcmVxLnNoaWZ0KCk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVyZXEubGVuZ3RoOyBpKyspIHtcbiAgICBpZih0eXBlb2YgcHJlcmVxW2ldPT09XCJzdHJpbmdcIil7XG4gICAgICBpZihjb3Vyc2VUYWtlbi5pbmRleE9mKHByZXJlcVtpXSkhPS0xKXtcbiAgICAgICAgLy9jb25kaXRpb24gc2F0aXNmaWVkXG4gICAgICAgIGNvdW50LS07XG4gICAgICAgIGlmKGNvdW50PT0wKWJyZWFrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vY29uZGl0aW9uIG5vdCBzYXRpc2ZpZWRcblxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgaWYoY2hlY2tQcmVyZXEoY291cnNlVGFrZW4scHJlcmVxW2ldLHRydWUpKXtcbiAgICAgICAgLy9jb25kaXRpb24gc2F0aXNmaWVkXG4gICAgICAgIGNvdW50LS07XG4gICAgICAgIGlmKGNvdW50PT0wKWJyZWFrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vY29uZGl0aW9uIG5vdCBzYXRpc2ZpZWRcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHJldHVybiBjb3VudDw9MDtcbn1cbmZ1bmN0aW9uIGdldFRlcm1OYW1lQXJyYXkodGVybXNfb2ZmZXJlZCl7XG4gIHJldHVybiB0ZXJtc19vZmZlcmVkLm1hcChmdW5jdGlvbihpKXtyZXR1cm4gaT09XCJGXCI/XCJGYWxsXCI6aT09XCJXXCI/XCJXaW50ZXJcIjpcIlNwcmluZ1wifSlcbn1cbmZ1bmN0aW9uIGhhc0NvdXJzZShjb3Vyc2Upe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuY291cnNlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGlmKGdldENvdXJzZU5hbWUoZGF0YS5jb3Vyc2VMaXN0W2ldKT09Z2V0Q291cnNlTmFtZShjb3Vyc2UpKVxuICAgICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5zY2hlZHVsZS5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGF0YS5zY2hlZHVsZVtpXS5jb3Vyc2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZihkYXRhLnNjaGVkdWxlW2ldLmNvdXJzZXNbal0uc3ViamVjdD09Y291cnNlLnN1YmplY3QmJlxuICAgICAgICBkYXRhLnNjaGVkdWxlW2ldLmNvdXJzZXNbal0uY2F0YWxvZ19udW1iZXI9PWNvdXJzZS5jYXRhbG9nX251bWJlcilcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gZ2V0VGVybUxpc3QodGVybUluZGV4KXtcbiAgcmV0dXJuIHRlcm1JbmRleD09LTE/ZGF0YS5jb3Vyc2VMaXN0OmRhdGEuc2NoZWR1bGVbdGVybUluZGV4XS5jb3Vyc2VzXG59XG5cblxuU2F2ZUJ0bkdyb3VwPVJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGVmYXVsdFNhdmVJbnRlcnZhbDo2MCxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3NhdmVUaW1lOnRoaXMuZGVmYXVsdFNhdmVJbnRlcnZhbCwgc2F2ZVRleHQ6XCJcIiwgc2F2aW5nOmZhbHNlfTtcbiAgfSxcbiAgc2V0VGltZXI6ZnVuY3Rpb24oKXtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHRoaXMudGltZXI9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgIGlmKCFkYXRhLmF1dG9TYXZlKSByZXR1cm47XG4gICAgICBpZih0aGF0LnN0YXRlLnNhdmVUaW1lPD0xKXtcbiAgICAgICAgdGhhdC5zYXZlKCk7XG4gICAgICAgIHRoYXQuc2V0U3RhdGUoe3NhdmVUaW1lOnRoYXQuZGVmYXVsdFNhdmVJbnRlcnZhbH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhhdC5zZXRTdGF0ZSh7c2F2ZVRpbWU6dGhhdC5zdGF0ZS5zYXZlVGltZS0xfSlcbiAgICAgIH1cbiAgICB9LDEwMDApO1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSl7XG4gICAgdGhpcy5zZXRUaW1lcigpO1xuICB9LFxuICBzYXZlOmZ1bmN0aW9uKGUpe1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHRoaXMuc2V0U3RhdGUoe3NhdmVUZXh0OlwiXCIsIHNhdmVUaW1lOnRoaXMuZGVmYXVsdFNhdmVJbnRlcnZhbCwgc2F2aW5nOnRydWV9KVxuICAgICQuYWpheCh7XG4gICAgICB1cmw6XCIvc2F2ZS9cIitkYXRhLmNvdXJzZVBsYW5JZCtcIi9cIixcbiAgICAgIHR5cGU6XCJwb3N0XCIsXG4gICAgICBkYXRhVHlwZTpcImpzb25cIixcbiAgICAgIGRhdGE6e1xuICAgICAgICBjb3Vyc2VMaXN0OkpTT04uc3RyaW5naWZ5KGRhdGEuY291cnNlTGlzdCksXG4gICAgICAgIGNzcmZtaWRkbGV3YXJldG9rZW46ZGF0YS5jc3JmX3Rva2VuLFxuICAgICAgICBzY2hlZHVsZTpKU09OLnN0cmluZ2lmeShkYXRhLnNjaGVkdWxlKVxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6ZnVuY3Rpb24oanNvbil7XG4gICAgICAgIGlmKGpzb24uc3VjY2Vzcyl7XG4gICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7c2F2aW5nOmZhbHNlfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7c2F2ZVRleHQ6XCJzYXZlIGZhaWxlZC4gY2hlY2sgeW91ciBpbnRlcm5ldCBjb25uZWN0aW9uXCIsc2F2aW5nOmZhbHNlfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9yOmZ1bmN0aW9uKCl7XG4gICAgICAgIHRoYXQuc2V0U3RhdGUoe3NhdmVUZXh0Olwic2F2ZSBmYWlsZWQuIGNoZWNrIHlvdXIgaW50ZXJuZXQgY29ubmVjdGlvblwiLHNhdmluZzpmYWxzZX0pXG4gICAgICB9XG4gICAgfSlcbiAgfSxcbiAgbG9hZE1vZGFsOmZ1bmN0aW9uKCl7XG4gICAgJChcIiNtb2RhbENvbnRhaW5lclwiKS5sb2FkKFwiL3NoYXJlL1wiK2RhdGEuY291cnNlUGxhbklkK1wiL1wiKVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHNhdmVUZXh0PXRoaXMuc3RhdGUuc2F2ZVRleHRcbiAgICBpZihkYXRhLmF1dG9TYXZlKXtcbiAgICAgIHNhdmVUZXh0ID0gdGhpcy5zdGF0ZS5zYXZlVGV4dCE9XCJcIj90aGlzLnN0YXRlLnNhdmVUZXh0OjxzcGFuPkF1dG8gU2F2ZSBpbiA8c3Ryb25nIGNsYXNzTmFtZT1cImltcG9ydGFudFwiPnt0aGlzLnN0YXRlLnNhdmVUaW1lfTwvc3Ryb25nPnM8L3NwYW4+XG4gICAgfVxuICAgIGlmKHRoaXMuc3RhdGUuc2F2aW5nKXtcbiAgICAgIHZhciBzYXZlQnRuID0gKFxuICAgICAgICA8YSBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgZGlzYWJsZWRcIj5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1zYXZlIGZhLWZ3IGZhLXNwaW5cIj48L2k+IFNhdmluZ1xuICAgICAgICA8L2E+XG4gICAgICAgIClcbiAgICB9ZWxzZXtcbiAgICAgIHZhciBzYXZlQnRuID0gKFxuICAgICAgICA8YSBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLnNhdmV9PlxuICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLXNhdmUgZmEtZndcIj48L2k+IFNhdmVcbiAgICAgICAgPC9hPlxuICAgICAgICApXG4gICAgfVxuICAgIHJldHVybihcbiAgICAgIDxzcGFuPlxuICAgICAgICB7c2F2ZVRleHR9Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XG4gICAgICAgIHtzYXZlQnRufSZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xuICAgICAgICA8YSBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLmxvYWRNb2RhbH0+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtc2hhcmUgZmEtZndcIj48L2k+IFNoYXJlXG4gICAgICAgIDwvYT5cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG59KVxuXG5NYWluVmlldz1SZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRyYWdpbmdDb3Vyc2U6XCJcIlxuICAgICAgICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OmZ1bmN0aW9uKCl7XG4gICAgJChkb2N1bWVudCkub24oJ2RhdGFVcGRhdGVkJywgdGhpcy5yZWZyZXNoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdyZWFkeS51d2NzJylcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICQoZG9jdW1lbnQpLm9mZignZGF0YVVwZGF0ZWQnLCB0aGlzLnJlZnJlc2gpO1xuICB9LFxuICB0b2dnbGVTa2lwVGVybTpmdW5jdGlvbih0ZXJtSW5kZXgpe1xuICAgIGlmKGRhdGEuc2NoZWR1bGVbdGVybUluZGV4XS5za2lwZWQpe1xuICAgICAgZGF0YS5zY2hlZHVsZVt0ZXJtSW5kZXhdLnNraXBlZCA9IGZhbHNlXG4gICAgfWVsc2V7XG4gICAgICBkYXRhLnNjaGVkdWxlLnNwbGljZSh0ZXJtSW5kZXgsIDAsIHtza2lwZWQ6dHJ1ZSxjb3Vyc2VzOltdfSk7XG4gICAgfVxuICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgfSxcbiAgcmVmcmVzaDpmdW5jdGlvbihlKXtcbiAgICBjb25zb2xlLmxvZyhcImZvcmNlIHJlZnJlc2hcIilcbiAgICB0aGlzLmZvcmNlVXBkYXRlKClcbiAgfSxcbiAgYWRkVGVybTpmdW5jdGlvbih0ZXJtSW5kZXgpe1xuICAgIGRhdGEuc2NoZWR1bGUuc3BsaWNlKHRlcm1JbmRleCwwLHtjb3Vyc2VzOltdfSk7XG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICB9LFxuICBhZGRDb3Vyc2U6ZnVuY3Rpb24odGVybUluZGV4LGNvdXJzZSl7XG4gICAgZ2V0VGVybUxpc3QodGVybUluZGV4KS5wdXNoKGNvdXJzZSk7XG4gIH0sXG4gIHJlbW92ZVRlcm06ZnVuY3Rpb24odGVybUluZGV4KXtcbiAgICBkYXRhLnNjaGVkdWxlLnNwbGljZSh0ZXJtSW5kZXgsIDEpO1xuICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgfSxcbiAgcmVtb3ZlQ291cnNlOmZ1bmN0aW9uKHRlcm1JbmRleCwgY291cnNlSW5kZXgpe1xuICAgIGdldFRlcm1MaXN0KHRlcm1JbmRleCkuc3BsaWNlKGNvdXJzZUluZGV4LDEpO1xuICB9LFxuICBkcmFnU3RhcnQ6ZnVuY3Rpb24odGVybUluZGV4LCBjb3Vyc2VJbmRleCwgZSl7XG4gICAgdmFyIGNvdXJzZSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClbY291cnNlSW5kZXhdXG4gICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvY291cnNlXCIsIGNvdXJzZS5zdWJqZWN0K2NvdXJzZS5jYXRhbG9nX251bWJlcik7XG4gICAgaWYodGhpcy5zdGF0ZS5kcmFnaW5nQ291cnNlIT1cIlwiKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5oaWRlUHJldmlldygpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RyYWdpbmdDb3Vyc2U6e1xuICAgICAgdGVybUluZGV4OnRlcm1JbmRleCxcbiAgICAgIGNvdXJzZUluZGV4OmNvdXJzZUluZGV4XG4gICAgfX0sZnVuY3Rpb24oKXtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ2NvdXJzZS5tb3ZlLnV3Y3MnKVxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmFnRW5kOmZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuc2V0U3RhdGUoe2RyYWdpbmdDb3Vyc2U6XCJcIn0pO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ2NvdXJzZS5tb3ZlY2FuY2VsZWQudXdjcycpXG4gIH0sXG4gIGRyYWdPdmVyOmZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSxcbiAgZHJvcDpmdW5jdGlvbih0ZXJtSW5kZXgsIGNvdXJzZUluZGV4LCBlKXtcbiAgICB2YXIgZnJvbVRlcm1JbmRleCA9IHRoaXMuc3RhdGUuZHJhZ2luZ0NvdXJzZS50ZXJtSW5kZXhcbiAgICB2YXIgZnJvbUNvdXJzZUluZGV4ID0gdGhpcy5zdGF0ZS5kcmFnaW5nQ291cnNlLmNvdXJzZUluZGV4XG4gICAgdmFyIGZyb21Db3Vyc2UgPSBnZXRUZXJtTGlzdChmcm9tVGVybUluZGV4KVtmcm9tQ291cnNlSW5kZXhdXG4gICAgaWYoZ2V0VGVybUxpc3QodGVybUluZGV4KS5sZW5ndGg9PWNvdXJzZUluZGV4KXtcbiAgICAgIHRoaXMucmVtb3ZlQ291cnNlKGZyb21UZXJtSW5kZXgsIGZyb21Db3Vyc2VJbmRleCk7XG4gICAgICB0aGlzLmFkZENvdXJzZSh0ZXJtSW5kZXgsIGZyb21Db3Vyc2UpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignY291cnNlLm1vdmVkLnV3Y3MnKVxuICAgIH1lbHNle1xuICAgICAgLy9zd2FwXG4gICAgICB2YXIgZGVzdENvdXJzZSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClbY291cnNlSW5kZXhdXG4gICAgICBnZXRUZXJtTGlzdCh0ZXJtSW5kZXgpW2NvdXJzZUluZGV4XSA9IGZyb21Db3Vyc2VcbiAgICAgIGdldFRlcm1MaXN0KGZyb21UZXJtSW5kZXgpW2Zyb21Db3Vyc2VJbmRleF0gPSBkZXN0Q291cnNlXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdjb3Vyc2Uuc3dhcGVkLnV3Y3MnKVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtkcmFnaW5nQ291cnNlOlwiXCJ9KTtcbiAgfSxcbiAgc2hvd1ByZXZpZXc6ZnVuY3Rpb24odGVybUluZGV4LCBjb3Vyc2VJbmRleCl7XG4gICAgdmFyIGNvdXJzZSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClbY291cnNlSW5kZXhdXG4gICAgd2luZG93LnNob3dDb3Vyc2VQcmV2aWV3KGNvdXJzZSlcbiAgfSxcbiAgaGlkZVByZXZpZXc6ZnVuY3Rpb24oKXtcbiAgICB3aW5kb3cuaGlkZVByZXZpZXcoKVxuICB9LFxuICBzaG93aGVscDpmdW5jdGlvbih0ZXh0KXtcbiAgICB3aW5kb3cuc2hvd1ByZXZpZXcodGV4dClcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHZhciBzdGFydFllYXI9dGhpcy5zdGF0ZS5zdGFydFllYXI7XG4gICAgdmFyIHN0YXJ0VGVybT10aGlzLnN0YXRlLnN0YXJ0VGVybTtcbiAgICB2YXIgY291cnNlVGFrZW49W107XG5cbiAgICB2YXIgbGlzdEVsPWRhdGEuY291cnNlTGlzdC5tYXAoZnVuY3Rpb24oY291cnNlLGkpe1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb3Vyc2VcIiBrZXk9e2l9IGRyYWdnYWJsZT1cInRydWVcIiBvbkRyYWdTdGFydD17dGhhdC5kcmFnU3RhcnQuYmluZCh0aGF0LC0xLGkpfSBvbkRyYWdFbmQ9e3RoYXQuZHJhZ0VuZH0gb25EcmFnT3Zlcj17dGhhdC5kcmFnT3Zlcn0gb25Ecm9wPXt0aGF0LmRyb3AuYmluZCh0aGF0LC0xLGkpfSBvbk1vdXNlRW50ZXI9e3RoYXQuc2hvd1ByZXZpZXcuYmluZCh0aGF0LC0xLGkpfSBvbk1vdXNlTGVhdmU9e3RoYXQuaGlkZVByZXZpZXd9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1ib2R5XCI+XG4gICAgICAgICAgICAgIDxzdHJvbmc+e2NvdXJzZS5zdWJqZWN0K1wiIFwiK2NvdXJzZS5jYXRhbG9nX251bWJlcitcIiBcIn08L3N0cm9uZz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH0pXG4gICAgbGlzdEVsLnB1c2goKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e1wiY291cnNlIG1vdmVCbG9jayBcIisodGhhdC5zdGF0ZS5kcmFnaW5nQ291cnNlPT1cIlwifHx0aGF0LnN0YXRlLmRyYWdpbmdDb3Vyc2UudGVybUluZGV4PT0tMT9cImludmlzaWJsZVwiOlwiXCIpfSBvbkRyYWdPdmVyPXt0aGF0LmRyYWdPdmVyfSBvbkRyb3A9e3RoYXQuZHJvcC5iaW5kKHRoYXQsLTEsbGlzdEVsLmxlbmd0aCl9PlxuICAgICAgICAgIE1vdmUgSGVyZVxuICAgICAgPC9kaXY+XG4gICAgICApKVxuXG4gICAgdmFyIHRlcm1zRWw9ZGF0YS5zY2hlZHVsZS5tYXAoZnVuY3Rpb24odGVybSxpKXtcbiAgICAgIHZhciB0ZXJtTmFtZT1jYWxjdWxhdGVUZXJtKGRhdGEuc3RhcnRZZWFyLGRhdGEuc3RhcnRUZXJtLGkpO1xuICAgICAgdmFyIGJ1dHRvbnM9KFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRlcm0tbWVudVwiPlxuICAgICAgICAgIDxidXR0b24gb25Nb3VzZUVudGVyPXt0aGF0LnNob3doZWxwLmJpbmQodGhhdCxcIlJlbW92ZSB0aGlzIHRlcm1cIil9IG9uTW91c2VMZWF2ZT17dGhhdC5oaWRlUHJldmlld30gY2xhc3NOYW1lPSdyZW1vdmVUZXJtQnRuIGJ0bicgb25DbGljaz17dGhhdC5yZW1vdmVUZXJtLmJpbmQodGhhdCxpKX0+PGkgY2xhc3NOYW1lPVwiZmEgZmEtZncgZmEtdGltZXNcIi8+PC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBvbk1vdXNlRW50ZXI9e3RoYXQuc2hvd2hlbHAuYmluZCh0aGF0LFwiSW5zZXJ0IGEgdGVybSBhYm92ZVwiKX0gb25Nb3VzZUxlYXZlPXt0aGF0LmhpZGVQcmV2aWV3fSBjbGFzc05hbWU9XCJpbnNlcnRUZXJtQnRuIGJ0blwiIG9uQ2xpY2s9e3RoYXQuYWRkVGVybS5iaW5kKHRoYXQsaSl9PjxpIGNsYXNzTmFtZT1cImZhIGZhLWZ3IGZhLXBsdXNcIi8+PC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBvbk1vdXNlRW50ZXI9e3RoYXQuc2hvd2hlbHAuYmluZCh0aGF0LCh0ZXJtLnNraXBlZD9cIlVuLXNraXBcIjpcIlNraXBcIikpfSBvbk1vdXNlTGVhdmU9e3RoYXQuaGlkZVByZXZpZXd9IGNsYXNzTmFtZT0nc2tpcFRlcm1CdG4gYnRuJyBvbkNsaWNrPXt0aGF0LnRvZ2dsZVNraXBUZXJtLmJpbmQodGhhdCxpKX0+PGkgY2xhc3NOYW1lPXtcImZhIGZhLWZ3IFwiKyh0ZXJtLnNraXBlZD9cImZhLXJlcGx5XCI6XCJmYS1zaGFyZVwiKX0vPjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIClcbiAgICAgIGlmKHRlcm0uc2tpcGVkKXtcbiAgICAgICAgcmV0dXJuKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRlcm0gc2tpcGVkXCIga2V5PXtpfSBpZD17aX0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXJtLXRpdGxlXCI+PGg0Pnt0ZXJtTmFtZStcIiBcIn08L2g0PjwvZGl2PlxuICAgICAgICAgIHtidXR0b25zfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY291cnNlc1wiPlxuICAgICAgICAgICAgU2tpcGVkIC8gQ29vcFxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIi8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgICB9XG4gICAgICB2YXIgY3VycmVudFRlcm1Db3Vyc2VzPXRlcm0uY291cnNlcy5tYXAoZnVuY3Rpb24oY291cnNlLGope1xuICAgICAgICB2YXIgY291cnNlSW5mbz11d2FwaS5nZXRJbmZvKGNvdXJzZSk7XG4gICAgICAgIHZhciBvZmZlcmVkSW5DdXJyZW50VGVybT1nZXRUZXJtTmFtZUFycmF5KGNvdXJzZUluZm8udGVybXNfb2ZmZXJlZCkuaW5kZXhPZih0ZXJtTmFtZS5zdWJzdHIoNSkpPi0xO1xuICAgICAgICB2YXIgc2F0aXNmaWVkPWNoZWNrUHJlcmVxKGNvdXJzZVRha2VuLGNvdXJzZUluZm8ucHJlcmVxdWlzaXRlc19wYXJzZWQpO1xuICAgICAgICB2YXIgY2xhc3NTdHI9XCJjb3Vyc2VcIjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NTdHJ9IGtleT17an0gZHJhZ2dhYmxlPVwidHJ1ZVwiIG9uRHJhZ1N0YXJ0PXt0aGF0LmRyYWdTdGFydC5iaW5kKHRoYXQsaSxqKX0gb25EcmFnRW5kPXt0aGF0LmRyYWdFbmR9IG9uRHJhZ092ZXI9e3RoYXQuZHJhZ092ZXJ9IG9uRHJvcD17dGhhdC5kcm9wLmJpbmQodGhhdCxpLGopfSBkYXRhLXN1YmplY3Q9e2NvdXJzZS5zdWJqZWN0fSBkYXRhLWNhdGFsb2dfbnVtYmVyPXtjb3Vyc2UuY2F0YWxvZ19udW1iZXJ9ICBvbk1vdXNlRW50ZXI9e3RoYXQuc2hvd1ByZXZpZXcuYmluZCh0aGF0LGksail9IG9uTW91c2VMZWF2ZT17dGhhdC5oaWRlUHJldmlld30+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17XCJwYW5lbCBwYW5lbC1cIisoc2F0aXNmaWVkJiZvZmZlcmVkSW5DdXJyZW50VGVybT9cImRlZmF1bHRcIjpcImRhbmdlclwiKX0+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtYm9keVwiPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+e2NvdXJzZUluZm8uc3ViamVjdCtcIiBcIitjb3Vyc2VJbmZvLmNhdGFsb2dfbnVtYmVyK1wiIFwifTwvc3Ryb25nPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAge3NhdGlzZmllZCYmb2ZmZXJlZEluQ3VycmVudFRlcm0/KDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtZm9vdGVyXCI+QWxsIHNhdGlzZmllZDwvZGl2Pik6KDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtZm9vdGVyXCI+XG4gICAgICAgICAgICAgICAgeyFzYXRpc2ZpZWQ/KDxwPjxzdHJvbmc+UHJlcmVxdWlzaXRlcyBub3Qgc2F0aXNmaWVkLjxici8+UHJlcmVxOiA8L3N0cm9uZz57Y291cnNlSW5mby5wcmVyZXF1aXNpdGVzfTwvcD4pOnt9fVxuICAgICAgICAgICAgICAgIHshb2ZmZXJlZEluQ3VycmVudFRlcm0/KDxwPjxzdHJvbmc+Tm90IG9mZmVyZWQgaW4gdGhpcyB0ZXJtLjxici8+VGVybXMgb2ZmZXJlZDogPC9zdHJvbmc+e2dldFRlcm1OYW1lQXJyYXkoY291cnNlSW5mby50ZXJtc19vZmZlcmVkKS5qb2luKFwiLCBcIil9PC9wPik6e319XG4gICAgICAgICAgICAgIDwvZGl2Pil9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj4pXG4gICAgICB9KVxuICAgICAgdmFyIGJhY2tncm91bmRUZXh0PShcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiYWNrZ3JvdW5kVGV4dFwiPlxuICAgICAgICAgIE5vIGNvdXJzZSBmb3IgdGhpcyB0ZXJtLlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgJC5lYWNoKHRlcm0uY291cnNlcyxmdW5jdGlvbihpLGNvdXJzZSl7Y291cnNlVGFrZW4ucHVzaChnZXRDb3Vyc2VOYW1lKGNvdXJzZSkpfSk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVwidGVybVwiIGlkPXtpfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRlcm0tdGl0bGVcIj48aDQ+e3Rlcm1OYW1lK1wiIFwifTwvaDQ+PC9kaXY+XG4gICAgICAgICAge2J1dHRvbnN9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb3Vyc2VzXCI+XG4gICAgICAgICAgICB7Y3VycmVudFRlcm1Db3Vyc2VzfVxuICAgICAgICAgICAgeyF0ZXJtLmNvdXJzZXMubGVuZ3RoJiZ0aGF0LnN0YXRlLmRyYWdpbmdDb3Vyc2U9PVwiXCI/YmFja2dyb3VuZFRleHQ6XCJcIn1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcImNvdXJzZSBtb3ZlQmxvY2sgXCIrKHRoYXQuc3RhdGUuZHJhZ2luZ0NvdXJzZT09XCJcInx8aT09dGhhdC5zdGF0ZS5kcmFnaW5nQ291cnNlLnRlcm1JbmRleD9cImludmlzaWJsZVwiOlwiXCIpfSBvbkRyYWdPdmVyPXt0aGF0LmRyYWdPdmVyfSBvbkRyb3A9e3RoYXQuZHJvcC5iaW5kKHRoYXQsaSx0ZXJtLmNvdXJzZXMubGVuZ3RoKX0+XG4gICAgICAgICAgICAgICAgTW92ZSBIZXJlXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIClcbiAgICB9KVxuXG4gICAgcmV0dXJuKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e3RoYXQuc3RhdGUuZHJhZ2luZ0NvdXJzZSE9XCJcIj9cImRyYWdpbmdcIjpcIlwifT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidWNrZXRcIj5cbiAgICAgICAgICA8c3Ryb25nPkNvdXJzZSBTaG9ydCBMaXN0PC9zdHJvbmc+XG4gICAgICAgICAge2xpc3RFbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2V0dGluZ3NiYXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgVG90YWwgY3JlZGl0czombmJzcDtcbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiaW1wb3J0YW50XCI+e2NvdXJzZVRha2VuLmxlbmd0aCowLjV9PC9zdHJvbmc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAgPFNhdmVCdG5Hcm91cCAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy0xMiB0ZXJtc1wiPlxuICAgICAgICAgICAgICB7dGVybXNFbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wteHMtMTIgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tZGVmYXVsdCBhZGRUZXJtQnRuIGJ0bi1sZycgb25DbGljaz17dGhhdC5hZGRUZXJtLmJpbmQodGhhdCxkYXRhLnNjaGVkdWxlLmxlbmd0aCl9PlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLXBsdXMgZmEtZndcIj48L2k+IEFkZCBhIFRlcm1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxuXG53aW5kb3cuZWRpdGluZz10cnVlO1xuJChmdW5jdGlvbigpe1xuICBSZWFjdC5yZW5kZXJDb21wb25lbnQoXG4gICAgPE1haW5WaWV3IC8+LFxuICAgICQoXCIjbWFpblwiKS5nZXQoMClcbiAgKTtcbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=