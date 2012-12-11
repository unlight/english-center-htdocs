function getValue(key, collection, value, remove) {
	if (value == undefined) value = false;
	if (remove == undefined) remove = false;
	var result = value;
	if (typeof collection == 'object' && key in collection) {
		result = collection[key];
	}
	if (remove) {
		delete collection[key];
	}
	return result;
}

function getFormValue(input) {
	var value = null;
	if (input instanceof NodeList) {
		var found = false;
		for (var i in input) {
			if (input[i].checked) {
				input = input[i];
				found = true;
				break;
			}
		}
		if (!found) return null;
	}
	var name = input.nodeName;
	if (name == 'INPUT') name = input.type.toUpperCase();
	switch (name) {
		case 'SELECT': {
			var selectedIndex = input.selectedIndex;
			var selectedOption = input.children[selectedIndex];
			value = selectedOption.value;
		} break;
		case 'RADIO': {
			if (input.checked) {
				value = input.value;
			}
		} break;
		case 'TEXT': {
			value = input.value;
		} break;
		case 'CHECKBOX': {
			value = false;
			if (input.checked) {
				value = input.value;
			}
		} break;
		case 'BUTTON': {
			value = input.value;
		} break;
		default: throw "Unknown input: " +[input, name].join(' ') + ".";
	}
	return value;
}

function validateFormInput(input) {
	var classes = input.className.split(' ');
	var value = getFormValue(input.form[input.name]);
	var labelText = getInputLabel(input);
	var errors = [];
	for (var i = 0; i < classes.length; i++) {
		var c = classes[i];
		if (c == "" || c.indexOf('Validate') != 0) continue;
		var type = c.slice('Validate'.length);
		var errorText = "";
		switch (type) {
			case 'Required': {
				if (value == "" || value == null) {
					errorText = "Не заполнено поле.";
				}
			} break;
			case 'Integer': {
				if (!isNumeric(value) || parseInt(value, 10) != value) {
					errorText = "Не целое число.";
				}
			} break;
			case 'One': {
				var collection = input.form[input.name];
				var checked = false;
				for (var n in collection) {
					if (collection[n].checked) {
						checked = true;
						break;
					}
				}
				if (checked == false) errorText = "Не выбрано.";
			} break;
			default: throw "Unknown validation: " + [type, input].join(' ') + ".";
		}
		if (errorText) errors.push(labelText + ": " + errorText);
	}
	return errors;
}

function getInputLabel(input) {
	var result = input.name;
	for (var parent = input.parentNode; ; parent = parent.parentNode) {
		if (parent == null || parent.nodeName == 'form') {
			break;
		}
		if (parent.nodeName == 'LI') {
			result = parent.children[0];
			result = result.textContent; 
			break;
		}
	}
	return result;
}

function inArray(needle, haystack) {
	for (var i = 0; i < haystack.length; i++) {
		if (needle == haystack[i]) return true;
	}
	return false;
}

function isNumeric(mixed) {
	var result = !isNaN(parseFloat(mixed)) && isFinite(mixed);
	return result;
}

function bindReady(f) {
	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', f);
	} else {
		var oldWindowLoad = window.load;
		var newWindowLoad = function() {
			if (typeof oldWindowLoad == 'function') oldWindowLoad();
			f();
		};
		window.load = newWindowLoad;
	}

}

function insertHtml(file, to) {
	var request = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	//request.responseType = 'text';
	request.open('GET', file, false); 
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var params = {
				request: request,
				responseText: request.responseText
			};
			if (typeof to == 'function') to(params);
			else to.innerHTML = request.responseText;
		}
	}
	request.send();
}

function addFavIcons() {
	var rootCollection = document.getElementsByTagName('section');
	for (var n = 0; n < rootCollection.length; n++) {
		var root = rootCollection[n];
		var anchors = root.getElementsByTagName('a');
		for (var i = 0, length = anchors.length; i < length; i++) {
			var anchor = anchors[i];
			if (anchor.parentNode.nodeName != "P") continue;
			var href = anchor.getAttribute('href');
			if (href.indexOf('//') != -1) {
				var iconUrl = 'http://g.etfv.co/' + encodeURIComponent(href);
				anchor.setAttribute('style', 'padding-left: 20px; background: transparent url('+iconUrl+') no-repeat center left');
			}
		}
	}
}


function arrayUnique(inputArr) {
	var arraySearch = function(needle, haystack) {
		for (var fkey in haystack) {
			if (haystack.hasOwnProperty(fkey)) {
				if ((haystack[fkey] + '') === (needle + '')) return fkey;
			}
		}
		return false;
	}
	var result = [];
	for (var length = inputArr.length, i = 0; i < length; i++) {
		var value = inputArr[i];
		if (arraySearch(value, result) === false) result.push(value);
	}
	return result;
}

function getStyle(element, property) {
	var result;
	if (window.getComputedStyle) {
		result = getComputedStyle(element, null);
	} else {
		result = element.currentStyle;
	}
	if (property) {
		result = result[property];
	}
	return result;
}

function animate(options) {
	var start = new Date; // сохранить время начала 
	var duration = options.duration || 1000;
	var end = options.end;
	var timer = setInterval(function() {
		// вычислить сколько времени прошло
		var progress = (new Date - start) / duration;
		if (progress > 1) progress = 1;
		// отрисовать анимацию
		options.step(progress);
		if (progress == 1) {
			clearInterval(timer); // конец :)
			if (typeof end == "function") end();
		}
	}, options.delay || 10); // по умолчанию кадр каждые 10мс
}

function Accordion(settings) {
	var children = document.querySelectorAll(settings.children);
	var openedPanel;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		new function() {
			var panel = child.querySelector(settings.panel);
			panel.style.display = 'none';
			var handle = child.querySelector(settings.handle);
			handle.addEventListener('click', function(e) {
				if (openedPanel != panel) {
					hidePanels();
					panel.style.display = "block";
					var h = parseInt(getStyle(panel, "height"), 10);
					panel.style.height = "0";
					animate({
						duration: 500,
						step: function(p) {
							panel.style.height = (p * h) + "px";
						}
					});
					openedPanel = panel;
				}
				e.preventDefault();
				return false;
			});
		}
	}

	var hidePanels = function() {
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var panel = child.querySelector(settings.panel);
			if (openedPanel && openedPanel != panel) {
				panel.style.display = 'none';
			}
		}
		// Close opened panel with animation.
		if (openedPanel) {
			var op = openedPanel;
			var originalHeight = parseInt(getStyle(op, "height"), 10);
			animate({
				duration: 500,
				step: function(p) {
					op.style.height = (originalHeight * (1 - p)) + "px";
					op.style.opacity = 1 - p;
				},
				end: function() {
					op.style.display = "none";
					op.style.opacity = 1;
					op.style.height = "auto";
				}
			});
		}
	}
}