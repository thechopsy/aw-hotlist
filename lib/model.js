
'use strict'; // code assumes ECMAScript 6

// --- dependancies

var fetch   = require('node-fetch');
var cheerio = require('cheerio');

// --- model methods (exported)

module.exports = {

    // --- loads a service provider profile

    profile: (id) => {

        let url = `https://www.adultwork.com/ViewProfile.asp?UserID=${ id }`;

        return fetch(url)
        .then(res  => res.text())
        .then(html => cheerio.load(html))
        .then($    => {
            let profile = { bio: {}, geo: {}, aw: {}, rates: { incall: [], outcall: [] }};

            profile.bio.name        = $('[itemprop="name"]').first().text();
            profile.bio.telephone   = $('[itemprop="telephone"]').first().text();
            profile.bio.images      = $('img.Border');
            profile.aw.id           = id;
            profile.aw.available    = $(':contains("Available Today")').length > 0;
            profile.aw.verified     = $('img[alt="Member Verified"]').length > 0;
            profile.aw.rating       = $('a:contains("Rating:")').first().text().split(':').pop().trim();
            profile.geo.town        = $('td.Label:contains("Town")').first().next().text();
            profile.geo.county      = $('td.Label:contains("County")').first().next().text();
            profile.geo.region      = $('td.Label:contains("Region")').first().next().text();
            profile.bio.nationality = $('td.Label:contains("Nationality")').first().next().text();
            profile.aw.login        = $('td.Label:contains("Last Login")').first().next().text();
            profile.bio.age         = $('td.Label:contains("Age")').first().next().text();
            profile.aw.views        = $('td.Label:contains("Views")').first().next().text();
            profile.bio.gender      = $('td.Label:contains("Gender")').first().next().text();
            profile.aw.joined       = $('td.Label:contains("Member Since")').first().next().text();

            profile.rates.incall.push(parseInt($('#tdRI0\\.25').first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI0\\.5' ).first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI0\\.75').first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI1'     ).first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI1\\.5' ).first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI2'     ).first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI3'     ).first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI4'     ).first().text()) || 0);
            profile.rates.incall.push(parseInt($('#tdRI10'    ).first().text()) || 0);

            profile.rates.outcall.push(parseInt($('#tdRO0\\.25').first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO0\\.5' ).first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO0\\.75').first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO1'     ).first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO1\\.5' ).first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO2'     ).first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO3'     ).first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO4'     ).first().text()) || 0);
            profile.rates.outcall.push(parseInt($('#tdRO10'    ).first().text()) || 0);

            profile.bio.age    = parseInt(profile.bio.age)   || 0;
            profile.aw.rating  = parseInt(profile.aw.rating) || 0;
            profile.aw.views   = parseInt(profile.aw.views)  || 0;
            profile.bio.images = [... profile.bio.images ].map(i => 'https:' + $(i).attr('src').replace('/t/', '/f/'));
            profile.aw.link    = `https://www.adultwork.com/${ id }`;

            return profile;
        });
    }
}
