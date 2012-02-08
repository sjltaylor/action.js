describe('actions.Route', function () {
	
	var delegate;

	beforeEach(function () {
		delegate = {
			function1: jasmine.createSpy('function1')
		, nested: {
				function2: jasmine.createSpy('function2')
			}
		}
	});

	describe('#apply()', function () {
		
		it('calls the correct delegate member function', function () {
			
			var rh = new actions.Route('/a/path', delegate, 'function1');
			rh.apply();
			
			expect(delegate.function1).toHaveBeenCalled();
		});

		it('calls nested actions', function () {
			
			var rh = new actions.Route('/a/path', delegate, 'nested.function2');
			rh.apply();

			expect(delegate.nested.function2).toHaveBeenCalled();
		});
	});
});