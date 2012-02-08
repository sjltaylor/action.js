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
			routeHandlers[route] = new actions.Route(delegate, action);
		}
	}

	actions.reset = function () {
		routeHandlers = null;
	}

	actions.goto = function () {
		var path 		= arguments[0]
			, args 		= arguments[1]//Array.prototype.slice.call(arguments, 1, arguments.length);
			, handler = routeHandlers[path];

		handler.call(args);

		for (var arg in args) {
			var regex = new RegExp(':' + arg, 'g');
			path = path.replace(regex, args[arg]);
		}

		history.pushState({}, '', path);
	}

	return actions;
})();

;actions.Route = (function () {
	
	function Route (delegate, action) {
		var self = this;

		self._context  = null;
		self._function = delegate;
		
		action.split('.').forEach(function (memberName) {
			self._context  = self._function;
			self._function = self._context[memberName]; 
		});
	}

	Route.prototype = {
		call: function (args) {
			this._function.call(self._context, args);
		}
	};

	return Route;
})();;