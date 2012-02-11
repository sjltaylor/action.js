## How to use action.js to define routes for you application

actions(app, {
	'/'						: 'default'
, '/things'			: 'things'
, '/things/:id' : 'thing'
, '/things/a'		: 'things.inner'
, '/warn'				: 'warnme'
});


## Limitations

* app object cannot use keys with a dot in them