/** @jsx React.DOM */
var uwapi={
  courseInfo:data.courseInfo||{},
  getCourse:function(subject,catalog_number,callback){
    var course={};
    var that=this;
    $.getJSON("/course/"+subject+"/"+catalog_number,
      function(course){
        if(!course){
          callback(null)
        }
        console.log(course)
        if(course.prerequisites&&course.prerequisites.substr(0,7)=="Prereq:"){
          course.prerequisites=course.prerequisites.substr(8);
        }
        course.name=course.subject+course.catalog_number;
        that.courseInfo[course.subject+course.catalog_number]=course;
        callback(course.name);
    }).fail(function() {
      callback(null);
    })
  },
  getInfo:function(course){
    return this.courseInfo[course.subject+course.catalog_number];
  }
}


function name(obj){
  return obj.subject+obj.catalog_number
}
function calculateTerm(startYear,startTerm,i){
  startYear=startYear+Math.floor((startTerm+i)/3);
  startTerm=(startTerm+i)%3;
  if(startTerm==0)return startYear+" Winter"
  if(startTerm==1)return startYear+" Spring"
  if(startTerm==2)return startYear+" Fall"
}
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
    if(name(data.courseList[i])==name(course))
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
AddCourseModal=React.createClass({
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
    e.preventDefault();
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
    }else if(this.state.searched&&this.state.message==""){
      this.setState({searched:false})
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
    this.setState(state,function(){});
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
    if(hasCourse(course)){
      alert("Course already added")
    }else{
      data.courseList.push(course)
      $(document).trigger("dataUpdated")
      $("body").trigger('mousedown')
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
    if(e.keyCode==40){//down
      if(this.state.dataListSelected<this.state.dataList.length-1)
        this.setState({dataListSelected:this.state.dataListSelected+1})
      e.preventDefault()
    }else if(e.keyCode==38){//up
      if(this.state.dataListSelected>0)
        this.setState({dataListSelected:this.state.dataListSelected-1})
      e.preventDefault()
    }
  },
  render: function() {
    var cName = "searchResult"+(this.state.focus?"":" hideUp")
    var that = this;
    if(this.state.message!=""){
      var content=(
              <div className={cName}>
                {this.state.message}
              </div>)
    }else if(this.state.searched){
      var course=uwapi.getInfo({subject:this.state.subject,
        catalog_number:this.state.catalog_number});
      var content=(
              <div className={cName}>
                <h3><a target="_blank" href={course.url}>{course.subject+" "+course.catalog_number+" - "+course.title}</a></h3>
                <p>{course.description}</p>
                <div><strong>Antireq: </strong>{course.antirequisite||"none"}</div>
                <div><strong>Prereq: </strong>{course.prerequisites||"none"}</div>
                <div><strong>Terms offered: </strong>{getTermNameArray(course.terms_offered).join(", ")}</div>
                <button className="btn btn-default submitCourseBtn">Add to list</button>
              </div>
              )
    }else{
      //show suggestion
      if(this.state.dataListType=="Subject"){
        var dataList = this.state.dataList
        if(dataList.length>10) dataList=dataList.slice(0, 10)
        var subjectEls = dataList.map(function(subject,i){
          return(
            <div className={"suggestion"+(that.state.dataListSelected==i?" active":"")}>
              <strong>{subject.name}</strong> - {subject.description}
            </div>
            )
        })
        var content=(
          <div className={cName} >
            {subjectEls.length>0?subjectEls:(
              "Subject not found "+that.state.subject
              )}
          </div>
          )
      }else if(this.state.dataListType=="Course"){
        var dataList = this.state.dataList
        if(dataList.length>10) dataList=dataList.slice(0, 10)
        var courseEls = dataList.map(function(course,i){
          return(
            <div className={"suggestion"+(that.state.dataListSelected==i?" active":"")}>
              <strong>{that.state.subject+course.catalog_number}</strong> - {course.title}
            </div>
            )
        })
        var content=(
          <div className={cName} >
            {courseEls.length>0?courseEls:(
              "Course not found: "+that.state.subject+" "+that.state.catalog_number
              )}
          </div>
          )
      }else{
        var content=(
          <div className={cName} >
            Enter Course Code: i.e CS241, ENGL109, ...
          </div>
        )
      }
    }

    return(
      <form className="navbar-form navbar-left" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <input id='searchInput' type='text' placeholder='Search for Course' className={'form-control'+(this.state.focus?" focused":"")} value={this.state.input} onChange={this.handleChange} onFocus={this.handleFocus} ref="searchInput" onKeyDown={this.handleKeydown}/>
          <i className={"fa fa-spin fa-spinner searchIndicator "+(this.state.loading?"":"hide")} />
        </div>
        <div className="form-group deleteBtn" data-toggle="tooltip" title="Drag course here to delete" data-placement="bottom" ref="deleteBtn" onDrop={this.drop} onDragOver={this.dragOver}>
          <i className="pe-7s-trash fa-fw"/>
        </div>
        {content}
      </form>
    );
  }
})


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
  handleAutoSaveChange:function(e){
    data.autoSave = $(e.target).is(":checked")
    this.setState({saveTime:this.defaultSaveInterval})
  },
  componentDidMount:function(prevProps, prevState){
    this.setTimer();
  },
  save:function(e){
    var that = this
    this.setState({saveTime:this.defaultSaveInterval, saving:true})
    $.ajax({
      url:"/save/",
      type:"post",
      dataType:"json",
      data:{
        courseList:JSON.stringify(data.courseList),
        csrfmiddlewaretoken:data.csrf_token,
        schedule:JSON.stringify(data.schedule),
        autosave:data.autoSave,
        startYear:data.startYear,
        startTerm:data.startTerm
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
  handleYearChange: function(e){
    data.startYear=parseInt(e.target.value)
    $(document).trigger('dataUpdated')
  },
  handleTermChange: function(e){
    data.startTerm=parseInt(e.target.value)
    $(document).trigger('dataUpdated')
  },
  render: function() {
    saveText=this.state.saveText
    if(data.autoSave){
      saveText = this.state.saveText!=""?this.state.saveText:"Auto Save in "+this.state.saveTime+"s"
    }
    if(this.state.saving){
      var saveBtn = (
        <a className="btn btn-default btn-xs disabled">
          <i className="pe-7s-disk fa-spin"></i> Saving
        </a>
        )
    }else{
      var saveBtn = (
        <a className="btn btn-default btn-xs" onClick={this.save}>
          Save
        </a>
        )
    }
    return(

      <span className="">
        {saveText}
        {saveBtn}
        <div className="btn-group">
          <button className="btn btn-default btn-xs dropdown-toggle" data-toggle="modal" data-target="#settingModal"><i className="fa fa-bars fa-fw"/>Settings</button>
        </div>
        <div id="settingModal" className="modal fade paper-modal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Settings</h4>
              </div>
              <div className="modal-body">
                <input type="checkbox" onChange={this.handleAutoSaveChange} checked={data.autoSave}>Auto Save</input>
                Starting Year:&nbsp;
                <select onChange={this.handleYearChange} value={data.startYear}>
                  <option value="2010">2010</option>
                  <option value="2011">2011</option>
                  <option value="2012">2012</option>
                  <option value="2013">2013</option>
                  <option value="2014">2014</option>
                  <option value="2015">2015</option>
                  <option value="2016">2016</option>
                </select>
                <select onChange={this.handleTermChange} value={data.startTerm}>
                  <option value="0">Winter</option>
                  <option value="1">Spring</option>
                  <option value="2">Fall</option>
                </select>
              </div>
              <div className="paper-btn-group btn-group">
                <a className="btn btn-lg btn-primary">OK</a>
                <a className="btn btn-lg btn-default" data-dismiss="modal">Cancel</a>
              </div>
            </div>
          </div>
        </div>
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
    $(window).on('mousemove', this.handleMouseMove);
    $(document).on('dataUpdated', this.refresh);
  },
  componentWillUnmount: function() {
    $(document).off('dataUpdated', this.refresh);
    $(window).off('mousemove', this.handleMouseMove);
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
  handleMouseMove:function(e){
    if($(".preview.show").length>0)
      $(".preview").css({top:e.clientY+20,left:e.clientX+15});
  },
  showPreview:function(termIndex, courseIndex){
    console.log("showing preview")
    var course=uwapi.getInfo(getTermList(termIndex)[courseIndex])
    var title=$("<h3><strong>"+course.name+"</strong> - "+course.title+"</h3>")
    var desc=$("<p>"+course.description+"</p>")
    var anti=$("<p><strong>Antireq: </strong>"+(course.antirequisite||"none")+"</p>")
    var pre=$("<p><strong>Prereq: </strong>"+(course.prerequisites||"none")+"</p>")
    var terms_offered=$("<p><strong>Terms offered: </strong>"+getTermNameArray(course.terms_offered).join(", ")+"</p>")
    $(".preview").html("").append(title,desc,anti,pre,terms_offered);
    $(".preview").addClass("show")
  },
  hidePreview:function(){
    $(".preview").removeClass("show")
  },
  showhelp:function(text){
    $(".preview").html(text).addClass("show")
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
      $.each(term.courses,function(i,course){courseTaken.push(name(course))});
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
            <strong className="credit">{courseTaken.length*0.5}</strong>
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
  $('body').append($("<div class='preview'></div>"))
  React.renderComponent(
    <MainView />,
    $("#main").get(0)
  );React.renderComponent(
    <AddCourseModal />,
    $("#searchBtnWrapper").get(0)
  );
})
