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


SaveBtnGroup=React.createClass({
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
  render: function() {
    saveText=this.state.saveText
    if(data.autoSave){
      saveText = this.state.saveText!=""?this.state.saveText:<span>Auto Save in <strong className="important">{this.state.saveTime}</strong>s</span>
    }
    if(this.state.saving){
      var saveBtn = (
        <a className="btn btn-primary disabled">
          <i className="fa fa-save fa-fw fa-spin"></i> Saving
        </a>
        )
    }else{
      var saveBtn = (
        <a className="btn btn-primary" onClick={this.save}>
          <i className="fa fa-save fa-fw"></i> Save
        </a>
        )
    }
    return(
      <span>
        {saveText}&nbsp;&nbsp;&nbsp;&nbsp;
        {saveBtn}
      </span>
    );
  }
})

MainView=React.createClass({
  getInitialState: function() {
    return {
            dragingCourse:""
          };
  },
  componentDidMount:function(){
    $(document).on('dataUpdated', this.refresh);
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
    }});
    return true;
  },
  dragEnd:function(e){
    this.setState({dragingCourse:""});
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
    }else{
      //swap
      var destCourse = getTermList(termIndex)[courseIndex]
      getTermList(termIndex)[courseIndex] = fromCourse
      getTermList(fromTermIndex)[fromCourseIndex] = destCourse
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
        <div className="course" key={i} draggable="true" onDragStart={that.dragStart.bind(that,-1,i)} onDragEnd={that.dragEnd} onDragOver={that.dragOver} onDrop={that.drop.bind(that,-1,i)} onMouseEnter={that.showPreview.bind(that,-1,i)} onMouseLeave={that.hidePreview}>
          <div className="panel panel-default">
            <div className="panel-body">
              <strong>{course.subject+" "+course.catalog_number+" "}</strong>
            </div>
          </div>
        </div>
        )
    })
    listEl.push((
      <div className={"course moveBlock "+(that.state.dragingCourse==""||that.state.dragingCourse.termIndex==-1?"invisible":"")} onDragOver={that.dragOver} onDrop={that.drop.bind(that,-1,listEl.length)}>
          Move Here
      </div>
      ))

    var termsEl=data.schedule.map(function(term,i){
      var termName=calculateTerm(data.startYear,data.startTerm,i);
      var buttons=(
        <div className="term-menu">
          <button onMouseEnter={that.showhelp.bind(that,"Remove this term")} onMouseLeave={that.hidePreview} className='removeTermBtn btn' onClick={that.removeTerm.bind(that,i)}><i className="fa fa-fw fa-times"/></button>
          <button onMouseEnter={that.showhelp.bind(that,"Insert a term above")} onMouseLeave={that.hidePreview} className="insertTermBtn btn" onClick={that.addTerm.bind(that,i)}><i className="fa fa-fw fa-plus"/></button>
          <button onMouseEnter={that.showhelp.bind(that,(term.skiped?"Un-skip":"Skip"))} onMouseLeave={that.hidePreview} className='skipTermBtn btn' onClick={that.toggleSkipTerm.bind(that,i)}><i className={"fa fa-fw "+(term.skiped?"fa-reply":"fa-share")}/></button>
        </div>
      )
      if(term.skiped){
        return(
        <div className="term skiped" key={i} id={i}>
          <div className="term-title"><h4>{termName+" "}</h4></div>
          {buttons}
          <div className="courses">
            Skiped / Coop
          </div>
          <div className="clearfix"/>
        </div>
        )
      }
      var currentTermCourses=term.courses.map(function(course,j){
        var courseInfo=uwapi.getInfo(course);
        var offeredInCurrentTerm=getTermNameArray(courseInfo.terms_offered).indexOf(termName.substr(5))>-1;
        var satisfied=checkPrereq(courseTaken,courseInfo.prerequisites_parsed);
        var classStr="course";
        return (
          <div className={classStr} key={j} draggable="true" onDragStart={that.dragStart.bind(that,i,j)} onDragEnd={that.dragEnd} onDragOver={that.dragOver} onDrop={that.drop.bind(that,i,j)} data-subject={course.subject} data-catalog_number={course.catalog_number}  onMouseEnter={that.showPreview.bind(that,i,j)} onMouseLeave={that.hidePreview}>
            <div className={"panel panel-"+(satisfied&&offeredInCurrentTerm?"default":"danger")}>
              <div className="panel-body">
                <strong>{courseInfo.subject+" "+courseInfo.catalog_number+" "}</strong>
              </div>
              {satisfied&&offeredInCurrentTerm?(<div className="panel-footer">All satisfied</div>):(<div className="panel-footer">
                {!satisfied?(<p><strong>Prerequisites not satisfied.<br/>Prereq: </strong>{courseInfo.prerequisites}</p>):{}}
                {!offeredInCurrentTerm?(<p><strong>Not offered in this term.<br/>Terms offered: </strong>{getTermNameArray(courseInfo.terms_offered).join(", ")}</p>):{}}
              </div>)}
            </div>
          </div>)
      })
      var backgroundText=(
        <div className="backgroundText">
          No course for this term.
        </div>
        )
      $.each(term.courses,function(i,course){courseTaken.push(getCourseName(course))});
      return (
        <div key={i} className="term" id={i}>
          <div className="term-title"><h4>{termName+" "}</h4></div>
          {buttons}
          <div className="courses">
            {currentTermCourses}
            {!term.courses.length&&that.state.dragingCourse==""?backgroundText:""}
            <div className={"course moveBlock "+(that.state.dragingCourse==""||i==that.state.dragingCourse.termIndex?"invisible":"")} onDragOver={that.dragOver} onDrop={that.drop.bind(that,i,term.courses.length)}>
                Move Here
            </div>
          </div>
          <div className="clearfix"/>
        </div>
      )
    })

    return(
      <div className={that.state.dragingCourse!=""?"draging":""}>
        <div className="bucket">
          <h3>Bucket</h3>
          {listEl}
        </div>
        <div className="settingsbar">
          <div className="container">
            Total credits:&nbsp;
            <strong className="important">{courseTaken.length*0.5}</strong>
            <div className="pull-right">
              <SaveBtnGroup />
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-xs-12 terms">
              {termsEl}
            </div>
            <div className="col-xs-12">
              <button className='btn btn-default addTermBtn btn-lg btn-block' onClick={that.addTerm.bind(that,data.schedule.length)}>Add a Term</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


$(function(){
  React.renderComponent(
    <MainView />,
    $("#main").get(0)
  );
})
