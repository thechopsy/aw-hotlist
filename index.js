
'use strict'; // code assumes ECMAScript 6

// --- dependancies

const Server = require('./lib/server.js');
const Model  = require('./lib/model.js' );
const Format = require('./lib/format.js');
const logger = require('./lib/logger.js');

// --- running context

var server = new Server('hotlist service');

// --- add-ins

server.app.locals.format = Format;

// --- card

server.router.get('/model/:id', (req, res) => {
    Model.profile(req.params.id).then(profile => {
        if (profile.bio.name) {
            res.render('card', { profile });
        }
        else {
            res.sendStatus(404);
        }
    });
});

// --- list

server.router.get('/hotlist/:ids', (req, res) => {
    res.render('cards', { ids: req.params.ids.split(',').map(i => i.trim()) });
});

// --- cards

server.router.get('/', (req, res) => {
    res.render('cards', { id: req.query.id });
});

// --- main

server.listen();
