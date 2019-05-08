const app = require('express').Router();
const db = require('../db');
const validate = require('../utils/validate');
const error = require('../utils/error-handler');
const authenticate = require('../utils/auth');

/* app.post('/api/listing/create', authenticate, (req, resp) => {

        let title = req.body.listing_title.trim();

        if (validate.blankCheck.test(req.body.listing_purpose)) {
            resp.send({status: 'error', statusMessage: 'Type of business required'});
        } else if (req.body.listing_purpose !== 'Online' || req.body.listing_purpose !== 'Remote' || req.body.listing_purpose !== 'Local') {
            resp.send({status: 'error', statusMessage: 'Unrecognized type of business'});
        } else if (validate.blankCheck.test(req.body.listing_title)) {
            resp.send({status: 'error', statusMessage: 'Title cannot be blank'});
        } else if (!validate.titleCheck.test(req.body.listing_title)) {
            resp.send({status: 'error', statusMessage: 'Invalid characters in title'});
        } else if (req.body.listing_title.length > 60) {
            resp.send({status: 'error', statusMessage: 'Title too long'});
        } else if (req.body.listing_price) {
            if (!validate.priceCheck.test(req.body.listing_price)) {
                resp.send({status: 'error', statusMessage: 'Invalid price format'});
            } else if (validate.blankCheck.test(req.body.listing_price)) {
                resp.send({status: 'error', statusMessage: 'Please enter a price or 0'});
            }
        } else if (req.body.listing_price_currency) {
            if (validate.blankCheck.test(req.body.listing_price_currency)) {
                resp.send({status: 'error', statusMessage: 'Enter a currency'});
            }  else if (!validate.currencyCheck.test(req.body.listing_price_currency)) {
                resp.send({status: 'error', statusMessage: 'Unrecognized currency'});
            }
        } else if (typeof req.body.listing_negotiable !== 'boolean') {
            resp.send({status: 'error', statusMessage: 'Must either be negotiable or non-negotiable'});
        } else {
            let price = 0;

            if (req.body.listing_price) {
                price = req.body.listing_price;
            }

            db.connect((err, client, done) => {
                if (err) error.log(err, req, resp);

                (async() => {
                    try {
                        await client.query('BEGIN');
                        let user = await client.query(`SELECT account_type, user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);
                        let userListings = await client.query(`SELECT COUNT(listing_id) AS listing_count FROM user_listings WHERE listing_user = $1`, [req.session.user.username]);

                        if (user && user.rows[0].user_status === 'Active') {
                            if (user && (user.rows[0].account_type === 'Listing' && parseInt(userListings.rows[0].listing_count) < 1)) {
                                let listing = await client.query('INSERT INTO user_listings (listing_title, listing_user, listing_sector, listing_price, listing_price_type, listing_price_currency, listing_negotiable, listing_detail, listing_purpose) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [title, req.session.user.username, req.body.listing_sector, price, req.body.listing_price_type, req.body.listing_price_currency.toUpperCase(), req.body.listing_negotiable, req.body.listing_detail, req.body.listing_purpose]);

                                await client.query('COMMIT')
                                .then(() => resp.send({status: 'success', statusMessage: 'Listing created', listing: listing.rows[0]}));
                            } else if (user.rows[0].account_type === 'Listing' && parseInt(userListings.rows[0].listing_count) === 1) {
                                let error = new Error(`You can only create one listing`);
                                let errorObject = {error: error, type: 'CUSTOM', stack: error.stack}
                                throw errorObject;
                            }
                        } else if (user && user.rows[0].user_status === 'Suspend') {
                            let error = new Error(`You're temporarily banned`);
                            let errorObject = {error: error, type: 'CUSTOM', stack: error.stack}
                            throw errorObject;
                        }
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => error.log(err, req, resp));
            });
        }
}); */

