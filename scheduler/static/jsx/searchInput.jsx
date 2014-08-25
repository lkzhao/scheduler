
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
              <div className="container">
                {this.state.message}
              </div>)
    }else if(this.state.searched){
      var course=uwapi.getInfo({subject:this.state.subject,
        catalog_number:this.state.catalog_number});
      var content=(
              <div className="container">
                <h3><a target="_blank" href={course.url}>{course.subject+" "+course.catalog_number+" - "+course.title}</a></h3>
                <p>{course.description}</p>
                <div><strong>Antireq: </strong>{course.antirequisite||"none"}</div>
                <div><strong>Prereq: </strong>{course.prerequisites||"none"}</div>
                <div><strong>Terms offered: </strong>{getTermNameArray(course.terms_offered).join(", ")}</div>
                <div className="pull-right col-xs-12 col-md-6">
                  {($("#admin-btn").length)?<div className="col-xs-4"><a className="btn btn-default btn-block" href={"/admin/app/course/"+course.id}>Edit</a></div>:{}}
                  {(window.editing)?<div className="col-xs-8"><button className="btn btn-primary btn-block">Add to list</button></div>:{}}
                </div>
              </div>
              )
    }else{
      //show suggestion
      if(this.state.dataListType=="Subject"){
        var dataList = this.state.dataList
        var subjectEls = dataList.map(function(subject,i){
          return(
            <div className={"suggestion"+(that.state.dataListSelected==i?" active":"")} onClick={that.handleClick.bind(that,i)}>
              <strong>{subject.name}</strong> - {subject.description}
            </div>
            )
        })
        var content=(
          <div className="container" >
            {subjectEls.length>0?subjectEls:(
              "Subject not found "+that.state.subject
              )}
          </div>
          )
      }else if(this.state.dataListType=="Course"){
        var dataList = this.state.dataList
        var courseEls = dataList.map(function(course,i){
          return(
            <div className={"suggestion"+(that.state.dataListSelected==i?" active":"")} onClick={that.handleClick.bind(that,i)}>
              <strong>{that.state.subject+course.catalog_number}</strong> - {course.title}
            </div>
            )
        })
        var content=(
          <div className="container" >
            {courseEls.length>0?courseEls:(
              "Course not found: "+that.state.subject+" "+that.state.catalog_number
              )}
          </div>
          )
      }else{
        var content=(
          <div className="container" >
            Enter Course Code: i.e <strong>CS241</strong>, <strong>ENGL109</strong>, ...
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
        {(window.editing)?<div className="form-group deleteBtn" data-toggle="tooltip" title="Drag course here to delete" data-placement="bottom" ref="deleteBtn" onDrop={this.drop} onDragOver={this.dragOver}>
          <i className="pe-7s-trash fa-fw"/>
        </div>:{}}
        <div className={cName} >
          {content}
        </div>
      </form>
    );
  }
})



$(function(){
  React.renderComponent(
    <AddCourseModal />,
    $("#searchBtnWrapper").get(0)
  );
})