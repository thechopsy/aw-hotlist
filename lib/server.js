
'use strict'; // code assumes ECMAScript 6

// --- dependancies

const express = require('express');
const logger  = require('./logger.js');

// --- constants - not deployment configurable

const DEFAULT_PORT = 8000;
const PATH_VIEWS   = './views';
const PATH_ASSETS  = './assets';

// --- server class (exported)

module.exports = class Server {

    // --- constructor

    constructor(name, port) {

        // --- set class properties

        this.app    = express();
        this.router = express.Router();

        this.name = name;
        this.port = port || DEFAULT_PORT;

        // --- global settings

        this.app.use('/assets', express.static(PATH_ASSETS));
        this.app.set('views', PATH_VIEWS);
        this.app.set('view engine', 'pug');
        this.app.use(this.router);

        // --- catch all HTTP/404 for unhandled routes

        this.app.use((req, res, next) => {
            res.status(404).json('Not Found');
        });

        // --- catch all HTTP/500 for uncaught exceptions

        this.app.use((err, req, res, next) => {
            logger.error(err);
            res.status(500).json('Server Error');
        });
    }

    // --- starts the server

    listen(cb) {
        this.app.listen(this.port, () => {
            logger.info(`${ this.name } listening on port ${ this.port }`);
            if (cb) cb();
        });
    }
}
