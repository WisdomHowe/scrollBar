# 滚动条

### 使用之时需加上这几个文件
<link rel="stylesheet" href="styles/scrollBar.css">

<script src="scripts/jquery.js"></script>
  
<script src="scripts/scrollBar.js"></script>  

```Html
//html结构如下
<div class="scroll-container scrollA">
	<div class="scroll-wrapper">
		...内容...
	</div>
	<div class="scroll-bar"></div>
</div>
```

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