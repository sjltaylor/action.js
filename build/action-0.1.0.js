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

	var routeHandlers, routesHelper, pathNormalizationRegex = /^(((.*)?[^\/])*)[\/]?$/;

	function loadCurrentPath (event) {
		loadCurrentPath._called = true;
		actions.run(window.location.pathname);
	}

	function normalizePath (routeTemplate) {
		// removes any root or trailing slash
		return pathNormalizationRegex.exec(routeTemplate)[1];
	}

	function actions (delegate, routeActionMap) {
		
		if (routeHandlers) throw new Error('Routes already defined. actions() should only be called once between calls to actions.reset()');
		routeHandlers = {};
		routesHelper 	= {}; 

		for(var routeTemplate in routeActionMap) {
			
			var action = routeActionMap[routeTemplate];
			
			routeTemplate = normalizePath(routeTemplate);
			routeHandlers[routeTemplate] = new actions.Route(routeTemplate, delegate, routesHelper, action);
		}

		return routesHelper;
	}

	actions.reset = function () {
		routeHandlers = null;
		routesHelper  = null;
	}

	actions.run = function () {
		var route 	= normalizePath(arguments[0])
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
;actions.Route = (function () {
	
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

		if (typeof routesHelper[memberName] === 'undefined') {
			routesHelper[memberName] = function () {
				actions.goto.bind(actions, route._routeTemplate).apply(actions, arguments);
			}
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
})();;