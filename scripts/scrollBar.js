(function(window){
  var options = {
    wrapperClass: ".scroll-wrapper",
    barClass: ".scroll-bar",
    direction: "vertical", //默认垂直方向， horizontal： 横向
    barButton: false, //默认不现实滚动条按钮
    barMinSize: 30, //滚动条小方块最小尺寸
    barButtonScroll: 150, //滚动条按钮按下滑动距离 
    barButtonScrollAnimateTime: 100, //滚动条按钮按下滑动时间
    wheelScroll: 100, //鼠标滑动距离（只在横向滚动条有效）
    callback: function(distance){} //返回内容滚动位置的回调函数
  }
  
	var util = {
		extend: function(option, reset){//修改默认参数
			for(var key in reset){
	      option[key] = reset[key];
	    }
		}
	}
	
  var Scroll = function(elStr, obj){
    var obj = obj || {};
    util.extend(options, obj);
    this.el = $(elStr); //总容器
    this.wrapper = this.el.find(options.wrapperClass); //存放内容容器
    this.bar = this.el.find(options.barClass); //滚动条整体
    this.barTrack = $("<div class='scroll-bar-track'></div>").appendTo(this.bar); //滚动条轨道
    this.barThumb = $("<div class='scroll-bar-thumb'></div>").appendTo(this.barTrack); //滚动条小方块
    this.direction = options.direction;
    this.barButton = options.barButton;
    this.barMinSize = options.barMinSize; //滚动条最小尺寸
    this.barButtonScroll = options.barButtonScroll;
    this.barButtonScrollAnimateTime = options.barButtonScrollAnimateTime;
    this.wheelScroll = options.wheelScroll;
    this.callback = options.callback;
    this.elWidth = this.el.width(); //容器宽度
    this.elHeight = this.el.height(); //容器高度
    this.isStart = false;
    this.start,
    this.move,
    this.distance;
    this.scrollDistance; //滚动位置
    this.initNum = 0; //记录初始化次数
    this.init();
  }
  Scroll.prototype = {
    constructor: Scroll,
    init: function(){ //初始化
      var _this = this;
      this.wrapper.on("DOMSubtreeModified", function(){ //监视内容变化
        _this.init();
      });
      this.initBar();
      this.parameter = this.directionObj(); //获取参数
      if(!this.parameter.isShowBar){ //内容小于容器大小
        this.bar.hide(); //隐藏滚动条
        return false;
      }else{
        if(this.bar.css("display") == "none"){
          this.bar.show();
        }
      }
      this.onScroll();
      if(this.initNum === 0){ //只加载一次
        this.initNum++;
        var mousedown = this.mousedown.bind(this);
        var mousemove = this.mousemove.bind(this);
        var mouseup = this.mouseup.bind(this);
        this.barThumb.on("mousedown", mousedown);
        $(document).on("mousemove", mousemove);
        $(document).on("mouseup", mouseup);
        if(this.direction === "horizontal"){ //判断是否横向滚动
          this.mouseWheel();
        }
      }
    },
    initBar: function(){ //初始化滚动条
      if(this.direction == "horizontal"){
        this.el.addClass("scroll-container-horizontal");
      }else{
        this.el.addClass("scroll-container-vertical");
      }
      this.totalWidth = this.wrapper[0].scrollWidth; //内容实际宽度
      this.totalHeight = this.wrapper[0].scrollHeight; //内容实际高度
      this.barWidth = this.bar.width(); //滚动条背景宽度
      this.barHeight = this.bar.height(); //滚动条背景高度
      if(this.barButton){
        this.initBarButton();
      }
      this.initBarTrack();
      this.initBarThumb();
    },
    initBarTrack: function(){ //初始化滚动条轨道
      if(this.direction === "vertical"){
        this.barTrackHeight = this.barHeight;
        if(this.barButton){
          this.barTrack.css("top", this.barPrev.height());
          this.barTrackHeight = this.barTrackHeight - this.barPrev.height() - this.barNext.height();
        }
        this.barTrack.css("height", this.barTrackHeight);
      }else if(this.direction === "horizontal"){
        this.barTrackWidth = this.barWidth;
        if(this.barButton){
          this.barTrack.css("left", this.barPrev.width());
          this.barTrackWidth = this.barTrackWidth - this.barPrev.width() - this.barNext.width();
        }
        this.barTrack.css("width", this.barTrackWidth);
      }
    },
    initBarThumb: function(){ //初始化滚动条小方块的高度/宽度
      if(this.direction === "vertical"){
        this.barThumbHeight = (this.elHeight / this.totalHeight * this.barTrackHeight) < this.barMinSize ? this.barMinSize : (this.elHeight / this.totalHeight * this.barTrackHeight);
        this.barThumb.css("height", this.barThumbHeight);
      }else if(this.direction === "horizontal"){
        this.barThumbWidth = (this.elWidth / this.totalWidth * this.barTrackWidth) < this.barMinSize ? this.barMinSize : (this.elWidth / this.totalWidth * this.barTrackWidth);
        this.barThumb.css("width", this.barThumbWidth);
      }
    },
    initBarButton: function(){ //滚动条两端前进后退按钮
      var _this = this;
      this.barPrev = $("<div class='scroll-bar-prev'></div>").appendTo(this.bar);
      this.barNext = $("<div class='scroll-bar-next'></div>").appendTo(this.bar);
      this.barPrevWidth = this.barPrev.width();
      this.barPrevHeight = this.barPrev.height();
      this.barNextWidth = this.barNext.width();
      this.barNextHeight = this.barNext.height();
      this.barPrev.click(function(){
        _this.scrollPrev();
      });
      this.barNext.click(function(){
        _this.scrollNext();
      });
    },
    scrollPrev: function(){
      this.scrollSlide(-this.barButtonScroll);
    },
    scrollNext: function(){
      this.scrollSlide(this.barButtonScroll);
    },
    scrollSlide: function(val){
      var direction;
      if(this.direction === "vertical"){
        direction = "scrollTop";
      }else if(this.direction === "horizontal"){
        direction = "scrollLeft";
      }
      var scroll = this.wrapper[direction]() + val;
      this.wrapper.animate({[direction]: scroll}, this.barButtonScrollAnimateTime);
    },
    onScroll: function(){ //监视滚轮变化
      var _this = this;
      var allow = this.parameter.allow; //获取滚动条可滚动的距离
      this.wrapper.on("scroll", function(){
        var distance = this[_this.parameter.scroll]; //获取当前内容位于顶端的距离
        var scalce = _this.scalce(distance);
        var place = scalce * allow; //滚动条所在位置
        _this.barThumb.css(_this.parameter.position, place);
        _this.callback(distance);
      });
    },
    scalce: function(distance){ //获取当前内容所在位置位于内容本身高度/宽度的比例值 
      //获取当前内容所在位置位于内容本身高度/宽度的比例值 
      //当前内容距离顶部的距离 = 内容本身总高度|宽度 - 内容能显示的高度|宽度   1 : 1
      //比例值  = 当前内容距离顶部的距离 / (内容本身总高度|宽度 - 内容能显示的高度|宽度)
      var scalce;
      if(this.direction === "vertical"){
        scalce = distance / (this.totalHeight - this.elHeight);
      }else if(this.direction === "horizontal"){
        scalce = distance / (this.totalWidth - this.elWidth);
      }
      return scalce;
    },
    directionObj: function(){ //根据滚动条方向参数设置对应的参数
      var obj = {};
      if(this.direction === "vertical"){
        obj.position = "top";
        obj.scroll = "scrollTop";
        obj.allow = this.barTrackHeight - this.barThumbHeight;
        obj.client = "clientY";
        obj.totalSize = this.totalHeight - this.elHeight;
        obj.buttonSize = this.barPrevHeight;
        obj.isShowBar = this.totalHeight > this.elHeight ? true : false;
      }else if(this.direction === "horizontal"){
        obj.position = "left";
        obj.scroll = "scrollLeft";
        obj.allow = this.barTrackWidth - this.barThumbWidth;
        obj.client = "clientX";
        obj.totalSize = this.totalWidth - this.elWidth;
        obj.buttonSize = this.barPrevWidth;
        obj.isShowBar = this.totalWidth > this.elWidth ? true : false;
      }
      return obj;
    },
    mousedown: function(e){ //鼠标按下滚动条
      var ev = e || window.event;
      ev.preventDefault();
      this.scrollDistance = parseInt(this.barThumb.css(this.parameter.position));
      this.start = ev[this.parameter.client];
      this.isStart = true;
    },
    mousemove: function(e){ //鼠标拖动滚动条
      var ev = e || window.event;
      if(this.isStart){
        this.move = ev[this.parameter.client];
        if(this.scrollDistance + this.move - this.start <= 0){  //拖动到最顶端
          this.barThumb.css(this.parameter.position, 0);
          this.wrapper[this.parameter.scroll](0);
        }else if(this.scrollDistance + this.move - this.start >= this.parameter.allow){ //拖动到最尾部
          this.barThumb.css(this.parameter.position, this.parameter.allow);
          this.wrapper[this.parameter.scroll](this.parameter.totalSize);
        }else{
          var scalce = parseInt(this.barThumb.css(this.parameter.position)) / this.parameter.allow;
          this.barThumb.css(this.parameter.position, this.scrollDistance + this.move - this.start);
          this.wrapper[this.parameter.scroll](scalce * this.parameter.totalSize);
        }
      }
    },
    mouseup: function(){ //鼠标松开滚动条
      this.isStart = false;
    },
    mouseWheel: function(){ //监听鼠标滚轮
      var _this = this;
      var el = this.el[0];
      var mousewheel;
      var wheel;
      if (typeof el.onmousewheel == "object") {
        mousewheel = "mousewheel";
        wheel = "deltaY";
      }else if(typeof el.onmousewheel == "undefined"){
        mousewheel = "DOMMouseScroll";
        wheel = "detail";
      }
      this.addEvent(el, mousewheel, function(e){
        var ev = e || window.event;
        if(ev[wheel] > 0){
          _this.wrapper.scrollLeft( _this.wrapper.scrollLeft() + _this.wheelScroll );
        }else{
          _this.wrapper.scrollLeft( _this.wrapper.scrollLeft() - _this.wheelScroll );
        }
      });
    },
    addEvent: function(el, type, fn){
      if(el.addEventListener){
        el.addEventListener(type, fn, false);
      }else if(el.attachEvent){
        el.attachEvent("on"+type, fn);
      }else{
        el["on"+type] = fn;
      }
    }
  }

  window.Scroll = Scroll;
})(window);