app.post('/api/listing/toggle', authenticate, async(req, resp) => {
    let listing = await db.query(`SELECT listing_status FROM user_listings WHERE listing_user = $1`, [req.session.user.username]);
    let status;

    if (listing.rows.length === 1) {
        if (listing.rows[0].listing_status === 'Active') {
            status = 'Inactive';
        } else if (listing.rows[0].listing_status === 'Inactive') {
            status = 'Active';
        }

        await db.query(`UPDATE user_listings SET listing_status = $1 WHERE listing_user = $2 RETURNING listing_status`, [status, req.session.user.username])
        .then(result => {
            if (result && result.rowCount === 1) {
                resp.send({status: 'success', listing_status: result.rows[0].listing_status});
            } else {
                resp.send({status: 'error', statusMessage: 'Failed to update'});
            }
        })
        .catch(err => error.log(err, req, resp));
    } else if (listing.rows.length === 0) {
        resp.send({status: 'error', statusMessage: `You need to save your list settings`});
    }
});

app.post('/api/listing/edit', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            let title = req.body.listing_title.trim();

            if (!validate.titleCheck.test(title)) {
                resp.send({status: 'error', statusMessage: 'Invalid characters in title'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (user && user.rows[0].user_status === 'Active') {
                            let authorized = await client.query(`SELECT listing_user FROM user_listings WHERE listing_id = $1`, [req.body.listing_id]);

                            if (authorized.rows[0].listing_user === req.session.user.username) {
                                let listing = await client.query(`UPDATE user_listings SET listing_title = $1, listing_sector = $2, listing_price = $3, listing_price_currency = $4, listing_price_type = $5, listing_negotiable = $6, listing_detail = $7 WHERE listing_id = $8 RETURNING *`, [title, req.body.listing_sector, req.body.listing_price, req.body.listing_price_currency, req.body.listing_price_type, req.body.listing_negotiable, req.body.listing_detail, req.body.listing_id]);

                                await client.query('COMMIT')
                                .then(() => resp.send({status: 'success', statusMessage: 'Listing updated', listing: listing.rows[0]}));
                            } else {
                                await client.query('END');
                                resp.send({status: 'error', statusMessage: `You're not authorized`});
                            }
                        } else if (user && user.rows[0].user_status === 'Suspend') {
                            let error = new Error(`You're temporarily banned`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errObj;
                        }
                    } catch (e) {
                        await client.query(`ROLLBACK`);
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => error.log(err, req, resp));
            }
        });
});

