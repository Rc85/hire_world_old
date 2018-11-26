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
                        let user = await client.query(`SELECT account_type FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (user && (user.rows[0].account_type === 'Listing' || user.rows[0].account_type === 'Business')) {
                            let listing = await client.query('INSERT INTO user_listings (listing_title, listing_user, listing_sector, listing_price, listing_price_type, listing_price_currency, listing_negotiable, listing_detail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [title, req.session.user.username, req.body.listing_sector, parseInt(req.body.listing_price), req.body.listing_price_type, req.body.listing_price_currency.toUpperCase(), req.body.listing_negotiable, req.body.listing_detail]);

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', listing: listing.rows[0]}));
                        } else {
                            let error = new Error(`You're not subscribed to a monthly plan`);
                            error.type = 'user_defined';
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

                    if (err.type === 'user_defined') {
                        message = `You're not subscribed to a monthly plan`;
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
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let value = await client.query(`SELECT listing_status FROM user_listings WHERE listing_id = $1`, [req.body.listing_id]);

                    let newValue;

                    if (value.rows[0].listing_status === 'Active') {
                        newValue = 'Inactive';
                    } else if (value.rows[0].listing_status === 'Inactive') {
                        newValue = 'Active';
                    }

                    let status = await client.query(`UPDATE user_listings SET listing_status = $1 WHERE listing_id =$2 RETURNING listing_status`, [newValue, req.body.listing_id]);

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', listing_status: status.rows[0].listing_status}));
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

                        let authorized = await client.query(`SELECT listing_user FROM user_listings WHERE listing_id = $1`, [req.body.listing_id]);

                        if (authorized.rows[0].listing_user === req.session.user.username) {
                            let listing = await client.query(`UPDATE user_listings SET listing_title = $1, listing_sector = $2, listing_price = $3, listing_price_currency = $4, listing_price_type = $5, listing_negotiable = $6, listing_detail = $7 WHERE listing_id = $8 RETURNING *`, [title, req.body.listing_sector, req.body.listing_price, req.body.listing_price_currency, req.body.listing_price_type, req.body.listing_negotiable, req.body.listing_detail, req.body.listing_id]);

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Listing updated', listing: listing.rows[0]}));
                        } else {
                            await client.query('END');
                            resp.send({status: 'error', statusMessage: `You're not authorized`});
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
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
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

                    let now = new Date();
                    let lastRenew = new Date(authorized.rows[0].listing_renewed_date);

                    if (now - lastRenew >= 8.64e+7) {
                        if (authorized.rows[0].listing_user === req.session.user.username) {
                            let listing = await client.query(`UPDATE user_listings SET listing_renewed_date = current_timestamp WHERE listing_id = $1 RETURNING listing_renewed_date`, [req.body.listing_id]);

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Listing renewed', renewedDate: listing.rows[0].listing_renewed_date}));
                        } else {
                            let error = new Error(`You're not authorized`);
                            error.type = 'user_defined';
                            throw error;
                        }
                    } else {
                        let error = new Error(`You can only renew once every 24 hours`);
                        error.type = 'user_defined';
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

                if (err.type === 'user_defined') {
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

module.exports = app;