define(["main"],function(){require(["jquery","helpers","iFrameResize"],function(e){function o(e){e&&setTimeout(function(){window.scrollTo(0,document.body.scrollHeight)},300)}var i=e("#logIFrame"),c=e("#scrollOpt"),n=!1;i.iFrameResize({autoResize:!0,sizeWidth:!1,enablePublicMethods:!0,resizedCallback:function(){o(c.prop("checked"))}}),e("body").show(),c.click(function(){window.scrollTo(0,document.body.scrollHeight)}),e(document).keyup(function(e){if(83===e.which&&n===!1){var i=!c.prop("checked");n=!0,c.prop("checked",i),o(i),setTimeout(function(){n=!1},300)}})})});
//# sourceMappingURL=buildLog.js.map