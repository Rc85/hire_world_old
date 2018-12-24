const app = require('express').Router();
const db = require('../db');
const validate = require('../utils/validate');
const error = require('../utils/error-handler');

app.post('/api/listing/create', (req, resp) => {
    if (req.session.user) {
        let title = req.body.listing_title.trim();

        if (!validate.titleCheck.test(title)) {
            resp.send({status: 'error', statusMessage: 'Invalid characters in title'});
        } else {
            db.connect((err, client, done) => {
                if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

                (async() => {
                    try {
                        await client.query('BEGIN');
                        let user = await client.query(`SELECT account_type, user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);
                        console.log(user.rows[0])

                        if (user && user.rows[0].user_status === 'Active') {
                            if (user && (user.rows[0].account_type === 'Listing' || user.rows[0].account_type === 'Business')) {
                                let listing = await client.query('INSERT INTO user_listings (listing_title, listing_user, listing_sector, listing_price, listing_price_type, listing_price_currency, listing_negotiable, listing_detail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [title, req.session.user.username, req.body.listing_sector, parseInt(req.body.listing_price), req.body.listing_price_type, req.body.listing_price_currency.toUpperCase(), req.body.listing_negotiable, req.body.listing_detail]);

                                await client.query('COMMIT')
                                .then(() => resp.send({status: 'success', listing: listing.rows[0]}));
                            } else {
                                let error = new Error(`You're not subscribed to a monthly plan`);
                                error.type = 'CUSTOM';
                                throw error;
                            }
                        } else {
                            let error = new Error(`You're temporarily banned`);
                            error.type = 'CUSTOM';
                            throw error;
                        }
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    let message = `An error occurred`;

                    if (err.type === 'CUSTOM') {
                        message = err.message;
                    }

                    resp.send({status: 'error', statusMessage: message});
                });
            });
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/listing/toggle', (req, resp) => {
    if (req.session.user) {
        let price = 0;

        if (req.body.listing_price) {
            price = req.body.listing_price;
        }

        if (req.body.listing_purpose !== 'Hiring' && req.body.listing_purpose !== 'For Hire') {
            resp.send({status: 'error', statusMessage: 'Are you looking to hire or for work?'});
        } else if (validate.blankCheck.test(req.body.listing_title)) {
            resp.send({status: 'error', statusMessage: 'Title required'});
        } else if (validate.blankCheck.test(req.body.listing_sector)) {
            resp.send({status: 'error', statusMessage: 'Sector is required'});
        } else if (validate.blankCheck.test(req.body.listing_price_currency)) {
            resp.send({status: 'error', statusMessage: 'Please set a currency for your price'});
        } else {
            db.connect((err, client, done) => {
                if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

                (async() => {
                    try {
                        await client.query('BEGIN');

                        let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (user && user.rows[0].user_status === 'Active') {
                            let listed = await client.query(`SELECT * FROM user_listings WHERE listing_user = $1`, [req.session.user.username]);

                            let newValue, listing;

                            if (listed && listed.rows.length === 1) {
                                if (listed.rows[0].listing_status === 'Active') {
                                    newValue = 'Inactive';
                                } else if (listed.rows[0].listing_status === 'Inactive') {
                                    newValue = 'Active';
                                }

                                listing = await client.query(`UPDATE user_listings SET listing_title = $9, listing_sector = $3, listing_price = $4, listing_price_type = $5, listing_price_currency = $6, listing_negotiable = $7, listing_detail = $8, listing_status = $1, listing_purpose = $10 WHERE listing_id = $2 RETURNING *`, [newValue, listed.rows[0].listing_id, req.body.listing_sector, price, req.body.listing_price_type, req.body.listing_price_currency, req.body.listing_negotiable, req.body.listing_detail, req.body.listing_title, req.body.listing_purpose]);
                            } else if (listed && listed.rows.length === 0) {
                                let listingEndDate = await client.query(`SELECT subscription_end_date FROM users WHERE username = $1`, [req.session.user.username]);

                                listing = await client.query(`INSERT INTO user_listings (listing_title, listing_user, listing_sector, listing_price, listing_price_type, listing_price_currency, listing_negotiable, listing_detail, listing_end_date, listing_purpose) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [req.body.listing_title, req.session.user.username, req.body.listing_sector, price, req.body.listing_price_type, req.body.listing_price_currency, req.body.listing_negotiable, req.body.listing_detail, listingEndDate.rows[0].subscription_end_date, req.body.listing_purpose]);
                            }

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', listing: listing.rows[0]}));
                        } else if (user && user.rows[0].user_status === 'Suspend') {
                            let error = new Error(`You're temporarily banned`);
                            error.type = 'CUSTOM';
                            throw error;
                        }
                    } catch (e) {
                        await client.query('ROLLBACK');
                    throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    let message = 'An error occurred';

                    if (err.type === 'CUSTOM') {
                        message = err.message;
                    }

                    resp.send({status: 'error', statusMessage: message});
                });
            });
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/listing/edit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

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
                            error.type = 'CUSTOM';
                            throw error;
                        }
                    } catch (e) {
                        await client.query(`ROLLBACK`);
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});

                    let message = 'An error occurred';

                    if (err.type === 'CUSTOM') {
                        message = err.message;
                    }

                    resp.send({status: 'error', statusMessage: message});
                });
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/listing/renew', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT listing_user, listing_renewed_date FROM user_listings WHERE listing_id = $1`, [req.body.listing_id]);
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                    if (user && user.rows[0].user_status === 'Active') {
                        let now = new Date();
                        let lastRenew = new Date(authorized.rows[0].listing_renewed_date);

                        if (now - lastRenew >= 8.64e+7) {
                            if (authorized.rows[0].listing_user === req.session.user.username) {
                                let listing = await client.query(`UPDATE user_listings SET listing_renewed_date = current_timestamp WHERE listing_id = $1 RETURNING listing_renewed_date`, [req.body.listing_id]);

                                await client.query('COMMIT')
                                .then(() => resp.send({status: 'success', statusMessage: 'Listing renewed', renewedDate: listing.rows[0].listing_renewed_date}));
                            } else {
                                let error = new Error(`You're not authorized`);
                                error.type = 'CUSTOM';
                                throw error;
                            }
                        } else {
                            let error = new Error(`You can only renew once every 24 hours`);
                            error.type = 'CUSTOM';
                            throw error;
                        }
                    } else if (user && user.rows[0].user_status === 'Suspend') {
                        let error = new Error(`You're temporarily banned`);
                        error.type = 'CUSTOM';
                        throw error;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    }
});

app.post('/api/listing/save', (req, resp) => {
    if (req.session.user) {
        db.query(`INSERT INTO saved_listings (saved_listing_id, saved_listing_title, saved_by) VALUES ($1, $2, $3)`, [req.body.listing_id, req.body.listing_title, req.session.user.username])
        .then(result => {
            if (result && result.rowCount === 1) {
                resp.send({status: 'success', statusMessage: 'Listing saved'});
            }
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    }
});

app.post('/api/saved_listings/unsave', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    await client.query(`DELETE FROM saved_listings WHERE saved_id = ANY($1) AND saved_by = $2`, [req.body.listings, req.session.user.username]);

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', statusMessage: 'Saved listing(s) deleted'}));
                } catch (e) {
                    await client.query('ROLLBACK');
                throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    }
});

app.post('/api/filter/listings', async(req, resp) => {
    let whereArray = [`AND listing_sector = $1`];
    let params = [req.body.sector]

    if (req.body.title) {
        params.push(`%${req.body.title}%`);

        let index = params.length;

        whereArray.push(`AND user_title ILIKE $${index}`);
    }

    if (req.body.rating !== 'Any') {
        params.push(req.body.rating);
        let index = params.length;
        whereArray.push(`AND rating = $${index}`);
    }

    if (req.body.price) {
        whereArray.push(`AND listing_price ${req.body.priceOperator} ${req.body.price}`);
        whereArray.push(`AND listing_price_type = '${req.body.priceType}'`);
    }

    console.log(req.body);
    if (req.body.completedJobs) {
        let operator;

        // Hard coding operators to prevent SQL injection
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

        whereArray.push(`AND job_complete ${operator} $${index}`);
    }

    if (req.body.noAbandonedJobs) {
        params.push('0');

        let index = params.length;

        whereArray.push(`AND (job_abandoned = $${index} OR job_abandoned IS NULL)`);
    }

    if (req.body.country) {
        params.push(req.body.country);

        let index = params.length;

        whereArray.push(`AND user_country = $${index}`);
    }

    if (req.body.region) {
        params.push(req.body.region);

        let index = params.length;

        whereArray.push(`AND user_region = $${index}`);
    }

    if (req.body.city) {
        params.push(req.body.city);

        let index = params.length;

        whereArray.push(`AND user_city = $${index}`);
    }

    let queryString = `SELECT user_listings.*, jobs.job_complete, jobs.job_abandoned, user_profiles.user_title, user_reviews.rating FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN
        (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating, reviewing FROM user_reviews
        WHERE review_rating IS NOT NULL 
        GROUP BY reviewing) AS user_reviews ON user_reviews.reviewing = user_listings.listing_user
	LEFT JOIN
        (SELECT job_user,
            (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_status = 'Completed'),
            (SELECT COUNT(job_id) AS job_abandoned FROM jobs WHERE job_status = 'Abandoned')
        FROM jobs) AS jobs ON jobs.job_user = user_listings.listing_user
    WHERE listing_status = 'Active'
    ${whereArray.join(' ')}
    ORDER BY listing_renewed_date DESC, listing_id`;

    await db.query(queryString, params)
    .then(result => {
        if (result) {
            for (let row of result.rows) {
                if (!row.job_complete) {
                    row.job_complete = 0;
                }
            }

            console.log(result.rows);

            resp.send({status: 'success', listings: result.rows});
        }
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;