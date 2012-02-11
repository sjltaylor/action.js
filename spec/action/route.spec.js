describe('actions.Route', function () {
	
	var delegate
		, function1 = jasmine.createSpy('function1')
		, function2 = jasmine.createSpy('function2');

	beforeEach(function () {
		delegate = {
			function1: function1
		, nested: {
				function2: function2
			}
		}
	});

	describe('#apply()', function () {
		
		it('calls the correct delegate member function', function () {
			
			var rh = new actions.Route('/a/path', delegate, {}, 'function1');
			rh.apply();
			
			expect(function1).toHaveBeenCalled();
		});

		it('calls nested actions', function () {
			
			var rh = new actions.Route('/a/path', delegate, {}, 'nested.function2');
			rh.apply();

			expect(function2).toHaveBeenCalled();
		});
	});
});