
// --- constants

const HTTP  = { OK: 200, NOT_FOUND: 404, SERVER_ERROR: 500 };
const FETCH = { TIMEOUT: 5000, READY: 4 };
const STATE = { UNLOADED: '0', ERROR: '!' };

// --- css variable helpers

function var_set(id, value, unit = 'px') {
    document.documentElement.style.setProperty(`--${ id }`, `${ value  }${ unit }`);
}

function var_get(id) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${ id }`);
}

// --- timing helpers

function every(duration, action) {
    setInterval(action, duration * 1000);
}

function enqueue(action) {
    setTimeout(action, 0);
}

// --- fetch from server

function fetch(url, cb)
{
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState === FETCH.READY) {
            cb(req.status, req.responseText);
        }
    }

    req.onerror = () => {
        cb(HTTP.SERVER_ERROR, '');
    }

    req.timeout = FETCH.TIMEOUT;
    req.open('GET', url, true);
    req.send();
}

// --- other helpers

function ordinal(num, zero = 'zero') {
    const  AGES = [ zero, 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten' ];
    return AGES[num] || num.toString();
}
