actions.Route = (function () {
	
	var parameterRegex  					= /:([\w\d-]+)/
		, parameterReplacementRegex = /:([\w\d-]+)/g;

	function Route (routeTemplate, delegate, action) {
		var rh = this;

		rh._routeTemplate  = routeTemplate;
		rh._routeRegex		 = new RegExp('^' + routeTemplate.replace(parameterReplacementRegex, '([\\w\\d-]+)') + '$')
		rh._context  			 = null;
		rh._function 			 = delegate;
		
		action.split('.').forEach(function (memberName) {
			rh._context  = rh._function;
			rh._function = rh._context[memberName]; 
		});
	}

	Route.prototype = {
		apply: function (args) {
			var rh = this;
			rh._function.apply(rh._context, args);
			return rh.interpolate(args);
		}
	, interpolate: function (args) {
			var rh 	 				  = this
				, args  				= args || []
				, routeTemplate = rh._routeTemplate
			
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