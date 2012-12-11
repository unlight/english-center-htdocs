function PinnedFooter(options) {
	var frame = options.frame;
	var body = options.body;
	var foot = options.foot;
	if (!foot) foot = frame.lastElementChild;
	if (!body) body = foot.previousElementSibling;
	
	if (!body) throw new Error("You should set body element which should be expanded.");
	
	var isVerticalScrollbar = function() {
		var root = document.documentElement;
		return (root.scrollHeight > root.clientHeight);
	}

	var getFrameHeight = function() {
		var result = 0;
		for (var i = 0, length = frame.children.length; i < length; i++) {
			var item = frame.children[i];
			result += item.offsetHeight;
		}
		return result;
	}

	var pin = function() {
		if (isVerticalScrollbar()) {
			//body.style.height = 'auto';
			return 1;
		};
		var bodyHeight = body.offsetHeight;
		var bodyAddend = window.innerHeight - getFrameHeight();
		var outerBodyHeight = 0;
		var style = getComputedStyle(body);
		var props = 'margin-top margin-bottom padding-top padding-bottom border-top-width border-bottom-width'.split(' ');
		for (var i = 0; i < props.length; i++) {
			var value = style.getPropertyValue(props[i]);
			var intValue = parseInt(value, 10);
			outerBodyHeight += intValue;
		}
		body.style.height = bodyHeight + bodyAddend - outerBodyHeight + 'px';
	}

	if (window.addEventListener) {
		window.addEventListener('resize', pin);
		window.addEventListener('scroll', pin);
	}

	var tick = function() {
		if (!pin()) {
			setTimeout(tick, 400);
		}
	}

	tick();
}