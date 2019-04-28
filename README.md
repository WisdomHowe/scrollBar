# 滚动条

调用方法如下：
```JavaScript
//纵向滚动条
var scrollA = new Scroll(".scrollA", {
	barButton: true, //是否显示现实滚动条按钮， 默认false
	callback: function(distance) {
		console.log(distance)
	}
});
//横向滚动条
var scrollA = new Scroll(".scrollB", {
	direction: "horizontal", //horizontal：横向 vertical:垂直
	barButton: true,
	wheelScroll: 50 //鼠标滑动距离（只在横向滚动条有效）
});
```