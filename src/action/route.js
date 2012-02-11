actions.Route = (function () {
	
	var parameterRegex  					= /:([\w\d-]+)/
		, parameterReplacementRegex = /:([\w\d-]+)/g;

	function Route (routeTemplate, delegate, routesHelper, action) {
		var route = this;

		route._routeTemplate = routeTemplate;
		route._routeRegex		 = new RegExp('^' + routeTemplate.replace(parameterReplacementRegex, '([\\w\\d-]+)') + '$')
		route._delegate			 = delegate;
		route._actionPath		 = action.split('.');

		var memberName = route._actionPath[0];

		for (var i = 0, j = 1, l = route._actionPath.length; j < l; i++, j++) {
			routesHelper[memberName] = routesHelper[memberName] || {};
			routesHelper = routesHelper[memberName];
			memberName = route._actionPath[j];
		}

		routesHelper[memberName] = function () {
			actions.goto.bind(actions, route._routeTemplate).apply(actions, arguments);
		}
	}

	Route.prototype = {
		apply: function (args) {
			var route 				 = this
				// find the function and the object to which it belongs...
				, actionContext  = null
				, actionFunction = route._delegate;
		
			route._actionPath.forEach(function (memberName) {
				actionContext   = actionFunction
				actionFunction 	= actionContext[memberName];
			});

			return actionFunction.apply(actionContext, args);
		}
	, interpolate: function (args) {
			var route 	 				  = this
				, args  				= args || []
				, routeTemplate = route._routeTemplate
			
			for (var i = 0, l = args.length; i < l; i++) {
				routeTemplate = routeTemplate.replace(parameterRegex, args[i]);
			}

			return routeTemplate;
		}
	, params: function (route) {
			var params = this._routeRegex.exec(route);
			if (params) return params.slice(1, params.length);
			return false;
		}
	};

	return Route;
})();