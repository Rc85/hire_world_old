const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/offer/submit', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'}); }

            (async() => {
                try {
                    let authorized = await client.query(`SELECT job_client, job_user, job_listing_id FROM jobs WHERE job_id = $1`, [req.body.job_id])

                    let negotiable = await client.query(`SELECT * FROM user_listings WHERE listing_id = $1`, [authorized.rows[0].job_listing_id]);

                    let offerType, term, date, price, currency, paymentType, paymentPeriod, numberOfPayments, amountType, payments, confidential;

                    if (authorized.rows[0].job_client === req.session.user.username) {
                        if (!negotiable.rows[0].listing_negotiable && req.body.type === 'offer') {
                            resp.send({status: 'error', statusMessage: `Offer not accepted, refresh and try again`});
                        } else if (negotiable.rows[0].listing_negotiable && req.body.type === 'hire') {
                            resp.send({status: 'error', statusMessage: 'Offer are accepted, refresh and try again'});
                        } else if ((negotiable.rows[0].listing_negotiable && req.body.type === 'offer') || !negotiable.rows[0].listing_negotiable && req.body.type === 'hire') {
                            if (negotiable.rows[0].listing_negotiable) {
                                offerType = req.body.offerType;
                                term = req.body.term;
                                date = req.body.date;
                                price = req.body.price;
                                currency = req.body.currency;
                                paymentType = req.body.paymentType;
                                paymentPeriod = req.body.paymentPeriod;
                                numberOfPayments = req.body.numberOfPayments;
                                amountType = req.body.amountType;
                                payments = req.body.payments;
                                confidential = req.body.confidential;
                            } else if (!negotiable.rows[0].listing_negotiable) {
                                offerType = 'User Determined';
                                price = negotiable.rows[0].listing_price;
                                currency = negotiable.rows[0].listing_price_currency;
                                paymentType = negotiable.rows[0].listing_price_type;
                                payments = [null, null, null, null, null, null];
                            }

                            await client.query('BEGIN');
        
                            let offer = await client.query(`INSERT INTO offers (offer_type, offer_term, completed_by, offer_price, offer_currency, offer_payment_type, offer_payment_period, offer_number_of_payments, offer_amount_type, offer_payment_1, offer_payment_2, offer_payment_3, offer_payment_4, offer_payment_5, offer_payment_6, offer_for_job, offer_confidentiality) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
                            [offerType, term, date, price, currency, paymentType, paymentPeriod, numberOfPayments, amountType, payments[0], payments[1], payments[2], payments[3], payments[4], payments[5], req.body.job_id, confidential])
        
                            let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.body.job_id, `An offer has been sent to the other party.`, 'Update', true, req.session.user.username, 'System']);

                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `You received an offer from the other party.`, 'Update', true, authorized.rows[0].job_user, 'System']);
        
                            await client.query('COMMIT')
                            .then(() => {
                                resp.send({status: 'success', statusMessage: 'Offer sent', offer: offer.rows[0], message: message.rows[0]});
                            });
                        }
                    } else {
                        let error = new Error(`You're not authorized`);
                        error.type = 'user_defined';
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
                let message = 'Fail to send offer';

                if (err.type === 'user_defined') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    }
});

app.post('/api/offer/edit', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'}); }

            let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

            if (authorized.rows[0].job_client === req.session.user.username) {
                (async () => {
                    try {
                        await client.query(`BEGIN`);
                        let offer = await client.query(`UPDATE offers SET offer_type = $1, offer_term = $2, completed_by = $3, offer_price = $4, offer_currency = $5, offer_payment_type = $6, offer_payment_period = $7, offer_number_of_payments = $8, offer_amount_type = $9, offer_payment_1 = $10, offer_payment_2 = $11, offer_payment_3 = $12, offer_payment_4 = $13, offer_payment_5 = $14, offer_payment_6 = $15, offer_for_job = $16, offer_confidentiality = $17, offer_modified_date = current_timestamp WHERE offer_id = $18 RETURNING *`,
                        [req.body.offerType, req.body.term, req.body.date, req.body.price, req.body.currency, req.body.paymentType, req.body.paymentPeriod, req.body.numberOfPayments, req.body.amountType, req.body.payments[0], req.body.payments[1], req.body.payments[2], req.body.payments[3], req.body.payments[4], req.body.payments[5], req.body.job_id, req.body.confidential, req.body.offer_id]);

                        let messageBody = `The offer has been updated.`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.body.job_id, messageBody, 'Update', true, req.session.user.username, 'System']);

                        await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, messageBody, 'Update', true, authorized.rows[0].job_user, 'System'])

                        await client.query(`COMMIT`)
                        .then(() => {
                            resp.send({status: 'success', statusMessage: 'Offer updated', message: message.rows[0], offer: offer.rows[0]});
                        });
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    resp.send({status: 'error', statusMessage: 'Fail to update offer'});
                })
            } else {
                done();
                resp.send({status: 'error', statusMessage: `You're not authorized`});
            }
        });
    }
});

