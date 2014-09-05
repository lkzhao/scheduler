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
    this.refs.saveBtnGroup.forceUpdate()
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
  handleNameChange:function(){

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
              SaveBtnGroup({ref: "saveBtnGroup"})
            )
          )
        ), 
        React.DOM.div({className: "container"}, 
          React.DOM.div({className: "row"}, 
            React.DOM.div({className: "col-xs-6 col-xs-offset-3"}, 
              window.EditLabel({initialValue: data.name, onSubmit: this.handleNameChange})
            ), 
            React.DOM.div({className: "col-xs-12 terms"}, 
              termsEl
            ), 
            React.DOM.div({className: "col-xs-12 text-center"}, 
              React.DOM.button({className: "btn btn-primary addTermBtn", onClick: that.addTerm.bind(that,data.schedule.length)}, 
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImVkaXQuanN4Il0sInNvdXJjZXNDb250ZW50IjpbIlxuZnVuY3Rpb24gaXNBbGxTdHJpbmcobGlzdCl7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGlmKHR5cGVvZiBsaXN0W2ldIT1cInN0cmluZ1wiKXJldHVybiBmYWxzZVxuICB9O1xuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGNoZWNrUHJlcmVxKGNvdXJzZVRha2VuLHByZXJlcSxpc1JlY3VyKXtcbiAgaWYoIXByZXJlcSlyZXR1cm4gdHJ1ZTtcbiAgdmFyIGNvdW50PWlzUmVjdXI/MTppc0FsbFN0cmluZyhwcmVyZXEpPzE6cHJlcmVxLmxlbmd0aDtcbiAgaWYodHlwZW9mIHByZXJlcVswXSA9PT0gXCJudW1iZXJcIil7XG4gICAgY291bnQ9cHJlcmVxLnNoaWZ0KCk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVyZXEubGVuZ3RoOyBpKyspIHtcbiAgICBpZih0eXBlb2YgcHJlcmVxW2ldPT09XCJzdHJpbmdcIil7XG4gICAgICBpZihjb3Vyc2VUYWtlbi5pbmRleE9mKHByZXJlcVtpXSkhPS0xKXtcbiAgICAgICAgLy9jb25kaXRpb24gc2F0aXNmaWVkXG4gICAgICAgIGNvdW50LS07XG4gICAgICAgIGlmKGNvdW50PT0wKWJyZWFrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vY29uZGl0aW9uIG5vdCBzYXRpc2ZpZWRcblxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgaWYoY2hlY2tQcmVyZXEoY291cnNlVGFrZW4scHJlcmVxW2ldLHRydWUpKXtcbiAgICAgICAgLy9jb25kaXRpb24gc2F0aXNmaWVkXG4gICAgICAgIGNvdW50LS07XG4gICAgICAgIGlmKGNvdW50PT0wKWJyZWFrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vY29uZGl0aW9uIG5vdCBzYXRpc2ZpZWRcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHJldHVybiBjb3VudDw9MDtcbn1cbmZ1bmN0aW9uIGdldFRlcm1OYW1lQXJyYXkodGVybXNfb2ZmZXJlZCl7XG4gIHJldHVybiB0ZXJtc19vZmZlcmVkLm1hcChmdW5jdGlvbihpKXtyZXR1cm4gaT09XCJGXCI/XCJGYWxsXCI6aT09XCJXXCI/XCJXaW50ZXJcIjpcIlNwcmluZ1wifSlcbn1cbmZ1bmN0aW9uIGhhc0NvdXJzZShjb3Vyc2Upe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuY291cnNlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGlmKGdldENvdXJzZU5hbWUoZGF0YS5jb3Vyc2VMaXN0W2ldKT09Z2V0Q291cnNlTmFtZShjb3Vyc2UpKVxuICAgICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5zY2hlZHVsZS5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGF0YS5zY2hlZHVsZVtpXS5jb3Vyc2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZihkYXRhLnNjaGVkdWxlW2ldLmNvdXJzZXNbal0uc3ViamVjdD09Y291cnNlLnN1YmplY3QmJlxuICAgICAgICBkYXRhLnNjaGVkdWxlW2ldLmNvdXJzZXNbal0uY2F0YWxvZ19udW1iZXI9PWNvdXJzZS5jYXRhbG9nX251bWJlcilcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gZ2V0VGVybUxpc3QodGVybUluZGV4KXtcbiAgcmV0dXJuIHRlcm1JbmRleD09LTE/ZGF0YS5jb3Vyc2VMaXN0OmRhdGEuc2NoZWR1bGVbdGVybUluZGV4XS5jb3Vyc2VzXG59XG5cblxuU2F2ZUJ0bkdyb3VwPVJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGVmYXVsdFNhdmVJbnRlcnZhbDo2MCxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3NhdmVUaW1lOnRoaXMuZGVmYXVsdFNhdmVJbnRlcnZhbCwgc2F2ZVRleHQ6XCJcIiwgc2F2aW5nOmZhbHNlfTtcbiAgfSxcbiAgc2V0VGltZXI6ZnVuY3Rpb24oKXtcbiAgICB2YXIgdGhhdD10aGlzO1xuICAgIHRoaXMudGltZXI9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcbiAgICAgIGlmKCFkYXRhLmF1dG9TYXZlKSByZXR1cm47XG4gICAgICBpZih0aGF0LnN0YXRlLnNhdmVUaW1lPD0xKXtcbiAgICAgICAgdGhhdC5zYXZlKCk7XG4gICAgICAgIHRoYXQuc2V0U3RhdGUoe3NhdmVUaW1lOnRoYXQuZGVmYXVsdFNhdmVJbnRlcnZhbH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhhdC5zZXRTdGF0ZSh7c2F2ZVRpbWU6dGhhdC5zdGF0ZS5zYXZlVGltZS0xfSlcbiAgICAgIH1cbiAgICB9LDEwMDApO1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSl7XG4gICAgdGhpcy5zZXRUaW1lcigpO1xuICB9LFxuICBzYXZlOmZ1bmN0aW9uKGUpe1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHRoaXMuc2V0U3RhdGUoe3NhdmVUZXh0OlwiXCIsIHNhdmVUaW1lOnRoaXMuZGVmYXVsdFNhdmVJbnRlcnZhbCwgc2F2aW5nOnRydWV9KVxuICAgICQuYWpheCh7XG4gICAgICB1cmw6XCIvc2F2ZS9cIitkYXRhLmNvdXJzZVBsYW5JZCtcIi9cIixcbiAgICAgIHR5cGU6XCJwb3N0XCIsXG4gICAgICBkYXRhVHlwZTpcImpzb25cIixcbiAgICAgIGRhdGE6e1xuICAgICAgICBjb3Vyc2VMaXN0OkpTT04uc3RyaW5naWZ5KGRhdGEuY291cnNlTGlzdCksXG4gICAgICAgIGNzcmZtaWRkbGV3YXJldG9rZW46ZGF0YS5jc3JmX3Rva2VuLFxuICAgICAgICBzY2hlZHVsZTpKU09OLnN0cmluZ2lmeShkYXRhLnNjaGVkdWxlKVxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6ZnVuY3Rpb24oanNvbil7XG4gICAgICAgIGlmKGpzb24uc3VjY2Vzcyl7XG4gICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7c2F2aW5nOmZhbHNlfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7c2F2ZVRleHQ6XCJzYXZlIGZhaWxlZC4gY2hlY2sgeW91ciBpbnRlcm5ldCBjb25uZWN0aW9uXCIsc2F2aW5nOmZhbHNlfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVycm9yOmZ1bmN0aW9uKCl7XG4gICAgICAgIHRoYXQuc2V0U3RhdGUoe3NhdmVUZXh0Olwic2F2ZSBmYWlsZWQuIGNoZWNrIHlvdXIgaW50ZXJuZXQgY29ubmVjdGlvblwiLHNhdmluZzpmYWxzZX0pXG4gICAgICB9XG4gICAgfSlcbiAgfSxcbiAgbG9hZE1vZGFsOmZ1bmN0aW9uKCl7XG4gICAgJChcIiNtb2RhbENvbnRhaW5lclwiKS5sb2FkKFwiL3NoYXJlL1wiK2RhdGEuY291cnNlUGxhbklkK1wiL1wiKVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHNhdmVUZXh0PXRoaXMuc3RhdGUuc2F2ZVRleHRcbiAgICBpZihkYXRhLmF1dG9TYXZlKXtcbiAgICAgIHNhdmVUZXh0ID0gdGhpcy5zdGF0ZS5zYXZlVGV4dCE9XCJcIj90aGlzLnN0YXRlLnNhdmVUZXh0OjxzcGFuPkF1dG8gU2F2ZSBpbiA8c3Ryb25nIGNsYXNzTmFtZT1cImltcG9ydGFudFwiPnt0aGlzLnN0YXRlLnNhdmVUaW1lfTwvc3Ryb25nPnM8L3NwYW4+XG4gICAgfVxuICAgIGlmKHRoaXMuc3RhdGUuc2F2aW5nKXtcbiAgICAgIHZhciBzYXZlQnRuID0gKFxuICAgICAgICA8YSBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnkgZGlzYWJsZWRcIj5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1zYXZlIGZhLWZ3IGZhLXNwaW5cIj48L2k+IFNhdmluZ1xuICAgICAgICA8L2E+XG4gICAgICAgIClcbiAgICB9ZWxzZXtcbiAgICAgIHZhciBzYXZlQnRuID0gKFxuICAgICAgICA8YSBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLnNhdmV9PlxuICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLXNhdmUgZmEtZndcIj48L2k+IFNhdmVcbiAgICAgICAgPC9hPlxuICAgICAgICApXG4gICAgfVxuICAgIHJldHVybihcbiAgICAgIDxzcGFuPlxuICAgICAgICB7c2F2ZVRleHR9Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XG4gICAgICAgIHtzYXZlQnRufSZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xuICAgICAgICA8YSBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLmxvYWRNb2RhbH0+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtc2hhcmUgZmEtZndcIj48L2k+IFNoYXJlXG4gICAgICAgIDwvYT5cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG59KVxuXG5NYWluVmlldz1SZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRyYWdpbmdDb3Vyc2U6XCJcIlxuICAgICAgICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OmZ1bmN0aW9uKCl7XG4gICAgJChkb2N1bWVudCkub24oJ2RhdGFVcGRhdGVkJywgdGhpcy5yZWZyZXNoKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdyZWFkeS51d2NzJylcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICQoZG9jdW1lbnQpLm9mZignZGF0YVVwZGF0ZWQnLCB0aGlzLnJlZnJlc2gpO1xuICB9LFxuICB0b2dnbGVTa2lwVGVybTpmdW5jdGlvbih0ZXJtSW5kZXgpe1xuICAgIGlmKGRhdGEuc2NoZWR1bGVbdGVybUluZGV4XS5za2lwZWQpe1xuICAgICAgZGF0YS5zY2hlZHVsZVt0ZXJtSW5kZXhdLnNraXBlZCA9IGZhbHNlXG4gICAgfWVsc2V7XG4gICAgICBkYXRhLnNjaGVkdWxlLnNwbGljZSh0ZXJtSW5kZXgsIDAsIHtza2lwZWQ6dHJ1ZSxjb3Vyc2VzOltdfSk7XG4gICAgfVxuICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgfSxcbiAgcmVmcmVzaDpmdW5jdGlvbihlKXtcbiAgICBjb25zb2xlLmxvZyhcImZvcmNlIHJlZnJlc2hcIilcbiAgICB0aGlzLnJlZnMuc2F2ZUJ0bkdyb3VwLmZvcmNlVXBkYXRlKClcbiAgICB0aGlzLmZvcmNlVXBkYXRlKClcbiAgfSxcbiAgYWRkVGVybTpmdW5jdGlvbih0ZXJtSW5kZXgpe1xuICAgIGRhdGEuc2NoZWR1bGUuc3BsaWNlKHRlcm1JbmRleCwwLHtjb3Vyc2VzOltdfSk7XG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICB9LFxuICBhZGRDb3Vyc2U6ZnVuY3Rpb24odGVybUluZGV4LGNvdXJzZSl7XG4gICAgZ2V0VGVybUxpc3QodGVybUluZGV4KS5wdXNoKGNvdXJzZSk7XG4gIH0sXG4gIHJlbW92ZVRlcm06ZnVuY3Rpb24odGVybUluZGV4KXtcbiAgICBkYXRhLnNjaGVkdWxlLnNwbGljZSh0ZXJtSW5kZXgsIDEpO1xuICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgfSxcbiAgcmVtb3ZlQ291cnNlOmZ1bmN0aW9uKHRlcm1JbmRleCwgY291cnNlSW5kZXgpe1xuICAgIGdldFRlcm1MaXN0KHRlcm1JbmRleCkuc3BsaWNlKGNvdXJzZUluZGV4LDEpO1xuICB9LFxuICBkcmFnU3RhcnQ6ZnVuY3Rpb24odGVybUluZGV4LCBjb3Vyc2VJbmRleCwgZSl7XG4gICAgdmFyIGNvdXJzZSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClbY291cnNlSW5kZXhdXG4gICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcInRleHQvY291cnNlXCIsIGNvdXJzZS5zdWJqZWN0K2NvdXJzZS5jYXRhbG9nX251bWJlcik7XG4gICAgaWYodGhpcy5zdGF0ZS5kcmFnaW5nQ291cnNlIT1cIlwiKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5oaWRlUHJldmlldygpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RyYWdpbmdDb3Vyc2U6e1xuICAgICAgdGVybUluZGV4OnRlcm1JbmRleCxcbiAgICAgIGNvdXJzZUluZGV4OmNvdXJzZUluZGV4XG4gICAgfX0sZnVuY3Rpb24oKXtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ2NvdXJzZS5tb3ZlLnV3Y3MnKVxuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmFnRW5kOmZ1bmN0aW9uKGUpe1xuICAgIHRoaXMuc2V0U3RhdGUoe2RyYWdpbmdDb3Vyc2U6XCJcIn0pO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ2NvdXJzZS5tb3ZlY2FuY2VsZWQudXdjcycpXG4gIH0sXG4gIGRyYWdPdmVyOmZ1bmN0aW9uKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfSxcbiAgZHJvcDpmdW5jdGlvbih0ZXJtSW5kZXgsIGNvdXJzZUluZGV4LCBlKXtcbiAgICB2YXIgZnJvbVRlcm1JbmRleCA9IHRoaXMuc3RhdGUuZHJhZ2luZ0NvdXJzZS50ZXJtSW5kZXhcbiAgICB2YXIgZnJvbUNvdXJzZUluZGV4ID0gdGhpcy5zdGF0ZS5kcmFnaW5nQ291cnNlLmNvdXJzZUluZGV4XG4gICAgdmFyIGZyb21Db3Vyc2UgPSBnZXRUZXJtTGlzdChmcm9tVGVybUluZGV4KVtmcm9tQ291cnNlSW5kZXhdXG4gICAgaWYoZ2V0VGVybUxpc3QodGVybUluZGV4KS5sZW5ndGg9PWNvdXJzZUluZGV4KXtcbiAgICAgIHRoaXMucmVtb3ZlQ291cnNlKGZyb21UZXJtSW5kZXgsIGZyb21Db3Vyc2VJbmRleCk7XG4gICAgICB0aGlzLmFkZENvdXJzZSh0ZXJtSW5kZXgsIGZyb21Db3Vyc2UpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignY291cnNlLm1vdmVkLnV3Y3MnKVxuICAgIH1lbHNle1xuICAgICAgLy9zd2FwXG4gICAgICB2YXIgZGVzdENvdXJzZSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClbY291cnNlSW5kZXhdXG4gICAgICBnZXRUZXJtTGlzdCh0ZXJtSW5kZXgpW2NvdXJzZUluZGV4XSA9IGZyb21Db3Vyc2VcbiAgICAgIGdldFRlcm1MaXN0KGZyb21UZXJtSW5kZXgpW2Zyb21Db3Vyc2VJbmRleF0gPSBkZXN0Q291cnNlXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdjb3Vyc2Uuc3dhcGVkLnV3Y3MnKVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtkcmFnaW5nQ291cnNlOlwiXCJ9KTtcbiAgfSxcbiAgc2hvd1ByZXZpZXc6ZnVuY3Rpb24odGVybUluZGV4LCBjb3Vyc2VJbmRleCl7XG4gICAgdmFyIGNvdXJzZSA9IGdldFRlcm1MaXN0KHRlcm1JbmRleClbY291cnNlSW5kZXhdXG4gICAgd2luZG93LnNob3dDb3Vyc2VQcmV2aWV3KGNvdXJzZSlcbiAgfSxcbiAgaGlkZVByZXZpZXc6ZnVuY3Rpb24oKXtcbiAgICB3aW5kb3cuaGlkZVByZXZpZXcoKVxuICB9LFxuICBzaG93aGVscDpmdW5jdGlvbih0ZXh0KXtcbiAgICB3aW5kb3cuc2hvd1ByZXZpZXcodGV4dClcbiAgfSxcbiAgaGFuZGxlTmFtZUNoYW5nZTpmdW5jdGlvbigpe1xuXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoYXQ9dGhpcztcbiAgICB2YXIgc3RhcnRZZWFyPXRoaXMuc3RhdGUuc3RhcnRZZWFyO1xuICAgIHZhciBzdGFydFRlcm09dGhpcy5zdGF0ZS5zdGFydFRlcm07XG4gICAgdmFyIGNvdXJzZVRha2VuPVtdO1xuXG4gICAgdmFyIGxpc3RFbD1kYXRhLmNvdXJzZUxpc3QubWFwKGZ1bmN0aW9uKGNvdXJzZSxpKXtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY291cnNlXCIga2V5PXtpfSBkcmFnZ2FibGU9XCJ0cnVlXCIgb25EcmFnU3RhcnQ9e3RoYXQuZHJhZ1N0YXJ0LmJpbmQodGhhdCwtMSxpKX0gb25EcmFnRW5kPXt0aGF0LmRyYWdFbmR9IG9uRHJhZ092ZXI9e3RoYXQuZHJhZ092ZXJ9IG9uRHJvcD17dGhhdC5kcm9wLmJpbmQodGhhdCwtMSxpKX0gb25Nb3VzZUVudGVyPXt0aGF0LnNob3dQcmV2aWV3LmJpbmQodGhhdCwtMSxpKX0gb25Nb3VzZUxlYXZlPXt0aGF0LmhpZGVQcmV2aWV3fT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtYm9keVwiPlxuICAgICAgICAgICAgICA8c3Ryb25nPntjb3Vyc2Uuc3ViamVjdCtcIiBcIitjb3Vyc2UuY2F0YWxvZ19udW1iZXIrXCIgXCJ9PC9zdHJvbmc+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICB9KVxuICAgIGxpc3RFbC5wdXNoKChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtcImNvdXJzZSBtb3ZlQmxvY2sgXCIrKHRoYXQuc3RhdGUuZHJhZ2luZ0NvdXJzZT09XCJcInx8dGhhdC5zdGF0ZS5kcmFnaW5nQ291cnNlLnRlcm1JbmRleD09LTE/XCJpbnZpc2libGVcIjpcIlwiKX0gb25EcmFnT3Zlcj17dGhhdC5kcmFnT3Zlcn0gb25Ecm9wPXt0aGF0LmRyb3AuYmluZCh0aGF0LC0xLGxpc3RFbC5sZW5ndGgpfT5cbiAgICAgICAgICBNb3ZlIEhlcmVcbiAgICAgIDwvZGl2PlxuICAgICAgKSlcblxuICAgIHZhciB0ZXJtc0VsPWRhdGEuc2NoZWR1bGUubWFwKGZ1bmN0aW9uKHRlcm0saSl7XG4gICAgICB2YXIgdGVybU5hbWU9Y2FsY3VsYXRlVGVybShkYXRhLnN0YXJ0WWVhcixkYXRhLnN0YXJ0VGVybSxpKTtcbiAgICAgIHZhciBidXR0b25zPShcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXJtLW1lbnVcIj5cbiAgICAgICAgICA8YnV0dG9uIG9uTW91c2VFbnRlcj17dGhhdC5zaG93aGVscC5iaW5kKHRoYXQsXCJSZW1vdmUgdGhpcyB0ZXJtXCIpfSBvbk1vdXNlTGVhdmU9e3RoYXQuaGlkZVByZXZpZXd9IGNsYXNzTmFtZT0ncmVtb3ZlVGVybUJ0biBidG4nIG9uQ2xpY2s9e3RoYXQucmVtb3ZlVGVybS5iaW5kKHRoYXQsaSl9PjxpIGNsYXNzTmFtZT1cImZhIGZhLWZ3IGZhLXRpbWVzXCIvPjwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gb25Nb3VzZUVudGVyPXt0aGF0LnNob3doZWxwLmJpbmQodGhhdCxcIkluc2VydCBhIHRlcm0gYWJvdmVcIil9IG9uTW91c2VMZWF2ZT17dGhhdC5oaWRlUHJldmlld30gY2xhc3NOYW1lPVwiaW5zZXJ0VGVybUJ0biBidG5cIiBvbkNsaWNrPXt0aGF0LmFkZFRlcm0uYmluZCh0aGF0LGkpfT48aSBjbGFzc05hbWU9XCJmYSBmYS1mdyBmYS1wbHVzXCIvPjwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gb25Nb3VzZUVudGVyPXt0aGF0LnNob3doZWxwLmJpbmQodGhhdCwodGVybS5za2lwZWQ/XCJVbi1za2lwXCI6XCJTa2lwXCIpKX0gb25Nb3VzZUxlYXZlPXt0aGF0LmhpZGVQcmV2aWV3fSBjbGFzc05hbWU9J3NraXBUZXJtQnRuIGJ0bicgb25DbGljaz17dGhhdC50b2dnbGVTa2lwVGVybS5iaW5kKHRoYXQsaSl9PjxpIGNsYXNzTmFtZT17XCJmYSBmYS1mdyBcIisodGVybS5za2lwZWQ/XCJmYS1yZXBseVwiOlwiZmEtc2hhcmVcIil9Lz48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApXG4gICAgICBpZih0ZXJtLnNraXBlZCl7XG4gICAgICAgIHJldHVybihcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXJtIHNraXBlZFwiIGtleT17aX0gaWQ9e2l9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGVybS10aXRsZVwiPjxoND57dGVybU5hbWUrXCIgXCJ9PC9oND48L2Rpdj5cbiAgICAgICAgICB7YnV0dG9uc31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvdXJzZXNcIj5cbiAgICAgICAgICAgIFNraXBlZCAvIENvb3BcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgdmFyIGN1cnJlbnRUZXJtQ291cnNlcz10ZXJtLmNvdXJzZXMubWFwKGZ1bmN0aW9uKGNvdXJzZSxqKXtcbiAgICAgICAgdmFyIGNvdXJzZUluZm89dXdhcGkuZ2V0SW5mbyhjb3Vyc2UpO1xuICAgICAgICB2YXIgb2ZmZXJlZEluQ3VycmVudFRlcm09Z2V0VGVybU5hbWVBcnJheShjb3Vyc2VJbmZvLnRlcm1zX29mZmVyZWQpLmluZGV4T2YodGVybU5hbWUuc3Vic3RyKDUpKT4tMTtcbiAgICAgICAgdmFyIHNhdGlzZmllZD1jaGVja1ByZXJlcShjb3Vyc2VUYWtlbixjb3Vyc2VJbmZvLnByZXJlcXVpc2l0ZXNfcGFyc2VkKTtcbiAgICAgICAgdmFyIGNsYXNzU3RyPVwiY291cnNlXCI7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzU3RyfSBrZXk9e2p9IGRyYWdnYWJsZT1cInRydWVcIiBvbkRyYWdTdGFydD17dGhhdC5kcmFnU3RhcnQuYmluZCh0aGF0LGksail9IG9uRHJhZ0VuZD17dGhhdC5kcmFnRW5kfSBvbkRyYWdPdmVyPXt0aGF0LmRyYWdPdmVyfSBvbkRyb3A9e3RoYXQuZHJvcC5iaW5kKHRoYXQsaSxqKX0gZGF0YS1zdWJqZWN0PXtjb3Vyc2Uuc3ViamVjdH0gZGF0YS1jYXRhbG9nX251bWJlcj17Y291cnNlLmNhdGFsb2dfbnVtYmVyfSAgb25Nb3VzZUVudGVyPXt0aGF0LnNob3dQcmV2aWV3LmJpbmQodGhhdCxpLGopfSBvbk1vdXNlTGVhdmU9e3RoYXQuaGlkZVByZXZpZXd9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e1wicGFuZWwgcGFuZWwtXCIrKHNhdGlzZmllZCYmb2ZmZXJlZEluQ3VycmVudFRlcm0/XCJkZWZhdWx0XCI6XCJkYW5nZXJcIil9PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWJvZHlcIj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPntjb3Vyc2VJbmZvLnN1YmplY3QrXCIgXCIrY291cnNlSW5mby5jYXRhbG9nX251bWJlcitcIiBcIn08L3N0cm9uZz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtzYXRpc2ZpZWQmJm9mZmVyZWRJbkN1cnJlbnRUZXJtPyg8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWZvb3RlclwiPkFsbCBzYXRpc2ZpZWQ8L2Rpdj4pOig8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWZvb3RlclwiPlxuICAgICAgICAgICAgICAgIHshc2F0aXNmaWVkPyg8cD48c3Ryb25nPlByZXJlcXVpc2l0ZXMgbm90IHNhdGlzZmllZC48YnIvPlByZXJlcTogPC9zdHJvbmc+e2NvdXJzZUluZm8ucHJlcmVxdWlzaXRlc308L3A+KTp7fX1cbiAgICAgICAgICAgICAgICB7IW9mZmVyZWRJbkN1cnJlbnRUZXJtPyg8cD48c3Ryb25nPk5vdCBvZmZlcmVkIGluIHRoaXMgdGVybS48YnIvPlRlcm1zIG9mZmVyZWQ6IDwvc3Ryb25nPntnZXRUZXJtTmFtZUFycmF5KGNvdXJzZUluZm8udGVybXNfb2ZmZXJlZCkuam9pbihcIiwgXCIpfTwvcD4pOnt9fVxuICAgICAgICAgICAgICA8L2Rpdj4pfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+KVxuICAgICAgfSlcbiAgICAgIHZhciBiYWNrZ3JvdW5kVGV4dD0oXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmFja2dyb3VuZFRleHRcIj5cbiAgICAgICAgICBObyBjb3Vyc2UgZm9yIHRoaXMgdGVybS5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgICQuZWFjaCh0ZXJtLmNvdXJzZXMsZnVuY3Rpb24oaSxjb3Vyc2Upe2NvdXJzZVRha2VuLnB1c2goZ2V0Q291cnNlTmFtZShjb3Vyc2UpKX0pO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT1cInRlcm1cIiBpZD17aX0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXJtLXRpdGxlXCI+PGg0Pnt0ZXJtTmFtZStcIiBcIn08L2g0PjwvZGl2PlxuICAgICAgICAgIHtidXR0b25zfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY291cnNlc1wiPlxuICAgICAgICAgICAge2N1cnJlbnRUZXJtQ291cnNlc31cbiAgICAgICAgICAgIHshdGVybS5jb3Vyc2VzLmxlbmd0aCYmdGhhdC5zdGF0ZS5kcmFnaW5nQ291cnNlPT1cIlwiP2JhY2tncm91bmRUZXh0OlwiXCJ9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17XCJjb3Vyc2UgbW92ZUJsb2NrIFwiKyh0aGF0LnN0YXRlLmRyYWdpbmdDb3Vyc2U9PVwiXCJ8fGk9PXRoYXQuc3RhdGUuZHJhZ2luZ0NvdXJzZS50ZXJtSW5kZXg/XCJpbnZpc2libGVcIjpcIlwiKX0gb25EcmFnT3Zlcj17dGhhdC5kcmFnT3Zlcn0gb25Ecm9wPXt0aGF0LmRyb3AuYmluZCh0aGF0LGksdGVybS5jb3Vyc2VzLmxlbmd0aCl9PlxuICAgICAgICAgICAgICAgIE1vdmUgSGVyZVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApXG4gICAgfSlcblxuICAgIHJldHVybihcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXt0aGF0LnN0YXRlLmRyYWdpbmdDb3Vyc2UhPVwiXCI/XCJkcmFnaW5nXCI6XCJcIn0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnVja2V0XCI+XG4gICAgICAgICAgPHN0cm9uZz5Db3Vyc2UgU2hvcnQgTGlzdDwvc3Ryb25nPlxuICAgICAgICAgIHtsaXN0RWx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNldHRpbmdzYmFyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgIFRvdGFsIGNyZWRpdHM6Jm5ic3A7XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImltcG9ydGFudFwiPntjb3Vyc2VUYWtlbi5sZW5ndGgqMC41fTwvc3Ryb25nPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgICAgIDxTYXZlQnRuR3JvdXAgcmVmPVwic2F2ZUJ0bkdyb3VwXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBjb2wteHMtb2Zmc2V0LTNcIj5cbiAgICAgICAgICAgICAgPHdpbmRvdy5FZGl0TGFiZWwgaW5pdGlhbFZhbHVlPXtkYXRhLm5hbWV9IG9uU3VibWl0PXt0aGlzLmhhbmRsZU5hbWVDaGFuZ2V9IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTEyIHRlcm1zXCI+XG4gICAgICAgICAgICAgIHt0ZXJtc0VsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy0xMiB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1wcmltYXJ5IGFkZFRlcm1CdG4nIG9uQ2xpY2s9e3RoYXQuYWRkVGVybS5iaW5kKHRoYXQsZGF0YS5zY2hlZHVsZS5sZW5ndGgpfT5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1wbHVzIGZhLWZ3XCI+PC9pPiBBZGQgYSBUZXJtXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cblxud2luZG93LmVkaXRpbmc9dHJ1ZTtcbiQoZnVuY3Rpb24oKXtcbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50KFxuICAgIDxNYWluVmlldyAvPixcbiAgICAkKFwiI21haW5cIikuZ2V0KDApXG4gICk7XG59KVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9