actions = (function () {

	var routeHandlers;

	function loadCurrentPath () {
		loadCurrentPath._called = true;
		actions.goto(window.location.pathname);
	}

	function actions (delegate, routeActionMap) {
		
		if (routeHandlers) throw new Error('Routes already defined. actions() should only be called once between calls to actions.reset()');
		routeHandlers = {};

		for(var route in routeActionMap) {
			var action					 = routeActionMap[route];
			routeHandlers[route] = new actions.Route(route, delegate, action);
		}

		return actions;
	}

	actions.reset = function () {
		routeHandlers = null;
	}

	actions.goto = function () {

		var route 	= arguments[0]
			, handler = routeHandlers[route]
			, args 		= Array.prototype.slice.call(arguments, 1, arguments.length);
		
		/*
			either there is a handler for the route or the route requires 
			us to look for a matching handler
		*/
		if (!handler) {
			// look for an actions.Route with a template matching the route
			
			for (var routeTemplate in routeHandlers) {
				var h			 = routeHandlers[routeTemplate]
					, params = h.params(route);

				if (params) {
					handler = h;
					args 		= params;
					break;
				}
			}

			if (!handler) {
				throw new Error('Route not found: ' + route);
			}
		}

		route = handler.interpolate(args);
		handler.apply(args);
	}

	actions.start = function () {
		window.onpopstate = loadCurrentPath;

		window.onload = function () {
			if (!loadCurrentPath._called) loadCurrentPath();
		}
	}

	return actions;
})();
