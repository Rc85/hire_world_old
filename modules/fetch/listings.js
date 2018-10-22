const app = require('express').Router();
const db = require('../db');

app.post('/api/get/listing', async(req, resp) => {
    if (req.session.user) {
        await db.query(`SELECT * FROM user_listings WHERE listing_user = $1`, [req.session.user.username])
        .then(result => {
            let listing;

            if (result && result.rows.length > 0) {
                listing = result.rows[0];
            }

            resp.send({status: 'success', listing: listing});
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    }
});

app.post('/api/get/listings', async(req, resp) => {
    await db.query(`SELECT user_listings.*, user_profiles.user_title, user_reviews.rating FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN
        (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating, reviewing FROM user_reviews GROUP BY reviewing) AS user_reviews
    ON user_reviews.reviewing = user_listings.listing_user
    WHERE listing_sector = $1 AND listing_status = 'Active'
    ORDER BY listing_renewed_date DESC, listing_id`, [req.body.sector])
    .then(result => {
        console.log
        if (result) {
            resp.send({status: 'success', listings: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'access error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/get/listing/detail', async(req, resp) => {
    await db.query(`SELECT user_listings.*, user_settings.allow_messaging, saved_listings.saved_id FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
    LEFT JOIN saved_listings ON saved_listings.saved_listing_id = user_listings.listing_id
    WHERE listing_id = $1 AND listing_status = 'Active'`, [req.body.id])
    .then(async(result) => {
        if (result !== undefined && result.rows.length === 1) {
            let saved = false;

            let savedListing;
            
            if (req.session.user) {
                savedListing = await db.query(`SELECT saved_listing_id FROM saved_listings WHERE saved_listing_id = $1 AND saved_by = $2`, [req.body.id, req.session.user.username]);
            }

            if (savedListing && savedListing.rows.length === 1 && savedListing.rows[0].saved_listing_id === parseInt(req.body.id)) {
                saved = true;
            }

            resp.send({status: 'success', listing: result.rows[0], saved: saved});
        } else {
            resp.send({status: 'access error', statusMessage: 'That listing does not exist'});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'access error', statusMessage: 'An error occurred while trying to find that listing'});
    });
});

app.post('/api/get/saved_listings', async(req, resp) => {
    await db.query(`SELECT user_listings.*, user_profiles.user_title, user_reviews.rating, saved_listings.saved_id FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN
        (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating, reviewing FROM user_reviews GROUP BY reviewing) AS user_reviews
    ON user_reviews.reviewing = user_listings.listing_user
    LEFT JOIN saved_listings ON saved_listings.saved_listing_id = user_listings.listing_id
    WHERE listing_status = 'Active' AND saved_listings.saved_by = $1
    ORDER BY saved_listings.saved_date DESC, listing_id`, [req.session.user.username])
    .then(result => {
        if (result) {
            resp.send({status: 'success', listings: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'access error', statusMessage: 'An error occurred while retrieving your saved listings'});
    });
});

module.exports = app;