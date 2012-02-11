actions = (function () {

	var routeHandlers, routesHelper;

	function loadCurrentPath (event) {
		loadCurrentPath._called = true;
		actions.run(window.location.pathname);
	}

	function actions (delegate, routeActionMap) {
		
		if (routeHandlers) throw new Error('Routes already defined. actions() should only be called once between calls to actions.reset()');
		routeHandlers = {};
		routesHelper 	= {}; 

		for(var routeTemplate in routeActionMap) {
			var action = routeActionMap[routeTemplate];
			routeHandlers[routeTemplate] = new actions.Route(routeTemplate, delegate, routesHelper, action);
		}

		return routesHelper;;
	}

	actions.reset = function () {
		routeHandlers = null;
		routesHelper  = null;
	}

	actions.run = function () {
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
		
		handler.apply(args) || '';
		
		return route;
	}	

	actions.goto = function () {

		var route = actions.run.apply(this, arguments);
		
		history.pushState({}, '', route)

		return route;
	}

	actions.start = function () {
		
		if (routeHandlers) {
			window.onpopstate = loadCurrentPath

			if (/Firefox/.test(navigator.userAgent))
			window.onload = function () {
				loadCurrentPath();
			}
		}
	}

	return actions;
})();