app.post('/api/listing/renew', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT listing_user, listing_renewed_date FROM user_listings WHERE listing_user = $1 AND listing_status != 'Deleted'`, [req.session.user.username]);
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                    if (user && user.rows[0].user_status === 'Active') {
                        let now = new Date();
                        let lastRenew = new Date(authorized.rows[0].listing_renewed_date);

                        if (now - lastRenew >= 8.64e+7) {
                            if (authorized.rows[0].listing_user === req.session.user.username) {
                                let listing = await client.query(`UPDATE user_listings SET listing_renewed_date = current_timestamp WHERE listing_user = $1 RETURNING listing_renewed_date`, [req.session.user.username]);

                                await client.query('COMMIT')
                                .then(() => resp.send({status: 'success', statusMessage: 'Listing renewed', renewedDate: listing.rows[0].listing_renewed_date}));
                            } else {
                                let error = new Error(`You're not authorized`);
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                throw errObj;
                            }
                        } else {
                            let error = new Error(`You can only renew once every 24 hours`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};;
                            throw errObj;
                        }
                    } else if (user && user.rows[0].user_status === 'Suspend') {
                        let error = new Error(`You're temporarily banned`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};;
                        throw errObj;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

app.post('/api/listing/save', authenticate, async(req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        if (validate.blankCheck.test(req.body.listing_title)) {
            resp.send({status: 'error', statusMessage: 'Title cannot be blank'});
        } else if (typeof req.body.listing_online !== 'boolean' || typeof req.body.listing_remote !== 'boolean' || typeof req.body.listing_local !== 'boolean') {
            resp.send({status: 'error', statusMessage: 'That business type is not allowed'});
        } else if (!validate.titleCheck.test(req.body.listing_title)) {
            resp.send({status: 'error', statusMessage: 'Invalid characters in title'});
        } else if (req.body.listing_price_type !== 'To Be Discussed' && !validate.priceCheck.test(req.body.listing_price)) {
            resp.send({status: 'error', statusMessage: 'Invalid price format'});
        } else if (req.body.listing_price_type !== 'To Be Discussed' && validate.blankCheck.test(req.body.listing_price_currency)) {
            resp.send({status: 'error', statusMessage: 'Enter a currency'});
        } else if (typeof req.body.listing_negotiable !== 'boolean') {
            resp.send({status: 'error', statusMessage: 'Choose either negotiable or non-negotiable'});
        } else if (validate.blankCheck.test(req.body.listing_detail)) {
            resp.send({status: 'error', statusMessage: 'Please describe your business or service'});
        } else {
            let price = 0;

            if (req.body.listing_price) {
                price = req.body.listing_price;
            }

            (async() => {
                try {
                    await client.query('BEGIN');

                    let queryString;

                    let userListing = await client.query(`SELECT listing_id FROM user_listings WHERE listing_user = $1 AND listing_status != 'Deleted'`, [req.session.user.username]);

                    // If user have a listing, update it
                    if (userListing.rows.length === 1) {
                        queryString = `UPDATE user_listings SET listing_title = $1, listing_sector = $2, listing_price = $3, listing_price_type = $4, listing_price_currency = $5, listing_negotiable = $6, listing_detail = $7, listing_remote = $9, listing_local = $10, listing_status = $11, listing_online = $12 WHERE listing_user = $8 RETURNING *`;
                    // Else create it
                    } else if (userListing.rows.length === 0) {
                        queryString = 'INSERT INTO user_listings (listing_title, listing_sector, listing_price, listing_price_type, listing_price_currency, listing_negotiable, listing_detail, listing_user, listing_remote, listing_local, listing_status, listing_online) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
                    }

                    let listing = await client.query(queryString, [req.body.listing_title, req.body.listing_sector, price, req.body.listing_price_type, req.body.listing_price_currency.toUpperCase(), req.body.listing_negotiable, req.body.listing_detail, req.session.user.username, req.body.listing_remote, req.body.listing_local, 'Active', req.body.listing_online]);

                    if (listing.rows.length === 1) {
                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'List settings saved', listing: listing.rows[0]}));
                    } else if (listing.rows.length === 0) {
                        let error = new Error(`Fail to save`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }
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
        }
    });
});

