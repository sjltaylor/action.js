/*Copyright (C) 2012 by sjltaylor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicence, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/;actions = (function () {

	var routeHandlers;

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
		history.pushState({}, '', route);
	}

	actions.start = function () {
		window.onload = function () {
			actions.goto(window.location.pathname);
		}
	}

	return actions;
})();

;actions.Route = (function () {
	
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
})();;