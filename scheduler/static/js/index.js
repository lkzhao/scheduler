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
    return {input:"",focus:false,loading:false,searched:false,subject:"",catalog_number:"",errMsg:""};
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
  searchCourse:function(e){
    e.preventDefault();
    if(this.state.searched){
      this.setState({searched:false})
      this.handleAddCourse(e);
      return;
    }
    if(this.state.subject==""||this.state.catalog_number=="")return;
    var subject=this.state.subject;
    var catalog_number=this.state.catalog_number;
    var that=this;
    that.setState({loading:true});
    uwapi.getCourse(subject,catalog_number,function(course){
      if(course){
        that.setState({loading:false,searched:true,errMsg:""});
      }else{
        that.setState({loading:false,searched:true,errMsg:"Course not found: "+subject+" "+catalog_number});
      }
    })
    return false;
  },
  handleChange:function(e){
    var inputValue=e.target.value.toUpperCase();
    subject=inputValue.match(/^\D+/);
    catalog_number=subject?inputValue.substr(subject[0].length):"";
    subject=(subject)?subject[0].replace(/ /g,''):"";
    catalog_number=catalog_number.replace(/ /g,'');
    this.setState({input:inputValue,subject:subject,catalog_number:catalog_number,searched:false,errMsg:""},function(){});
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
    var courseName = e.dataTransfer.getData("text/plain")
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
  render: function() {
    var cName = "searchResult"+(this.state.focus?"":" hideUp")
    if(this.state.errMsg!=""){
      var content=(
              <div className={cName}>
                {this.state.errMsg}
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
      var content=(<div className={cName} />)
    }

    return(
      <form className="navbar-form navbar-left" onSubmit={this.searchCourse}>
        <div className="form-group">
          <input id='searchInput' type='text' placeholder='Search for Course' className={'form-control'+(this.state.focus?" focused":"")} value={this.state.input} onChange={this.handleChange} onFocus={this.handleFocus} ref="searchInput"/>
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
    return {autoSave:$("#id-auto-save:checked").length,saveTime:this.defaultSaveInterval, saveText:"", saving:false};
  },
  setTimer:function(){
    var that=this;
    this.timer=setInterval(function(){
      if(!that.state.autoSave) return;
      if(that.state.saveTime<=1){
        that.save();
        that.setState({saveTime:that.defaultSaveInterval})
      }else{
        that.setState({saveTime:that.state.saveTime-1})
      }
    },1000);
  },
  componentDidMount:function(){
    var that = this
    new Switchery($("#id-auto-save").get(0), { color: '#16a085', secondaryColor: '#666a66' })
    var state = $("#id-auto-save").is(":checked")
    $("#id-auto-save-wrapper").attr('title','Auto Save: '+(state?'ON':'OFF'))
    $("#id-auto-save-wrapper").tooltip()
    $("#id-auto-save").on('change',function(e){
      var state = $("#id-auto-save").is(":checked")
      that.setState({autoSave:state, saveTime:that.defaultSaveInterval})
      $("#id-auto-save-wrapper").attr('data-original-title','Auto Save: '+(state?'ON':'OFF'))
      $("#id-auto-save-wrapper").tooltip('show')
    })
    this.setTimer();
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
    this.timer=null;
  },
  componentDidUpdate:function(prevProps, prevState){
    if(this.state.saveText==""&&!this.timer){
      this.setTimer();
    }
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
        autosave:this.state.autoSave
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
    if(this.state.autoSave){
      saveText = this.state.saveText!=""?this.state.saveText:"Auto Save in "+this.state.saveTime+"s"
    }
    if(this.state.saving){
      var saveBtn = (
        <a className="btn btn-default disabled">
          <i className="pe-7s-disk fa-spin"></i> Saving
        </a>
        )
    }else{
      var saveBtn = (
        <a className="btn btn-default" onClick={this.save}>
          Save
        </a>
        )
    }
    return(
      <ul className="saveBtnGroup">
        <li><span>{saveText}</span></li>
        <li>{saveBtn}</li>
      </ul>
    );
  }
})

MainView=React.createClass({
  getInitialState: function() {
    return {
            startYear:2012,
            startTerm:2,
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
    e.dataTransfer.setData("text/plain", course.subject+course.catalog_number);
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
      <div className={"course "+(that.state.dragingCourse==""||that.state.dragingCourse.termIndex==-1?"invisible":"")} onDragOver={that.dragOver} onDrop={that.drop.bind(that,-1,listEl.length)}>
        <button className="btn-block btn btn-default moveBlock">
          Move Here
        </button>
      </div>
      ))

    var termsEl=data.schedule.map(function(term,i){
      var termName=calculateTerm(startYear,startTerm,i);
      var buttons=[
          (<button className='removeTermBtn btn btn-default' onClick={that.removeTerm.bind(that,i)}><i className="fa fa-fw fa-times"></i></button>),
          (<button className="insertTermBtn btn btn-default" onClick={that.addTerm.bind(that,i)}><i className="fa fa-fw fa-plus"></i> Insert a Term</button>),
          (<button className='btn btn-default btn-xs skipTermBtn' onClick={that.toggleSkipTerm.bind(that,i)}>{term.skiped?"Go to School":"Skip / Co-op"}</button>)
          ]
      if(term.skiped){
        return(
        <div className="term skiped" key={i} id={i}>
          <div className="col-md-12"><h4>{calculateTerm(startYear,startTerm,i)+" "}<small>skiped </small> {buttons}</h4></div>
          <div className="clearfix"/>
        </div>
        )
      }
      var currentTermCourses=term.courses.map(function(course,j){
        var courseInfo=uwapi.getInfo(course);
        var offeredInCurrentTerm=getTermNameArray(courseInfo.terms_offered).indexOf(termName.substr(5))>-1;
        var satisfied=checkPrereq(courseTaken,courseInfo.prerequisites_parsed);
        var classStr="col-md-4 col-sm-6 col-xs-12 course";
        return (
          <div className={classStr} key={j} draggable="true" onDragStart={that.dragStart.bind(that,i,j)} onDragEnd={that.dragEnd} onDragOver={that.dragOver} onDrop={that.drop.bind(that,i,j)} data-subject={course.subject} data-catalog_number={course.catalog_number}>
            <div className={"panel panel-"+(satisfied&&offeredInCurrentTerm?"default":"danger")} onMouseEnter={that.showPreview.bind(that,i,j)} onMouseLeave={that.hidePreview}>
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
          No course for this term. Search for a course and drag it here from the top list.
        </div>
        )
      $.each(term.courses,function(i,course){courseTaken.push(name(course))});
      return (
        <div key={i} className="term" id={i}>
          <div className="col-md-12"><h4>{termName+" "}{buttons}</h4></div>
            {currentTermCourses}
            {!term.courses.length&&that.state.dragingCourse==""?backgroundText:""}
            <div className={"col-md-4 col-xs-12 col-sm-6 course "+(that.state.dragingCourse==""||i==that.state.dragingCourse.termIndex?"invisible":"")} onDragOver={that.dragOver} onDrop={that.drop.bind(that,i,term.courses.length)}>
              <button className="btn-block btn btn-default moveBlock">
                Move Here
              </button>
            </div>
          <div className="clearfix"/>
        </div>
      )
    })
    return(
      <div className={"row "+ (that.state.dragingCourse!=""?"draging":"")}>
        <div className="dock">
          {listEl}
        </div>
        <div className="col-xs-12 terms">
          <h3 className="page-header">Terms</h3>
          {termsEl}
        </div>
        <div className="col-xs-12">
          <button className='btn btn-default addTermBtn btn-lg btn-block' onClick={that.addTerm.bind(that,data.schedule.length)}>Add a Term</button>
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
  React.renderComponent(
    <SaveBtnGroup />,
    $("#saveBtnGroupWrapper").get(0)
  );
})