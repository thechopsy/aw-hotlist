
'use strict'; // code assumes ECMAScript 6

// --- dependancies

const moment = require('moment');

// --- format methods (exported)

module.exports = {

    // --- string

    string: (text, missing = '') => {
        return text || missing;
    },

    // --- number

    number: (num) => {
        return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
    },

    // --- date

    date: (date) => {
        return date ? moment(date, 'DD/MM/YYYY').format('MMM YYYY') : 'Unknown';
    },

    // --- bool

    bool: (question, yes, no) => {
        return question ? yes : no;
    },

    // --- currency

    currency: (amount) => {
        return amount ? `£${ amount }` : '';
    },

    // --- flag

    flag: (nationality) => {
        const flags =
        {
            'Czech'       : '🇨🇿',
            'British'     : '🇬🇧',
            'Brazilian'   : '🇧🇷',
            'Polish'      : '🇵🇱',
            'Hungarian'   : '🇭🇺',
            'Bulgarian'   : '🇧🇬',
            'Romanian'    : '🇷🇴',
            'Portuguese'  : '🇵🇹',
            'Spanish'     : '🇪🇸',
            'Moldovan'    : '🇲🇩',
            'Thai'        : '🇹🇭',
            'German'      : '🇩🇪',
            'Australian'  : '🇪🇦',
            'Russian'     : '🇷🇺',
            'Italian'     : '🇮🇹',
            'Venezuelan'  : '🇻🇪',
            'Chinese'     : '🇨🇳',
            'French'      : '🇫🇷',
            'Irish'       : '🇮🇪',
            'American'    : '🇺🇸',
            'Canadian'    : '🇨🇦',
            'Israeli'     : '🇮🇱',
            'Mexican'     : '🇲🇽',
            'Nigerian'    : '🇳🇬',
            'Danish'      : '🇩🇰',
            'Peruvian'    : '🇵🇪',
            'Lithuanian'  : '🇱🇹',
            'Zambian'     : '🇿🇲',
            'Austrian'    : '🇦🇹',
            'Swiss'       : '🇨🇭',
            'Japanese'    : '🇯🇵',
            'Swedish'     : '🇸🇪',
            'Turkish'     : '🇹🇷',
            'Dominican'   : '🇩🇴',
            'Slovakian'   : '🇸🇰',
            'Ukrainian'   : '🇺🇦',
            'South Korean': '🇰🇷',
        };

        return flags[nationality] || '';
    }
}
