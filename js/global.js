bindReady(function(){

	var siteMenuWrapper = document.getElementById('SiteMenuWrapper');
	insertHtml('menu.html', siteMenuWrapper);

	// Search in Google.
	var submitHandler = function() {
		var form = this;
		form.addEventListener('submit', function(e) {
			var search = form.Search.value;
			var host = document.location.host;
			if (host != "") {
				var q = encodeURIComponent(search + ' site:' + host);
				var url = "https://www.google.ru/?q=" + q + '#q=' + q;
				window.open(url);
			}
			e.preventDefault();
			return false;
		});
	}
	var form = document.getElementById('SideSearchForm');
	if (!form) {
		insertHtml('search-module.html', function(params) {
			var responseText = params.responseText;
			var panel = document.getElementById('Panel');
			panel.innerHTML += responseText;
			var form = document.getElementById('SideSearchForm');
			submitHandler.call(form);
		});
	} else {
		submitHandler.call(form);
	}

	// Adding favicons.
	addFavIcons();

	// Replace of #CurrentYear
	var currentYear = document.getElementById('CurrentYear');
	currentYear.innerHTML = (new Date()).getFullYear();


	// Calculate cost.
	new function() {
		var priceForPage = 250;
		var priceCoefficients = {
			'Category': {1: 1.2, 2: 1, 3: 1.5, 4: 1.3},
			'Direction': {1: 1, 2: 1.1},
			'Urgent': {'false': 1, 0: 1, 1: 1.4}
		};
		var calculateCostButton = document.getElementById('CalculateCostButton');
		if (!calculateCostButton) return;
		calculateCostButton.addEventListener('click', function() {
			var form = calculateCostButton.form;
			var values = {};
			var errors = [];
			for (var i = 0; i < form.length; i++) {
				var input = form[i];
				var name = input.name;
				var value = getFormValue(form[name]);
				values[name] = value;
				// Validation.
				var validationResults = validateFormInput(input);
				if (validationResults.length > 0) {
					errors = errors.concat(validationResults);
				}
			}
			
			var formErrors = document.getElementById('FormErrors');
			if (formErrors) form.removeChild(formErrors);

			if (errors.length > 0) {
				errors = arrayUnique(errors);
				var div = document.createElement('div');
				div.innerHTML = [
					'<ul class="Errors" id="FormErrors">',
					'<li>' + errors.join('</li><li>') + '</li>',
					'</ul>'
				].join('');
				var errorList = div.firstChild;
				form.insertBefore(errorList, form.children[0]);
				return false;
			}
			// Calculate.
			var coefficient = 1;
			for (var name in values) {
				var value = values[name];
				var amplifier = getValue(value, getValue(name, priceCoefficients));
				if (amplifier && amplifier > 1) coefficient *= amplifier;
			}
			var pages = parseInt(values.NumberOfPages, 10);
			var totalPrice = values.NumberOfPages * priceForPage * coefficient;
			document.getElementById('TotalPriceValue').innerHTML = totalPrice;
			document.getElementById('TotalPriceInfo').style.display = 'block';
		});
	}

	// Lorem ipsum script.
	if (typeof fixie != 'undefined') {
		fixie.init();
	}

	if (typeof Accordion == 'function') {
		var settings = {
			children: '#FaqList li',
			panel: '.Item',
			handle: 'a'
		};
		new Accordion(settings);
	}

	// Last. Pinned footer.
	var search = document.location.search;
	var NoPinnedFooter = search.indexOf('NoPinnedFooter') != -1;
	if (!NoPinnedFooter) {
		var frame = document.getElementById('Frame');
		PinnedFooter({frame: frame});
	}
});