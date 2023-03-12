
// --- constants

const ANIMATE  = parseFloat(var_get('card-speed'));
const INTERVAL = { GALLERY: 4.5, RELOAD: 1.5, AGE: 1.5 };

// --- resize

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

// --- selectors

function get(which, what = '') {
    return document.querySelector(`.card${ which } ${ what }`);
}

function nav(which) {
    return document.querySelector(`.nav${ which }`);
}

// --- card flip

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

// --- card flop

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

// --- edit list

function edit() {
    let element = document.createElement('div');
    let context = [];

    deck.all(card => {
        element.innerHTML = card.content;

        let name  = element.querySelector('h2').innerText;
        let state = card.fresh ? STATE.UNLOADED : card.error ? STATE.ERROR : name;

        context.push(`${ card.id }|${ state }`);
    });

    window.location.href = `/edit/${ btoa(context.join(',')) }`;
}

// --- gallery rotating

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

every(INTERVAL.GALLERY, gallery);

// --- card age indicator

function age() {
    let age = Math.floor(deck.current.age / 60);
    let tag = get('.current .age');
    if (tag) tag.innerHTML = `${ ordinal(age, 'less than a') } minute${ age > 1 ? 's' : '' } ago`;
}

every(INTERVAL.AGE, age);

// --- queued an action

function go(action) {
    const BUSY  = 1;  // here we only allow one at a time only
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

// --- touch handler

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

// --- key press handler

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

// --- show or hide navigation

function navigation() {
    nav('.vertical.above'  ).style.opacity = deck.first         ? 0 : 1;
    nav('.vertical.below'  ).style.opacity = deck.last          ? 0 : 1;
    nav('.horizontal.left' ).style.opacity = deck.current.empty ? 0 : 1;
    nav('.horizontal.right').style.opacity = deck.current.empty ? 0 : 1;
}

// --- card loader

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

// --- refresh and reload

function reload() {
    let todo = deck.stalest;
    if (todo) todo.reload();
}

every(INTERVAL.RELOAD, reload);

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

// --- entry point -

let deck  = new Deck(IDS);
let moves = { queue: Promise.resolve(), depth: 0 };

load();
