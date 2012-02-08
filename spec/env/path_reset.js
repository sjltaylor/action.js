(function () {
	var p;

	beforeEach(function () {
		p = window.location.pathname;	
	});

	afterEach(function () {
		history.replaceState({}, '', p);
	});

})();