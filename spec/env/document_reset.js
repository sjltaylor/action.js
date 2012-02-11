(function () {
	var p, t;

	beforeEach(function () {
		p = window.location.pathname;	
		t = document.title;
	});

	afterEach(function () {
		history.replaceState({}, '', p);
		document.title = t;
	});

})();