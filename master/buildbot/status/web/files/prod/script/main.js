define("jquery",[],function(){return jQuery}),require.config({paths:{selectors:"project/selectors",select2:"plugins/select2","datatables-plugin":"plugins/jquery-datatables",dataTables:"project/dataTables",dotdotdot:"plugins/jquery-dotdotdot",screensize:"project/screen-size",helpers:"project/helpers",projectdropdown:"project/project-drop-down",popup:"project/popup",realtimePages:"project/realtimePages",realtimerouting:"project/realtimeRouting",rtbuilddetail:"project/rtBuildDetail",rtbuilders:"project/rtBuilders",rtbuildslaves:"project/rtBuildSlaves",rtbuildqueue:"project/rtBuildqueue",rtglobal:"project/rtGlobal",jqache:"plugins/jqache-0-1-1-min",overscroll:"plugins/jquery-overscroll",moment:"plugins/moment-with-langs","extend-moment":"project/extendMoment",mustache:"libs/mustache-wrap",livestamp:"plugins/livestamp"}}),define(["helpers","dataTables","popup","screensize","projectdropdown","extend-moment"],function(e,t,n,r,i,s){$(document).ready(function(){$("body").show(),($("#builders_page").length||$("#builder_page").length)&&require(["overscroll"],function(e){$("#overScrollJS").overscroll({showThumbs:!1,direction:"horizontal"})}),$(".ellipsis-js").length&&require(["dotdotdot"],function(e){$(".ellipsis-js").dotdotdot()}),($("#commonBranch_select").length||$(".select-tools-js").length)&&require(["selectors"],function(e){e.init()}),e.hasfinished()===!1&&require(["realtimerouting"],function(e){e.init()}),$("#builddetail_page").length>0&&e.summaryArtifactTests(),n.init(),i.init(),e.init(),t.init(),s.init()})});