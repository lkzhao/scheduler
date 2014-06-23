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
AddCourseModal=React.createClass({
  getInitialState: function() {
    return {input:"",searched:false,subject:"",catalog_number:"",errMsg:""};
  },
  componentDidMount:function(){

  },
  searchCourse:function(e){
    e.preventDefault();
    if(this.state.subject==""||this.state.catalog_number=="")return;
    var subject=this.state.subject;
    var catalog_number=this.state.catalog_number;
    var that=this;
    uwapi.getCourse(subject,catalog_number,function(course){
      if(course){
        that.setState({searched:true,errMsg:""});
      }else{
        that.setState({searched:false,errMsg:"Course not found: "+subject+catalog_number});
      }
    })
    return false;
  },
  submitCourse:function(){
    if(this.state.searched){
      $('#addCourseModal').modal('hide');
      this.setState({searched:false,errMsg:""});
      this.props.onSubmit({
        subject:this.state.subject,
        catalog_number:this.state.catalog_number
      })
    }
  },
  handleChange:function(e){
    var inputValue=e.target.value;
    subject=inputValue.match(/^\D+/);
    catalog_number=subject?inputValue.substr(subject[0].length):"";
    subject=(subject)?subject[0].toUpperCase().replace(/ /g,''):"";
    catalog_number=catalog_number.toUpperCase().replace(/ /g,'');
    this.setState({input:inputValue,subject:subject,catalog_number:catalog_number,searched:false,errMsg:""},function(){});
  },
  render: function() {
    if(this.state.searched){
      var course=uwapi.getInfo({subject:this.state.subject,
        catalog_number:this.state.catalog_number});
      var content=(
              <div>
                <h3><a target="_blank" href={course.url}>{course.subject+" "+course.catalog_number+" - "+course.title}</a></h3>
                <p>{course.description}</p>
                <div><strong>Antireq: </strong>{course.antirequisite||"none"}</div>
                <div><strong>Prereq: </strong>{course.prerequisites||"none"}</div>
                <div><strong>Terms offered: </strong>{getTermNameArray(course.terms_offered).join(", ")}</div>
              </div>)
    }else{
      var content=this.state.errMsg==""?{}:(<div className="alert alert-danger">{this.state.errMsg}</div>)
    }
    return(
      <div className="modal fade" id="addCourseModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
              <h4 className="modal-title" id="myModalLabel">Add Course</h4>
            </div>
            <div className="modal-body">
              <form onSubmit={this.searchCourse}>
                <div className={"input-group courseInputGroup "+(this.state.searched?"hideBtn":"")}>
                  <input type='text' Placeholder='course search' className='form-control' value={this.state.input} onChange={this.handleChange}/>
                  <span className="input-group-btn">
                    <button type="button" type='submit' className="btn btn-primary">Search</button>
                  </span>
                </div>
              </form>
              {content}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
              {this.state.searched?(<button type="button" className="btn btn-primary" onClick={this.submitCourse}>Add this course</button>):{}}
            </div>
          </div>
        </div>
      </div>
    );
  }
})
SaveBtnGroup=React.createClass({
  defaultSaveInterval:60,
  getInitialState: function() {
    return {saveTime:this.defaultSaveInterval, saving:""};
  },
  setTimer:function(){
    var that=this;
    this.timer=setInterval(function(){
      if(that.state.saveTime<=1){
        that.save();
        that.setState({saveTime:that.defaultSaveInterval})
      }else{
        that.setState({saveTime:that.state.saveTime-1})
      }
    },1000);
  },
  componentDidMount:function(){
    this.setTimer();
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
    this.timer=null;
  },
  componentDidUpdate:function(prevProps, prevState){
    if(this.props.saveText==""&&!this.timer){
      this.setTimer();
    }
  },
  save:function(e){
    var that = this
    this.setState({saveTime:this.defaultSaveInterval, saving:"Saving"})
    $.ajax({
      url:"/save/",
      type:"post",
      dataType:"json",
      data:{
        csrfmiddlewaretoken:data.csrf_token,
        schedule:JSON.stringify(data.schedule)
      },
      success:function(json){
        if(json.success==1){
          that.setState({saving:""})
        }else{
          that.setState({saving:"save failed. check your internet connection"})
        }
      },
      error:function(){
        that.setState({saving:"save failed. check your internet connection"})
      }
    })
  },
  render: function() {
    return(
      <ul className="saveBtnGroup">
        <li><span className="navbar-text">{this.state.saveText!=""?this.state.saveText:"Autosave in "+this.state.saveTime+"s"}</span></li>
        <li><a onClick={this.save}>Save</a></li>
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
  },
  componentWillUnmount: function() {
    $(window).off('mousemove', this.handleMouseMove);
  },
  toggleSkipTerm:function(termIndex){
    if(data.schedule[termIndex].skiped){
      data.schedule.splice(termIndex, 1);
    }else{
      data.schedule.splice(termIndex, 0, {skiped:true,courses:[]});
    }
    this.forceUpdate();
  },
  handleAddCourse:function(termIndex){
    $('#addCourseModal').modal('show');
    this.currentTerm=termIndex;
  },
  addTerm:function(termIndex){
    data.schedule.splice(termIndex,0,{courses:[]});
    this.forceUpdate();
  },
  hasCourse:function(course){
    for (var i = 0; i < data.schedule.length; i++) {
      for (var j = 0; j < data.schedule[i].courses.length; j++) {
        if(data.schedule[i].courses[j].subject==course.subject&&
          data.schedule[i].courses[j].catalog_number==course.catalog_number)
          return true;
      };
    };
    return false;
  },
  confirmAddCourse:function(course){
    if(this.hasCourse(course)){
      console.log("Course added already")
      return false;
    } 
    data.schedule[this.currentTerm].courses.push(course);
    this.forceUpdate();
  },
  addCourse:function(termIndex,course){
    this.currentTerm=termIndex;
    this.confirmAddCourse(course);
  },
  removeTerm:function(termIndex){
    data.schedule.splice(termIndex, 1);
    this.forceUpdate();
  },
  removeCourse:function(course,refresh){
    for (var i = 0; i < data.schedule.length; i++) {
      for (var j = 0; j < data.schedule[i].courses.length; j++) {
        if(data.schedule[i].courses[j].subject==course.subject&&
          data.schedule[i].courses[j].catalog_number==course.catalog_number){
          data.schedule[i].courses.splice(j,1);
          if(refresh) this.forceUpdate();
          return;
        }
      };
    };
  },
  dragStart:function(e){
    if(this.state.dragingCourse!="") return false;
    var $el = $(e.target)
    this.setState({dragingCourse:{
      subject:$el.attr('data-subject'),
      catalog_number:$el.attr('data-catalog_number')
    }});
    this.hidePreview();
    e.dataTransfer.setData('text/plain', e.target.id);
    return true;
  },
  dragEnd:function(e){
    this.setState({dragingCourse:""});
  },
  dragOver:function(e){
    e.preventDefault();
    return true;
  },
  drop:function(e){
    var toCourse={
      subject:$(e.target).closest('.course').attr('data-subject'),
      catalog_number:$(e.target).closest('.course').attr('data-catalog_number')
    }
    var fromCourse = this.state.dragingCourse;
    if(!toCourse.subject||toCourse.subject==""){
      //to term
      var toTerm=parseInt($(e.target).closest('.term').attr('id'));
      this.removeCourse(fromCourse);
      this.addCourse(toTerm,fromCourse);
    }else{
      //swap course
      for (var i = 0; i < data.schedule.length; i++) {
        for (var j = 0; j < data.schedule[i].courses.length; j++) {
          if(name(data.schedule[i].courses[j])==name(toCourse))
            data.schedule[i].courses[j]=fromCourse;
          else if(name(data.schedule[i].courses[j])==name(fromCourse))
            data.schedule[i].courses[j]=toCourse;
        };
      };
    }
    e.preventDefault();
    e.stopPropagation();
    this.setState({dragingCourse:""});
    return false;
  },
  handleMouseMove:function(e){
    if($(".preview.show").length>0)
      $(".preview").css({top:e.clientY+20,left:e.clientX+15});
  },
  showPreview:function(e){
    var $el = $(e.target).closest(".course")
    var course=uwapi.getInfo({
      subject:$el.attr('data-subject'),
      catalog_number:$el.attr('data-catalog_number')
    })
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
    var termsEl=data.schedule.map(function(term,i){
      var termName=calculateTerm(startYear,startTerm,i);
      var isDragingTerm=false;
      var buttons=[
          (<button className='removeTermBtn' onClick={that.removeTerm.bind(that,i)}><i className="fa fa-fw fa-times"></i></button>),
          (<button className="insertTermBtn" onClick={that.addTerm.bind(that,i)}><i className="fa fa-fw fa-plus"></i> insert above</button>),
          (<button className='btn btn-default btn-xs skipTermBtn' onClick={that.toggleSkipTerm.bind(that,i)}>{term.skiped?"Go to School":"Skip / Co-op"}</button>)
          ]
      if(term.skiped){
        return(
        <div className="term" key={i} id={i}>
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
        if(course==that.state.dragingCourse){
          isDragingTerm=true;
        }
        return (
          <div className={classStr} key={j} draggable="true" onDrag={that.dragStart} onDragEnd={that.dragEnd} onDragOver={that.dragOver} onDrop={that.drop} data-subject={course.subject} data-catalog_number={course.catalog_number}>
            <div className={"panel panel-"+(satisfied&&offeredInCurrentTerm?"default":"danger")} onMouseEnter={that.showPreview} onMouseLeave={that.hidePreview}>
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
      $.each(term.courses,function(i,course){courseTaken.push(name(course))});
      return (
        <div key={i} className="term" id={i}>
          <div className="col-md-12"><h4>{termName+" "}{buttons}</h4></div>
            {currentTermCourses}
            <div className={"col-md-4 col-xs-12 col-sm-6 course addCourseBtn "+(isDragingTerm?"hide":"")} onDragOver={that.dragOver} onDrop={that.drop}>
              <div className={"panel"}  onClick={that.handleAddCourse.bind(that,i)}>
                <div className="panel-body">
                  <strong>{that.state.dragingCourse==""?"Add Course":(<i className="fa fa-plus-square-o"></i>)}</strong>
                </div>
              </div>
            </div>
          <div className="clearfix"/>
        </div>
      )
    })
    return(
      <div className={that.state.dragingCourse!=""?"draging":""}>
        {termsEl}
        <div className="col-xs-12">
          <button className='btn btn-default addTermBtn btn-lg btn-block' onClick={that.addTerm.bind(that,data.schedule.length)}>Add a Term</button>
        </div>
        <AddCourseModal onSubmit={this.confirmAddCourse}/>
      </div>
    );
  }
});


$(function(){
  $('body').append($("<div class='preview'></div>"))
  React.renderComponent(
    <MainView />,
    $("#main").get(0)
  );
  React.renderComponent(
    <SaveBtnGroup />,
    $("#saveBtnGroupWrapper").get(0)
  );
})