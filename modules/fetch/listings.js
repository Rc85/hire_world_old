const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/get/listing', async(req, resp) => {
    if (req.session.user) {
        await db.query(`SELECT user_listings.*, users.connected_acct_status FROM user_listings
        LEFT JOIN users ON users.username = user_listings.listing_user
        WHERE listing_user = $1 AND listing_status != 'Delete'`, [req.session.user.username])
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
    let orderBy = '';
    let sectors = '';
    let limit = '';
    let params = [];

    if (req.body.recent) {
        orderBy = `listing_created_date DESC`;
        limit = `LIMIT 5`;
    } else {
        orderBy = `listing_renewed_date DESC`;
        sectors = `listing_sector = $1 AND`;
        params = [req.body.sector];
    }

    await db.query(`SELECT users.subscription_end_date, user_listings.*, user_profiles.user_title, user_reviews.rating, user_reviews.review_count, jobs.job_complete, user_profiles.avatar_url, users.connected_acct_status FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN
        (SELECT reviewing, SUM(review_rating) / COUNT(review_id) AS rating, COUNT(review_id) AS review_count
        FROM user_reviews
        WHERE review_rating IS NOT NULL
        GROUP BY reviewing) AS user_reviews ON user_reviews.reviewing = user_listings.listing_user
    LEFT JOIN
        (SELECT job_user, COUNT(job_id) AS job_complete FROM jobs WHERE job_status = 'Completed' GROUP BY job_user LIMIT 1) AS jobs ON jobs.job_user = user_listings.listing_user
    WHERE ${sectors} users.subscription_end_date > current_timestamp AND listing_status = 'Active'
    ORDER BY ${orderBy}, listing_id
    ${limit}`, params)
    .then(result => {
        if (result) {
            for (let row of result.rows) {
                if (!row.job_complete) {
                    row.job_complete = 0;
                }
            }

            resp.send({status: 'success', listings: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'access error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/get/listing/detail', async(req, resp) => {
    await db.query(`SELECT users.user_email, user_listings.*, user_settings.*, user_profiles.* FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    WHERE listing_id = $1 AND listing_status = 'Active'`, [req.body.id])
    .then(async(result) => {
        if (result !== undefined && result.rows.length === 1) {
            let saved = false;
            let reported = false;

            let savedListing, reportedListing;

            if (result.rows[0].hide_email) {
                delete result.rows[0].user_email;
            }

            if (result.rows[0].hide_phone) {
                delete result.rows[0].user_phone;
            }
            
            if (req.session.user) {
                savedListing = await db.query(`SELECT saved_listing_id FROM saved_listings WHERE saved_listing_id = $1 AND saved_by = $2`, [req.body.id, req.session.user.username]);
                reportedListing = await db.query(`SELECT report_id FROM reports WHERE reporter = $1 AND report_type = $2 AND reported_id = $3`, [req.session.user.username, 'Listing', req.body.id]);
            }

            let userRating = await db.query(`SELECT 
                CASE WHEN
                    SUM(review_rating) / COUNT(review_id) IS NULL THEN 0 ELSE SUM(review_rating) / COUNT(review_id) END
                AS rating
            FROM user_reviews LEFT JOIN user_listings ON user_listings.listing_user = user_reviews.reviewing WHERE user_listings.listing_id = $1`, [req.body.id]);

            if (savedListing && savedListing.rows.length === 1)  saved = true;

            if (reportedListing && reportedListing.rows.length === 1) reported = true;

            resp.send({status: 'success', listing: result.rows[0], saved: saved, reported: reported, rating: userRating.rows[0].rating});
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

app.post('/api/get/user/listings', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let listings;
                    let user = await client.query(`SELECT subscription_end_date, account_type FROM users WHERE username = $1`, [req.body.user]);

                    if (user.rows[0].subscription_end_date && (user.rows[0].account_type === 'Listing' || user.rows[0].account_type === 'Recruiter')) {
                        if (new Date(user.rows[0].subscription_end_date) > new Date()) {
                            listings = await client.query('SELECT listing_id, listing_title, listing_created_date, listing_renewed_date, listing_sector, listing_status, listing_price, listing_price_currency, listing_price_type, listing_purpose, listing_detail, listing_negotiable FROM user_listings WHERE listing_user = $1', [req.body.user]);
                        } else {
                            let error = new Error(`Your subscription has ended`);
                            errorObject = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errorObject;
                        }
                    } else if (user.rows[0].account_type === 'User') {
                        let error = new Error(`You're not subscribed`);
                        errorObject = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errorObject;
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', listings: listings.rows}));
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log(err, req, resp);
            });
        });
    }
});

module.exports = app;