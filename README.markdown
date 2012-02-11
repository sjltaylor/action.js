## How to use action.js to define routes for you application

routesHelper = actions(app, {
	'/'						: 'default'
, '/things'			: 'things'
, '/things/:id' : 'thing'
, '/things/a'		: 'things.inner'
, '/warn'				: 'warnme'
});

-> delegate functions can return a title :)

## Limitations

* app object cannot use keys with a dot in them