app.post('/api/filter/listings', async(req, resp) => {
    // Never build/concatenate query string from req.body
    let whereArray = [`listing_sector = $1`];
    let params = [req.body.sector]

    if (req.body.title && validate.searchUserTitleCheck.test(req.body.title)) {
        params.push(`%${req.body.title}%`);

        let index = params.length;

        whereArray.push(`user_title ILIKE $${index}`);
    }

    if (req.body.rating !== 'Any') {
        params.push(req.body.rating);
        let index = params.length;
        whereArray.push(`rating = $${index}`);
    }

    if (req.body.price) {
        params.push(req.body.price);
        let index = params.length;

        let priceOperator, priceType;

        let priceTypeOperator = '=';

        // Building operators to prevent SQL injection
        if (req.body.priceOperator === '=') {
            priceOperator = '=';
        } else if (req.body.priceOperator === '>') {
            priceOperator = '>';
        } else if (req.body.priceOperator === '<') {
            priceOperator = '<';
        }

        // Building operators to prevent SQL injection
        if (req.body.priceType === 'Hour') {
            priceType = 'Hourly';
        } else if (req.body.priceType === 'Bi-weekly') {
            priceType = 'Bi-weekly';
        } else if (req.body.priceType === 'Monthly') {
            priceType = 'Monthly';
        } else if (req.body.priceType === 'Per Delivery') {
            priceType = 'Per Delivery';
        } else if (req.body.priceType === 'One Time Payment') {
            priceType = 'One Time Payment';
        } else if (!req.body.priceType) {
            priceTypeOperator = 'SIMILAR TO';
            priceType = '(Hourly|Bi-weekly|Monthly|Per Delivery|One Time Payment)';
        }

        whereArray.push(`listing_price ${priceOperator} $${index}`);
        whereArray.push(`listing_price_type ${priceTypeOperator} '${priceType}'`);
    }

    if (req.body.completedJobs) {
        let operator;

        // Building operators to prevent SQL injection
        if (req.body.completedJobsOp === '=') {
            operator = '=';
        } else if (req.body.completedJobsOp === '>=') {
            operator = '>=';
        } else if (req.body.completedJobsOp === '>') {
            operator = '>';
        } else if (req.body.completedJobsOp === '<=') {
            operator = '<=';
        } else if (req.body.completedJobsOp === '<') {
            operator = '<';
        }

        params.push(req.body.completedJobs);

        let index = params.length;

        whereArray.push(`job_complete ${operator} $${index}`);
    }

    if (req.body.noAbandonedJobs) {
        params.push('0');

        let index = params.length;

        whereArray.push(`(job_abandoned = $${index} OR job_abandoned IS NULL)`);
    }

    if (req.body.country) {
        params.push(req.body.country);

        let index = params.length;

        whereArray.push(`user_country = $${index}`);
    }

    if (req.body.region) {
        params.push(req.body.region);

        let index = params.length;

        whereArray.push(`user_region = $${index}`);
    }

    if (req.body.city) {
        params.push(req.body.city);

        let index = params.length;

        whereArray.push(`user_city = $${index}`);
    }

    let queryString = `SELECT user_listings.*, jobs.job_complete, jobs.job_abandoned, user_profiles.*, user_reviews.rating, user_reviews.review_count FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN
        (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating, reviewing, COUNT(review_id) AS review_count FROM user_reviews
        WHERE review_rating IS NOT NULL 
        GROUP BY reviewing) AS user_reviews ON user_reviews.reviewing = user_listings.listing_user
	LEFT JOIN
        (SELECT job_user,
            (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_status = 'Completed'),
            (SELECT COUNT(job_id) AS job_abandoned FROM jobs WHERE job_status = 'Abandoned')
        FROM jobs LIMIT 1) AS jobs ON jobs.job_user = user_listings.listing_user
    WHERE listing_status = 'Active'
    AND ${whereArray.join(' AND ')}
    ORDER BY listing_renewed_date DESC, listing_id`;

    let totalListings = await db.query(`SELECT COUNT(listing_id) AS count FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN
        (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating, reviewing, COUNT(review_id) AS review_count FROM user_reviews
        WHERE review_rating IS NOT NULL 
        GROUP BY reviewing) AS user_reviews ON user_reviews.reviewing = user_listings.listing_user
	LEFT JOIN
        (SELECT job_user,
            (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_status = 'Completed'),
            (SELECT COUNT(job_id) AS job_abandoned FROM jobs WHERE job_status = 'Abandoned')
        FROM jobs LIMIT 1) AS jobs ON jobs.job_user = user_listings.listing_user
    WHERE ${whereArray.join(' AND ')}`, params);

    await db.query(queryString, params)
    .then(result => {
        if (result) {
            for (let row of result.rows) {
                if (!row.job_complete) {
                    row.job_complete = 0;
                }
            }

            resp.send({status: 'success', listings: result.rows, totalListings: totalListings.rows[0].count});
        }
    })
    .catch(err => error.log(err, req, resp));
});

module.exports = app;