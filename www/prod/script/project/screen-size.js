define(["jquery"],function(){var e={EXTRA_SMALL:480,SMALL:768,MEDIUM:992,LARGE:1520};return{isExtraSmallScreen:function(){return this.getViewportMediaQuery(e.EXTRA_SMALL).matches},isSmallScreen:function(){return this.getViewportMediaQuery(e.SMALL).matches},isMediumScreen:function(){return this.getViewportMediaQuery(e.MEDIUM).matches},isLargeScreen:function(){return this.getViewportMediaQuery(e.LARGE).matches},getViewportMediaQuery:function(e){return window.matchMedia("(min-width: {0}px".format(e))},viewportSizes:e}});
//# sourceMappingURL=screen-size.js.map