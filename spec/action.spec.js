describe('actions', function () {
	
	var delegate;

	/* spies are defined here so that their call status can be checked when the delegate has been cloaked */
	var root 					= jasmine.createSpy('root')
		, something 		= jasmine.createSpy('something')
		, products			= jasmine.createSpy('products')
		, things_within = jasmine.createSpy('nested: things.within')
		, things_json		= jasmine.createSpy('nested: things.json');

	beforeEach(function () {
		
		delegate = {
			root: 		 root
		, something: something
		, products:  products
		, things: {
				within: things_within
			, json 	: things_json
			}
		};

		actions(delegate, {
			'/'																: 'root'
		, '/something'											: 'something'
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

		it('returns the actions global', function () {
			actions.reset();
			expect(actions({}, {})).toBe(actions);
		});

		describe('cloaking the delegate', function () {
			it('replaces each action function with a proxy that sets the rout and then calls the original', function () {
				delegate.things.within();
				expect(things_within).toHaveBeenCalled();
				expect(window.location.pathname).toBe('/things/within');
			});
		})
	});

	describe('.goto()', function () {
		
		it('sets the url of the page as a new location', function () {
			actions.goto('/something');
			expect(window.location.pathname).toBe('/something');
		});

		it('allows for filetype extensions in the path', function () {
			actions.goto('/things/:id.json', 415);
			expect(window.location.pathname).toMatch(/\.json$/);
		});

		it('matches the appropriate route to run', function () {
			actions.goto('/products/32/outlets/7765');
			expect(products).toHaveBeenCalledWith('32', '7765');
			expect(window.location.pathname).toBe('/products/32/outlets/7765');
		});

		it('throws an error if the route does not match', function () {
			expect(function () {
				actions.goto('/nowhere')
			}).toThrow("Route not found: /nowhere");
		});

		it('calls the target function', function () {
			actions.goto('/');
			expect(root).toHaveBeenCalled();
		});

		it('interpolates arguments correctly', function () {
			actions.goto('/products/:id/outlets/:outletId', 123, 'the-corner-shop');
			expect(window.location.pathname).toEqual('/products/123/outlets/the-corner-shop');
		});

		it('passes arguments to the route handler', function () {
			var args;
			something.andCallFake(function () {
				args = arguments;
			});

			actions.goto('/something', 123, 'the-corner-shop');
			
			expect(args).toEqual([123, 'the-corner-shop']);
		});

		it('calls nested actions', function () {
			actions.goto('/things/within');
			expect(things_within).toHaveBeenCalled();
		});
	});
});