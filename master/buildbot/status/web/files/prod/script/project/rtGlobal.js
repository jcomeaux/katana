define(["jquery","helpers","dataTables","extend-moment"],function(e,t,n,r){var i=e("#buildQueueTotal"),s=e("#buildSlavesTotal"),o=e("#verticalProgressBar"),u=e("#buildLoad"),a=u.find("span"),f=e("#attentionBox"),l={init:function(){requirejs(["realtimePages"],function(e){l.initDataTable();var t=e.defaultRealtimeFunctions();e.initRealtime(t)})},processGlobalInfo:function(e){r.setServerTime(e.utc),t.isRealTimePage()===!1&&f.removeClass("hide").addClass("show-desktop");var n=e.build_load;i.show(),s.show(),o.show();var l=n<=100?"green":n>=101&&n<=200?"yellow":"red";u.attr({"class":"info-box show "+l});var c=e.slaves_count,h=e.slaves_busy/c*100,p=c-e.slaves_busy,d=e.running_builds;t.verticalProgressBar(o.children(),h),o.attr("title","{0} builds are running, {1}, agents are idle".format(d,p)),s.text(c),a.text(n)},initDataTable:function(){var t=undefined;e(".tablesorter-js").length?t=e(".tablesorter-js"):t=e("#tablesorterRt"),e.each(t,function(t,r){n.initTable(e(r),{})})}};return l});