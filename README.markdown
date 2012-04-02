                _   _             
      __ _  ___| |_(_) ___  _ __  
     / _` |/ __| __| |/ _ \| '_ \ 
    | (_| | (__| |_| | (_) | | | |
     \__,_|\___|\__|_|\___/|_| |_|
                              

Action is a javascript framework for push state routing intended for greenfield apps.

## How to use action.js to define routes for you application

    routesHelper = actions(app, {
    	'/'						: 'default'
    , '/things'			: 'things'
    , '/things/:id' : 'thing'
    , '/warn'				: 'warnme'
    , '/admin'      : 'admin.index'
    });
    
`app` is your applications controller and would look like this:
    
    // in a separate file somewhere
    adminController: {
      index: function () { ... }
    }
    
    // in a separate file somewhere
    app = {
      default: function () { ... }
    , things: function () { ... }
    , thing: function (id) { ... }
    , warn: function () { ... }
    , admin: adminController
    }
    
Controllers end up quite large and complex because they handle async model loading, so Action allows the easy separation of router and controller and supports the modularization of the controller (`admin.index`).

`actions(app, { ... })` returns a `routesHelper`. This object is a shadow of the `app` object. Each defined route has helper. If you call `routeHelper.thing(143)` the url is changed to `/things/143` and `app.thing(143)` is called.