app.post('/api/offer/delete', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});;

            let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

            if (authorized && authorized.rows[0].job_client === req.session.user.username) {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        await client.query(`UPDATE offers SET offer_status = 'Deleted' WHERE offer_id = $1`, [req.body.offer_id]);

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_type, message_body, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                        [req.body.job_id, 'Warning', `You revoked your offer.`, true, req.session.user.username, 'System']);
                        
                        await client.query(`INSERT INTO messages (belongs_to_job, message_type, message_body, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, 'Warning', `The other party revoked the offer.`, true, authorized.rows[0].job_user, 'System']);
                        await client.query(`UPDATE messages SET message_status = 'Deleted' WHERE message_body LIKE '%The client has sent you an offer%' AND message_type = 'Confirmation'`);

                        await client.query(`COMMIT`)
                        .then(() => {
                            resp.send({status: 'success', statusMessage: 'The offer has been deleted', message: message});
                        });
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    resp.send({status: 'error', statusMessage: 'Fail to delete offer'});
                });
            } else {
                done();
                resp.send({status: 'error', statusMessage: `You're not authorized`});
            }
        });
    }
});

app.post('/api/offer/accept', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'}); }

            let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

            if (authorized.rows[0].job_user === req.session.user.username) {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        await client.query(`UPDATE jobs SET job_stage = 'Active' WHERE job_id = $1`, [req.body.job_id]);
                        await client.query(`UPDATE offers SET offer_status = 'Accepted' WHERE offer_id = $1`, [req.body.offer_id]);

                        await client.query(`INSERT INTO messages (message_body, belongs_to_job, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [`You accepted the offer.`, req.body.job_id, 'Update', true, req.session.user.username, 'System']);

                        await client.query(`INSERT INTO messages (message_body, belongs_to_job, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [`Your offer has been accepted.`, req.body.job_id, 'Update', true, authorized.rows[0].job_client, 'System']);
                        await client.query(`COMMIT`)
                        .then(() => {
                            resp.send({status: 'offer accepted'});
                        });
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    resp.send({status: 'error', statusMessage: 'Fail to accept offer'});
                });
            } else {
                done();
                resp.send({status: 'error', statusMessage: `You're not authorized`});
            }
        });
    }
});

app.post('/api/offer/decline', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

            if (authorized.rows[0].job_user === req.session.user.username) {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        await client.query(`UPDATE offers SET offer_status = 'Declined' WHERE offer_id = $1`, [req.body.offer_id]);

                        let message = await client.query(`INSERT INTO messages (message_body, belongs_to_job, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [`You declined the offer`, req.body.job_id, 'Update', true, req.session.user.username, 'System']);

                        await client.query('INSERT INTO messages (message_body, belongs_to_job, message_type, is_reply, message_recipient, message_sender) VALUES ($1, $2, $3, $4, $5, $6)', [`The other party declined your offer`, req.body.job_id, 'Warning', true, authorized.rows[0].job_client, 'System']);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', message: message.rows[0]}));
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
            } else {
                done();
                resp.send({status: 'error', statusMessage: `You're not authorized`});
            }
        });
    }
});


module.exports = app;