
// --- constants ---------------------------------------------------------------

const HTTP    = { OK: 200, NOT_FOUND: 404, SERVER_ERROR: 500 };
const FETCH   = { TIMEOUT: 5000, READY: 4 };
const ANIMATE = parseFloat(var_get('card-speed'));

// --- css variable helpers ----------------------------------------------------

function var_set(id, value, unit = 'px') {
    document.documentElement.style.setProperty(`--${ id }`, `${ value  }${ unit }`);
}

function var_get(id) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${ id }`);
}

// --- timing helpers ----------------------------------------------------------

function every(duration, action) {
    setInterval(action, duration * 1000);
}

function enqueue(action) {
    setTimeout(action, 0);
}

// --- fetch from server -------------------------------------------------------

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

// --- resize handler ----------------------------------------------------------

function resize() {
    const MARGIN = { WIDTH: 0.75, HEIGHT: 0.85 };

    let space = {
        width:  window.innerWidth  * MARGIN.WIDTH,
        height: window.innerHeight * MARGIN.HEIGHT
    };

    let width = space.height / parseFloat(var_get('card-size-ratio'));
    var_set('card-width', Math.min(space.width, width));
}

window.onload   = () => { resize() };
window.onresize = () => { resize() };

// --- selectors ---------------------------------------------------------------

function get(which, what = '') {
    return document.querySelector(`.card${ which } ${what}`);
}

function nav(which) {
    return document.querySelector(`.nav${ which }`);
}

// --- card flip handler -------------------------------------------------------

function flip(direction) {
    let card  = get('.current');
    let inner = get('.current', '.card-inner');
    let angle = parseInt(card.getAttribute('data-flip') || '0');

    if (inner) {
        angle += direction === 'right' ? +180 : -180;
        inner.style.transform = `rotateY(${ angle }deg)`;
        card.setAttribute('data-flip', angle);
    }
}

// --- card flop handler -------------------------------------------------------

function flop(direction) {
    if (direction === 'next' && deck.last !== true) {
        deck.next();
        load(false);
    }

    if (direction === 'prev' && deck.first !== true) {
        deck.prev();
        load(true);
    }
}

// --- edit handler ------------------------------------------------------------

function edit() {
    let element = document.createElement('div');
    let context = [];

    deck.all(card => {
        element.innerHTML = card.content;
        context.push(`${ card.id }|${ card.fresh ? '' : card.error ? '!' : element.querySelector('h2').innerText }`);
    });

    window.location.href = `/edit/${ btoa(context.join(',')) }`;
}

// --- gallery handler ---------------------------------------------------------

function gallery() {
    let poster = get('.current', '#poster');

    if (poster) {
        let imgs = poster.getAttribute('data-imgs').split('|');
        let curr = poster.getAttribute('data-curr') || '0';
        let next = (parseInt(curr) + 1) % imgs.length;
        let load = new Image();

        load.onload = () => {
            poster.style.backgroundImage = `url('${ imgs[next] }')`;
            poster.setAttribute('data-curr', next);
        };

        load.src = imgs[next];
    }
}

// --- card age handler --------------------------------------------------------

function ordinal(num, zero = 'zero') {
    const  AGES = [ zero, 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten' ];
    return AGES[num] || num.toString();
}

function age() {
    let age = Math.floor(deck.current.age / 60);
    let tag = get('.current .age');
    if (tag) tag.innerHTML = `${ ordinal(age, 'less than a') } minute${ age > 1 ? 's' : '' } ago`;
}

// --- queued action handler ---------------------------------------------------

function go(action) {
    const BUSY  = 1;  // one at a time only
    const DELTA = 1.05;
    const DELAY = ANIMATE * DELTA * 1000;

    if (moves.depth < BUSY) {
        moves.depth++;
        moves.queue = moves.queue.then(() => new Promise(resolve => {
            if (['left', 'right'].includes(action)) flip(action);
            if (['prev', 'next' ].includes(action)) flop(action);
            setTimeout(() => { resolve() }, DELAY); // next step after current animation plus a bit
        }))
        .then(() => moves.depth--);
    }
}

// --- touch handler -----------------------------------------------------------

document.addEventListener('touchstart', touchStart, false);
document.addEventListener('touchmove' , touchMove,  false);

let start = null;

function touchStart(e) {
    start = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
    }
}

function touchMove(e) {
    if (start) {
        let delta = {
            x: start.x - e.touches[0].clientX,
            y: start.y - e.touches[0].clientY
        }

        if (Math.abs(delta.x) > Math.abs(delta.y)) {
            go(delta.x > 0 ? 'left' : 'right');
        }
        else {
            go(delta.y > 0 ? 'next' : 'prev');
        }

        start = null;
    }
}

// --- key press handler -------------------------------------------------------

document.body.addEventListener('keydown', keyDown);

function keyDown(e) {
    const ACTIONS = {
        ArrowLeft:  'left',
        ArrowRight: 'right',
        ArrowUp:    'prev',
        ArrowDown:  'next'
    };

    let action = ACTIONS[e.key];
    if (action) {
        go(action);
        e.preventDefault();
    }
}

// --- shows or hides navigation -----------------------------------------------

function navigation() {
    nav('.vertical.above'  ).style.opacity = deck.first         ? 0 : 1;
    nav('.vertical.below'  ).style.opacity = deck.last          ? 0 : 1;
    nav('.horizontal.left' ).style.opacity = deck.current.empty ? 0 : 1;
    nav('.horizontal.right').style.opacity = deck.current.empty ? 0 : 1;
}

// --- card loader -------------------------------------------------------------

function load(down) {
    const POS = { TOP: '-150%', MID: '+50%', BOT: '+150%' };

    let card  = {
        curr: get('.current'),
        buff: get(':not(.current)'),
        info: nav('.control.info')
    };

    navigation();
    card.info.innerHTML = `${ deck.index } of ${ deck.count }`;

    card.buff.classList.remove('slide');
    card.curr.classList.remove('slide');

    if (down === undefined) { // initial load
        card.buff.style.top = POS.MID;
        card.curr.style.top = POS.TOP;
    }
    else {
        card.buff.style.top = down ? POS.TOP : POS.BOT;

        enqueue(() => {
            card.buff.classList.add('slide');
            card.curr.classList.add('slide');
            card.buff.style.top = POS.MID;
            card.curr.style.top = down ? POS.BOT : POS.TOP;
        });
    }

    card.buff.classList.add   ('current');
    card.curr.classList.remove('current');

    card.curr.setAttribute('data-flip', 0);
    card.buff.setAttribute('data-flip', 0);

    card.buff.innerHTML = deck.current.content;
    card.buff.classList.toggle('loading', deck.current.empty);

    if (deck.current.stale) {
        deck.current.reload((error, content) => {
            card.buff.innerHTML = content;
            card.buff.classList.toggle('loading', error);
            navigation();
        });
    }
}

// --- refresh and reload handlers ---------------------------------------------

function reload() {
    let todo = deck.stalest;
    if (todo) todo.reload();
}

function refresh() {
    let before = get('.current .refresh');
    before.classList.remove('spin');
    enqueue(() => { before.classList.add('spin') });

    deck.current.reload((error, content) => {
        get('.current').innerHTML = content;

        let after = get('.current .refresh');
        after.classList.add('spin');
        enqueue(() => { after.classList.remove('spin') });
    });
}

// --- card class --------------------------------------------------------------

class Card {
    constructor(id) {
        this.loaded  = 0;
        this.id      = id;
        this.error   = false;
        this.content = this.prompt('Loading');
    }

    static get tick() {
        return Date.now() / 1000;
    }

    static get AGED() {
        return 60 * 15; // 15 mins
    }

    get age() {
        return Card.tick - this.loaded;
    }

    get fresh() {
        return this.loaded === 0;
    }

    get stale() {
        return this.error ? false : this.age > Card.AGED;
    }

    get empty() {
        return this.error || this.fresh;
    }

    get url() {
        return `/model/${ this.id }`;
    }

    prompt(state) {
        return `<h2>${ state }: ${ this.id }</h2>`;
    }

    reload(cb) {
        fetch(this.url, (status, content) => {
            if (status !== HTTP.OK) {
                this.error = true;
                content    = this.prompt(status === HTTP.NOT_FOUND ? 'Not Found' : 'Error Loading');
            }

            this.loaded  = Card.tick;
            this.content = content;
            if(cb) cb(this.error, this.content);
        });
    }
}

// --- deck class --------------------------------------------------------------

class Deck {
    constructor(ids) {
        this.cards = ids.map(i => new Card(i));
        this.curr  = 0;
    }

    get first() {
        return this.curr === 0;
    }

    get last() {
        return this.curr === this.cards.length - 1;
    }

    get current() {
        return this.cards[this.curr];
    }

    get index() {
        return this.curr + 1;
    }

    get count() {
        return this.cards.length;
    }

    get stalest() {
        return this.cards.find(i => i.stale);
    }

    next() {
        this.curr = Math.min(this.curr + 1, this.cards.length - 1);
    }

    prev() {
        this.curr = Math.max(this.curr - 1, 0);
    }

    all(cb) {
        this.cards.forEach(card => cb(card));
    }
}

// --- entry point -------------------------------------------------------------

let deck  = new Deck(IDS);
let moves = { queue: Promise.resolve(), depth: 0 };

every(2.5, reload);
every(4.5, gallery);
every(1.0, age);

load();
