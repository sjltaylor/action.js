actions.Route = (function () {
	
	var parameterRegex  					= /:([\w\d-]+)/
		, parameterReplacementRegex = /:([\w\d-]+)/g;

	function Route (routeTemplate, delegate, action) {
		var route = this;

		route._routeTemplate = routeTemplate;
		route._routeRegex		 = new RegExp('^' + routeTemplate.replace(parameterReplacementRegex, '([\\w\\d-]+)') + '$')
		
		// find the function and the object to which it belongs...
		route._delegate  	= null;
		route._function   = delegate;
		
		action.split('.').forEach(function (memberName) {
			route._delegate   = route._function;
			route._function 	= route._delegate[memberName];
			route._memberName = memberName; 
		});

		// replace the function with a wrapper
		route._delegate[route._memberName] = function () {
			history.pushState({}, '', route.interpolate(arguments));
			route._function.apply(route._delegate, arguments);
		};

		route._functionWrapper = route._delegate[route._memberName];
	}

	Route.prototype = {
		apply: function (args) {
			var route = this;
			route._functionWrapper.apply(route._delegate, args);
			return route.interpolate(args);
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