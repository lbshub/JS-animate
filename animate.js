/**
 * LBS animate  
 * Date: 2012-5-12
 * ===================================================
 * el为要执行动画的元素(id或者元素对象)
 * props 要改变的属性 ({left: 100, widht: 100})
	宽高 width height 
	定位左右 left top 
	透明 opacity
	内填充 paddingTop paddingRight paddingBottom paddingLeft
	外填充 marginTop marginRigth marginBottom marginLeft
	边框 borderLeftWidth borderRightWidth borderTopWidth borderBottomWidth
 * opts.fps 每秒动画桢 默认60 (1000/60 ≈ 17)
 * opts.easing 动画效果 默认'linear' (*)
 	spring: 弹簧(*)
 	wobble: 摇晃
 	swing: 摇摆(*)
 	bounce: 反弹(*)
 	easeIn: 加速 渐入
 	easeOut: 减速 渐出
 	easeInOut: 先加速后减速 渐入渐出(*)
 	easeFrom: 由慢到快
 	easeTo: 由快到慢
 	easeOutBounce: 渐出反弹(*)
 	easeInOutBack: 渐入渐出晃动
 	easeInOutQuad: 渐入渐出 四次方(*)
 	easeInOutCubic: 渐入渐出 三次方
 * opts.duration 动画持续时间 默认400(毫秒)
 * opts.callback 动画完成后执行回调	
 * ===================================================
 **/

;(function(window, document) {
	'use strict';

	//动画公式
	var tween = {
		linear: function(pos) {
			return pos;
		},
		spring: function(pos) {
			return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
		},
		wobble: function(pos) {
			return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
		},
		swing: function(pos) {
			return 0.5 - Math.cos(pos * Math.PI) / 2;
		},
		bounce: function(pos) {
			if (pos < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			} else if (pos < (2 / 2.75)) {
				return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
			} else if (pos < (2.5 / 2.75)) {
				return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
			} else {
				return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
			}
		},
		easeIn: function(pos) {
			return -Math.cos(pos * (Math.PI / 2)) + 1;
		},
		easeOut: function(pos) {
			return Math.sin(pos * (Math.PI / 2));
		},
		easeInOut: function(pos) {
			return (-.5 * (Math.cos(Math.PI * pos) - 1));
		},
		easeFrom: function(pos) {
			return Math.pow(pos, 4);
		},
		easeTo: function(pos) {
			return Math.pow(pos, 0.25);
		},
		easeOutBounce: function(pos) {
			if ((pos) < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			} else if (pos < (2 / 2.75)) {
				return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
			} else if (pos < (2.5 / 2.75)) {
				return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
			} else {
				return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
			}
		},
		easeInOutBack: function(pos) {
			var s = 1.70158;
			if ((pos /= 0.5) < 1) return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
			return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
		},
		easeInOutQuad: function(pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
			return -0.5 * ((pos -= 2) * pos - 2);
		},
		easeInOutCubic: function(pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
			return 0.5 * (Math.pow((pos - 2), 3) + 2);
		}
	};

	function camelCase(str) {
		return str.replace(/-\D/g, function(match) {
			return match.charAt(1).toUpperCase();
		});
	}

	function getOpacity(o) {
		var hasOpacity = (o.style.opacity != null),
			reAlpha = /alpha\(opacity=([\d.]+)\)/i,
			filter, opacity;
		if (hasOpacity) {
			opacity = o.style.opacity || getComputedStyle(o, null).opacity;
			return (opacity == '') ? 100 : opacity * 100;
		} else {
			filter = o.style.filter || o.currentStyle.filter;
			if (filter) opacity = filter.match(reAlpha);
			return (opacity == null || filter == null) ? 100 : (opacity[1]);
		}
	}

	function setOpacity(o, v) {
		o.style.opacity != null ? o.style.opacity = v / 100 : o.style.filter = 'alpha(opacity=' + v + ')';
	}

	function getStyle(o, n) {
		n = camelCase(n);
		if (n.toLowerCase() === 'opacity') return getOpacity(o);
		return o.currentStyle ? o.currentStyle[n] : getComputedStyle(o, null)[n];
	}

	function setStyle(o, n, v) {
		n = camelCase(n);
		switch (n) {
			case 'left':
			case 'right':
			case 'top':
			case 'bottom':
				v = parseFloat(v) + 'px';
				break;
			case 'width':
			case 'height':
			case 'marginLeft':
			case 'marginRight':
			case 'marginTop':
			case 'marginBottom':
			case 'paddingLeft':
			case 'paddingRight':
			case 'paddingTop':
			case 'paddingBottom':
			case 'borderLeftWidth':
			case 'borderRightWidth':
			case 'borderTopWidth':
			case 'borderBottomWidth':
				v = parseFloat(v) < 0 ? 0 : parseFloat(v) + 'px';
				break;
		}
		n.toLowerCase() === 'opacity' ? setOpacity(o, v) : o.style[n] = v;
	}

	function animate(el, props, opts) {
		el = typeof el === 'string' ? document.getElementById(el) : el;
		if (!el) return;
		opts = opts || {};
		var duration = opts.duration || 400,
			fps = opts.fps || 60,
			easing = (opts.easing && tween[opts.easing]) || tween.linear,
			callback = opts.callback || function() {},
			p, prop, count = 0,
			amount = 0;
		for (p in props) amount++;
		for (prop in props) {
			(function(prop) {
				var start = parseInt(getStyle(el, prop)),
					end = parseInt(props[prop]),
					change = end - start,
					startTime = new Date() - 0;
				!function play() {
					var newTime = new Date() - 0,
						timestamp = newTime - startTime,
						delta = easing(timestamp / duration);
					setStyle(el, prop, parseInt(start + delta * change));
					if (timestamp > duration) {
						setStyle(el, prop, end);
						if (++count === amount) {
							callback && callback();
						}
					} else {
						setTimeout(play, 1000 / fps);
					}
				}();
			})(prop);
		}
	}

	window.animate = animate;

}(window, document));