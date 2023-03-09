
'use strict'; // code assumes ECMAScript 6

// --- dependancies

const winston = require('winston');

// --- custom output formatter for 'stdout' and 'stderr'

const formatter = {
    transform(info) {
        let args = info[Symbol.for('splat')] || [];

        args.unshift(info['message']); // order of unshifting is important
        args.unshift(info[Symbol.for('level')]);
        args.unshift(info['timestamp']);
        args = args.map(item => (item === Object(item) ? JSON.stringify(item) : item)); // json stringify the objects

        info[Symbol.for('message')] = args.join(' | ');

        return info;
    }
};

// --- make the standard logger

module.exports = winston.createLogger({
    level: 'info',
    transports: [ new winston.transports.Console() ],
    format: winston.format.combine(winston.format.timestamp(), formatter)
});
