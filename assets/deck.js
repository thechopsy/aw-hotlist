
// --- constants

const STALE_AFTER = 15; // mins

// --- card class --

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
        return 60 * STALE_AFTER;
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

// --- deck class --

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
