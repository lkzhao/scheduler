var Preview,a,bold,button,div,h1,h2,h3,h4,h5,h6,icon,input,p,span,strong,table,tbody,td,th,thead,tr;a=function(){var t;return(t=React.DOM).a.apply(t,arguments)},bold=function(){var t;return(t=React.DOM).b.apply(t,arguments)},button=function(){var t;return(t=React.DOM).button.apply(t,arguments)},div=function(){var t;return(t=React.DOM).div.apply(t,arguments)},h1=function(){var t;return(t=React.DOM).h1.apply(t,arguments)},h2=function(){var t;return(t=React.DOM).h2.apply(t,arguments)},h3=function(){var t;return(t=React.DOM).h3.apply(t,arguments)},h4=function(){var t;return(t=React.DOM).h4.apply(t,arguments)},h5=function(){var t;return(t=React.DOM).h5.apply(t,arguments)},h6=function(){var t;return(t=React.DOM).h6.apply(t,arguments)},icon=function(){var t;return(t=React.DOM).i.apply(t,arguments)},input=function(){var t;return(t=React.DOM).input.apply(t,arguments)},p=function(){var t;return(t=React.DOM).p.apply(t,arguments)},span=function(){var t;return(t=React.DOM).span.apply(t,arguments)},table=function(){var t;return(t=React.DOM).table.apply(t,arguments)},tbody=function(){var t;return(t=React.DOM).tbody.apply(t,arguments)},td=function(){var t;return(t=React.DOM).td.apply(t,arguments)},th=function(){var t;return(t=React.DOM).th.apply(t,arguments)},thead=function(){var t;return(t=React.DOM).thead.apply(t,arguments)},tr=function(){var t;return(t=React.DOM).tr.apply(t,arguments)},strong=function(){var t;return(t=React.DOM).strong.apply(t,arguments)},window.facebookConnect=function(){return F.connect($("#facebookForm").get(0)),!1},window.uwapi={courseInfo:window.data.courseInfo||{},getCourse:function(t,e,n){var r,u;return r={},u=this,$.getJSON("/course/"+t+"/"+e,function(t){return t||n(null),console.log(t),t.prerequisites&&"Prereq:"===t.prerequisites.substr(0,7)&&(t.prerequisites=t.prerequisites.substr(8)),t.name=getCourseName(t),u.courseInfo[t.name]=t,n(t.name)}).fail(function(){return n(null)})},getInfo:function(t){return this.courseInfo[getCourseName(t)]}},window.getCourseName=function(t){return t.subject+t.catalog_number},window.calculateTerm=function(t,e,n){switch(t+=Math.floor((e+n)/3),e=(e+n)%3){case 0:return t+" Winter";case 1:return t+" Spring";case 2:return t+" Fall"}},window.getTermNameArray=function(t){return t.map(function(t){switch(t){case"F":return"Fall";case"W":return"Winter";default:return"Spring"}})},Preview=React.createClass({getInitialState:function(){return{top:0,left:0,html:"",show:!1}},componentDidMount:function(){return $(window).on("mousemove",this.handleMouseMove),window.showPreview=this.showPreview,window.showCoursePreview=this.showCoursePreview,window.hidePreview=this.hidePreview},componentWillUnmount:function(){return $(window).off("mousemove",this.handleMouseMove)},handleMouseMove:function(t){return this.state.show?this.setState({top:t.clientY+20,left:t.clientX+15}):void 0},showCoursePreview:function(t){return function(e){var n;return e=uwapi.getInfo(e),n=div(null,h3(null,strong(null,e.name)," - ",e.title),p(null,e.description),p(null,strong(null,"Antireq: "),e.antirequisite||"none"),p(null,strong(null,"Prereq: "),e.prerequisites||"none"),p(null,strong(null,"Terms offered: "),getTermNameArray(e.terms_offered).join(", "))),t.showPreview(n)}}(this),showPreview:function(t){return this.setState({html:t,show:!0})},hidePreview:function(){return this.setState({show:!1})},render:function(){return div({className:"preview "+(this.state.show?" show":""),style:{top:this.state.top,left:this.state.left}},this.state.html)}}),$(function(){return $("body").append($("<div id='preview'></div>")),React.renderComponent(Preview(null),$("#preview").get(0))});