describe('actions', function () {
	
	var delegate, routeHelper;

	beforeEach(function () {
		
		delegate = {
			root: 		 jasmine.createSpy('root')
		, something: jasmine.createSpy('something')
		, trailing:  jasmine.createSpy('trailing')
		, products:  jasmine.createSpy('products')
		, things: {
				within: jasmine.createSpy('nested: things.within')
			, json 	: jasmine.createSpy('nested: things.json')
			}
		};

		routeHelper = actions(delegate, {
			'/'																: 'root'
		, '/something'											: 'something'
		, '/trailing/'											: 'trailing'
		, '/products/:id/outlets/:outletId' : 'products'
		, '/things/within'									: 'things.within'
		, '/things/:id.json'								: 'things.json'
		});
	});

	afterEach(function () {
		actions.reset();
	});

	describe('defining actions with actions()', function () {
		
		it('throws an error if we name a function that cannot be found on the delegate', function () {
			expect(function () {
				actions({}, {'/':'root'})
			}).toThrow();
		});

		it('throws an error if we call actions() more than once', function () {
			expect(function () {
				actions();
			}).toThrow();
		});

		describe('the returned routes helper', function () {
			it('sets the url and calls the delegate', function () {
				routeHelper.things.json(132);
				expect(delegate.things.json).toHaveBeenCalled();
				expect(window.location.pathname).toBe('/things/132.json');
			});
		})
	});

	describe('navigation behaviour', function () {
		
		it('allows me to go back to a previous page', function () {
			actions.goto('/something');
			actions.goto('/things/within');
			history.back();

			waits(500);

			runs(function () {
				expect(location.pathname).toBe('/something');
			});
		});

		it('allows me to go forward to a page which I navigated back from', function () {
			actions.goto('/something');
			actions.goto('/things/within');
			
			history.back();
			
			waits(500);

			runs(function () {
				history.forward();
			});

			waits(500);

			runs(function () {
				expect(location.pathname).toBe('/things/within');
			});
		});

		it('does not change the history legnth if I go back', function () {
			actions.goto('/something');
			actions.goto('/things/within');
			var originalLength = history.length;
			history.back();
			expect(history.length).toBe(originalLength);
		});
	});

	describe('.goto()', function () {
		
		it('sets the url of the page as a new location', function () {
			actions.goto('/something');
			expect(window.location.pathname).toBe('/something');
		});

		it('matches route without a trailing slash with a pathname that has a trailing slash', function () {
			actions.goto('/something/');
			expect(window.location.pathname).toBe('/something');
			expect(delegate.something).toHaveBeenCalled();
		});

		it('matches a route with a trailing slash with a pathname that does not have a trailing slash', function () {
			actions.goto('/trailing');
			expect(window.location.pathname).toBe('/trailing');
			expect(delegate.trailing).toHaveBeenCalled();
		});

		it('allows for filetype extensions in the path', function () {
			actions.goto('/things/:id.json', 415);
			expect(window.location.pathname).toMatch(/\.json$/);
		});

		it('matches the appropriate route to run', function () {
			actions.goto('/products/32/outlets/7765');
			expect(delegate.products).toHaveBeenCalledWith('32', '7765');
			expect(window.location.pathname).toBe('/products/32/outlets/7765');
		});

		it('throws an error if the route does not match', function () {
			expect(function () {
				actions.goto('/nowhere')
			}).toThrow("Route not found: /nowhere");
		});

		it('calls the target function', function () {
			actions.goto('/');
			expect(delegate.root).toHaveBeenCalled();
		});

		it('interpolates arguments correctly', function () {
			actions.goto('/products/:id/outlets/:outletId', 123, 'the-corner-shop');
			expect(window.location.pathname).toEqual('/products/123/outlets/the-corner-shop');
		});

		it('passes arguments to the route handler', function () {
			var args;
			delegate.something.andCallFake(function () {
				args = arguments;
			});

			actions.goto('/something', 123, 'the-corner-shop');
			
			expect(args).toEqual([123, 'the-corner-shop']);
		});

		it('calls nested actions', function () {
			actions.goto('/things/within');
			expect(delegate.things.within).toHaveBeenCalled();
		});
	});

	describe('.run()', function () {
		
		it('does NOT change the current URL', function () {
			var originalLocation = window.location.pathname;
			actions.run('/something');
			expect(window.location.pathname).toBe(originalLocation);
		});

		it('calls the corresponding route handler', function () {
			actions.run('/products/32/outlets/7765');
			expect(delegate.products).toHaveBeenCalledWith('32', '7765');
		});

		it('throws an error if the route does not match', function () {
			expect(function () {
				actions.run('/nowhere')
			}).toThrow("Route not found: /nowhere");
		});
	});
});