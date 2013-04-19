/*
 TeeChart(tm) for JavaScript(tm)
 @fileOverview TeeChart for JavaScript(tm)
 v1.4 December 2012
 Copyright(c) 2012 by Steema Software SL. All Rights Reserved.
 http://www.steema.com

 Licensed with commercial and non-commercial attributes,
 specifically: http://www.steema.com/licensing/html5

 JavaScript is a trademark of Oracle Corporation.
*/
var Tee=Tee||{};
(function(){function m(c,a){return"rgba( "+c[0]+", "+c[1]+", "+c[2]+", "+a+" )"}function p(){try{return new XMLHttpRequest}catch(c){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(a){}try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(g){}throw Error("Could not create HTTP request object.");}Tee.Chart.prototype.drawReflection=function(){var c=this.ctx,a=this.bounds.height;c.scale(1,-1);c.translate(0,2*-a);this.ondraw=null;this.draw();c.translate(0,2*a);c.scale(1,-1);var g=this.canvas.height-
a,e=c.createLinearGradient(0,a,0,a+g),b=this.reflectionColor;e.addColorStop(0,m(b,0.5));e.addColorStop(1,m(b,1));c.fillStyle=e;c.beginPath();c.shadowColor="transparent";c.rect(0,a,this.bounds.width,g);c.fill();this.ondraw=this.drawReflection};Tee.drawSpline=function(c,a,g,e,b){function f(b,h,a,d,c,f,g){var e=Math.sqrt((a-b)*(a-b)+(d-h)*(d-h)),e=g*e/(e+Math.sqrt((c-a)*(c-a)+(f-d)*(f-d))),g=g-e;return[a+e*(b-c),d+e*(h-f),a-g*(b-c),d-g*(h-f)]}var d=[],h=a.length;if(b){e&&c.moveTo(a[0],a[1]);a.push(a[0],
a[1],a[2],a[3]);a.unshift(a[h-1]);a.unshift(a[h-1]);for(b=0;b<h;b+=2)d=d.concat(f(a[b],a[b+1],a[b+2],a[b+3],a[b+4],a[b+5],g));d=d.concat(d[0],d[1]);for(b=2;b<h+2;b+=2)c.bezierCurveTo(d[2*b-2],d[2*b-1],d[2*b],d[2*b+1],a[b+2],a[b+3])}else{for(b=0;b<h-4;b+=2)d=d.concat(f(a[b],a[b+1],a[b+2],a[b+3],a[b+4],a[b+5],g));e&&c.moveTo(a[0],a[1]);c.quadraticCurveTo(d[0],d[1],a[2],a[3]);for(b=2;b<h-5;b+=2)c.bezierCurveTo(d[2*b-2],d[2*b-1],d[2*b],d[2*b+1],a[b+2],a[b+3]);c.quadraticCurveTo(d[2*h-10],d[2*h-9],a[h-
2],a[h-1])}};Tee.Chart.prototype.applyTheme=function(c){!c||""===c?this.applyTheme("default"):"default"==c?(this.title.format.font.style="18px Verdana",this.walls.visible=!0,this.panel.format.shadow.visible=!0,this.panel.format.round.x=8,this.panel.format.round.y=8,this.panel.format.gradient.visible=!0,this.panel.format.stroke.fill="black",this.axes.left.grid.visible=!0,this.axes.top.grid.visible=!0,this.axes.right.grid.visible=!0,this.axes.bottom.grid.visible=!0):"minimal"==c?(this.title.transparent=
!0,this.walls.visible=!1,this.legend.transparent=!0,this.footer.transparent=!0,this.panel.format.shadow.visible=!1,this.panel.format.stroke.fill="",this.panel.format.round.x=0,this.panel.format.round.y=0,this.panel.format.gradient.visible=!1,this.panel.format.fill="white",this.series.each(function(a){a.notmandatory.grid.visible=!1})):"excel"==c&&(this.palette.colors="#FF9999 #663399 #CCFFFF #FFFFCC #660066 #8080FF #CC6600 #FFCCCC #800000 #FF00FF #00FFFF #FFFF00 #800080 #000080 #808000 #FF0000 #FFCC00 #FFFFCC #CCFFCC #00FFFF #FFCC99 #CC99FF".split(" "));
this.draw()};Tee.doHttpRequest=function(c,a,g,e){var b=p();b&&(b.onreadystatechange=function(){4==b.readyState&&(200===b.status||0===b.status?g(c,b.responseText):e&&e(b.status,b.statusText))},b.open("GET",a,!0),b.send(null))};Tee.Slider=function(c,a){function g(b,a){return a.x>=b.x&&a.x<=b.x+b.width&&a.y>=b.y&&a.y<=b.y+b.height}Tee.Tool.call(this,c);var e=this.thumb=new Tee.Format(c);e.round={x:4,y:4};e.stroke.size=0.5;e.gradient.visible=!0;e.gradient.direction="bottomtop";e.shadow.visible=!0;e=this.back=
new Tee.Format(c);e.fill="white";e.gradient.visible=!0;e.stroke.fill="darkgrey";e.round={x:4,y:4};e=this.grip=new Tee.Format(c);e.round={x:4,y:4};e.stroke.fill="rgb(20,20,20)";this.gripSize=3;var b=this.bounds={x:10,y:10,width:200,height:20};this.transparent=!1;this.margin=16;this.min=0;this.max=100;this.position="undefined"==typeof a?50:a;this.useRange=!1;this.thumbSize=8;this.horizontal=!0;this.cursor="pointer";this.delta=0;this.thumbRect=function(h){var a=this.max-this.min,a=0<a?(this.position-
this.min)/a:0;this.horizontal?(h.width=this.thumbSize,h.x=b.x+a*b.width-0.5*h.width,h.y=b.y,h.height=b.height):(h.height=this.thumbSize,h.y=b.y+a*b.height-0.5*h.height,h.x=b.x,h.width=b.width)};var f={};this.gripRect=function(b){if(this.horizontal){var a=0.2*b.height;return{x:b.x-this.gripSize,y:b.y+0.5*b.height-a,width:2*this.gripSize,height:2*a}}a=0.2*b.width;return{x:b.x+0.5*b.width-a,y:b.y-this.gripSize,width:2*a,height:2*this.gripSize}};this.draw=function(){var a=this.horizontal?b.height:b.width,
d=0.01*a*this.margin;this.transparent||(this.horizontal?this.back.rectangle(b.x,b.y+d,b.width,a-2*d):this.back.rectangle(b.x+d,b.y,a-2*d,b.height));if(this.onDrawThumb)this.onDrawThumb(this);this.thumbRect(f);this.invertThumb?(a=this.thumb,this.horizontal?(a.rectangle(b.x,b.y+d,f.x,b.height-2*d),a.rectangle(b.x+f.x+f.width,b.y+d,b.width,b.height-2*d)):(a.rectangle(b.x+d,b.y,b.width-2*d,f.y),a.rectangle(b.x+d,b.y+f.y+f.height,b.width-2*d,b.height))):this.thumb.rectangle(f);this.useRange&&this.horizontal&&
(d=this.gripRect(f),this.grip.rectangle(d),d.x+=f.width,this.grip.rectangle(d))};this.clickAt=function(a){a=this.min+Math.max(0,(a+this.delta-(this.horizontal?b.x:b.y))*(this.max-this.min)/(this.horizontal?b.width:b.height));a>this.max&&(a=this.max);if(this.onChanging){var d=this.onChanging(this,a);"undefined"!==typeof d&&(a=d)}a<this.min?a=this.min:a>this.max&&(a=this.max);this.chart.newCursor=this.cursor;this.position!=a&&(this.position=a,this.chart.draw())};this.resized=function(){if(this.onChanging)this.onChanging(this,
this.position);this.chart.draw();this.chart.newCursor="col-resize"};this.mousemove=function(a){var d=this.horizontal?b.width:b.height,c=this.horizontal?a.x:a.y,e=this.max-this.min;this.thumbRect(f);this.resizeBegin&&c<f.x+f.width?(a=this.thumbSize,c=f.x-c,this.thumbSize+=c,this.position-=0.5*(c*e/d),this.position<this.min&&(this.position=this.min,this.thumbSize=a),this.resized()):this.resizeEnd&&c>f.x?(a=f.x+f.width-c,this.thumbSize-=a,this.position-=0.5*(a*e/d),this.resized()):this.dragging?this.clickAt(c):
(d=!1,this.useRange&&(e=this.gripRect(f),d=g(e,a),d||(e.x+=f.width,d=g(e,a))),d?this.chart.newCursor="col-resize":g(f,a)&&(this.chart.newCursor=this.cursor))};var d={x:0,y:0};this.mousedown=function(a){this.thumbRect(f);this.chart.calcMouse(a,d);a=this.gripRect(f);this.resizeBegin=this.useRange&&g(a,d);a.x+=f.width;this.resizeEnd=this.useRange&&!this.resizeBegin&&g(a,d);this.dragging=!this.resizeBegin&&!this.resizeEnd&&g(f,d);!this.resizeBegin&&!this.resizeEnd&&(this.dragging?this.delta=this.horizontal?
f.x+0.5*f.width-d.x:f.y+0.5*f.height-d.y:g(b,d)&&(a=this.horizontal?0.5*f.width:0.5*f.height,this.delta=-a,this.clickAt(a+(this.horizontal?d.x:d.y))));return this.dragging||this.resizeBegin||this.resizeEnd};this.clicked=function(){var a=this.dragging||this.resizeBegin||this.resizeEnd;this.resizeBegin=this.resizeEnd=this.dragging=!1;this.delta=0;return a};this.mouseout=function(){this.resizeBegin=this.resizeEnd=this.dragging=!1}};Tee.Slider.prototype=new Tee.Tool;Tee.Scroller=function(c,a){Tee.Chart.call(this,
c);this.target=a;this.aspect.clip=!1;this.panel.transparent=!0;this.title.visible=!1;var g=this.scroller=new Tee.Slider(this);g.useRange=!0;g.thumbSize=100;var e=g.thumb;e.shadow.height=0;e.transparency=0.6;e.stroke.fill="black";e.shadow.visible=!1;g.horizontal=!0;var b=g.bounds;b.x=0;b.y=0;b.width=this.bounds.width;b.height=this.bounds.height;g.margin=0;g.lock=!1;this.tools.add(g);var f=this;a.ondraw=function(){g.lock||f.draw()};a.onscroll=function(){var a=this.axes.bottom,b=this.series,c=b.minXValue(),
b=b.maxXValue(),f=a.maximum-a.minimum;a.minimum<c&&(a.minimum=c,a.maximum=a.minimum+f);a.maximum>b&&(a.maximum=b,a.minimum=a.maximum-f)};this.useRange=function(a){g.useRange=a;this.draw()};this.invertThumb=function(a){g.invertThumb=a;this.draw()};g.onChanging=function(b,c){var e=0.5*(b.thumbSize*(b.max-b.min)/b.bounds.width),g=a.series,n=g.minXValue(),g=g.maxXValue();c-e<n?c=n+e:c+e>g&&(c=g-e);a.axes.bottom.setMinMax(c-e,c+e);this.lock=!0;a.draw();this.lock=!1;if(f.onChanging)f.onChanging(f,c-e,c+
e);return c};this.setBounds=function(a,c,e,f){this.bounds.x=a;this.bounds.y=c;this.bounds.width=e;this.bounds.height=f;b.x=a;b.y=c;b.width=e;b.height=f};g.onDrawThumb=function(b){function c(a,b){var d={mi:a.minimum,ma:a.maximum,sp:a.startPos,ep:a.endPos};e(a,b);return d}function e(a,b){a.minimum=b.mi;a.maximum=b.ma;a.startPos=b.sp;a.endPos=b.ep;a.scale=(b.ep-b.sp)/(b.ma-b.mi)}var m=a.chartRect,n=a.ctx;a.chartRect=g.bounds;a.ctx=g.chart.ctx;var j=g.bounds,i=a.series,k;b.min=i.minXValue();b.max=i.maxXValue();
k=c(a.axes.bottom,{sp:j.x,ep:j.x+j.width,mi:b.min,ma:b.max});var j=c(a.axes.left,{sp:j.y,ep:j.y+j.height,mi:i.minYValue(),ma:i.maxYValue()}),i=0.5*(k.mi+k.ma),l=k.ma-k.mi;if(b.position!=i){b.thumbSize=l*b.bounds.width/(b.max-b.min);l*=0.5;if(f.onChanging)f.onChanging(f,i-l,i+l);b.position=i}a.series.each(function(a){a.visible&&a.useAxes&&a.draw()});e(a.axes.bottom,k);e(a.axes.left,j);a.chartRect=m;a.ctx=n}};Tee.Scroller.prototype=new Tee.Chart;Tee.SliderControl=function(c){c=new Tee.Chart(c);c.panel.transparent=
!0;c.title.visible=!1;var a=new Tee.Slider(c);a.bounds.x=a.thumbSize+1;a.bounds.width=c.canvas.width-2*a.thumbSize-2;a.bounds.y=0.5*(c.canvas.height-a.bounds.height);c.tools.add(a);return a};Tee.CheckBox=function(c,a,g){Tee.Annotation.call(this,c);this.transparent=!0;this.text=a;this.checked=g||!0;this.margins.left=10;this.cursor="pointer";this.check=new Tee.Format(c);this.check.fill="white";this.draw=function(){Tee.Annotation.prototype.draw.call(this);var a=this.chart.ctx,b=this.position.x+2,c=0.6*
this.bounds.height,d=this.position.y+0.4*(this.bounds.height-c);this.check.rectangle(b,d,c,c);this.checked&&(a.beginPath(),a.moveTo(b+3,d+5),a.lineTo(b+4,d+8),a.lineTo(b+7,d+2),this.check.stroke.prepare(),a.stroke())};this.onclick=function(){this.checked=!this.checked;if(this.onchange)this.onchange(this);return!0}};Tee.CheckBox.prototype=new Tee.Annotation}).call(this);
