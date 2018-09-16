const app = require('express').Router();
const db = require('../db');

app.post('/api/offer/submit', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }
            
            let authorized = await client.query(`SELECT job_client FROM jobs WHERE job_id = $1`, [req.body.job_id])
            .catch(err => {
                console.log(err);
            });

            if (authorized.rows[0].job_client === req.session.user.username) {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let offer = await client.query(`INSERT INTO offers (offer_type, offer_term, completed_by, offer_price, offer_currency, offer_payment_type, offer_payment_period, offer_number_of_payments, offer_amount_type, offer_payment_1, offer_payment_2, offer_payment_3, offer_payment_4, offer_payment_5, offer_payment_6, offer_for_job, offer_confidentiality) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
                        [req.body.offerType, req.body.term, req.body.date, req.body.price, req.body.currency, req.body.paymentType, req.body.paymentPeriod, req.body.numberOfPayments, req.body.amountType, req.body.payments[0], req.body.payments[1], req.body.payments[2], req.body.payments[3], req.body.payments[4], req.body.payments[5], req.body.job_id, req.body.confidential])

                        let messageBody = `An offer has been created and is awaiting response.`

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, is_reply, message_recipient) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.body.job_id, messageBody, 'Update', true, req.body.recipient])

                        await client.query('COMMIT')
                        .then(() => {
                            resp.send({status: 'success', statusMessage: 'Offer sent', offer: offer.rows[0], message: message.rows[0]});
                        });
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    console.log(err);
                    resp.send({status: 'error', statusMessage: 'Fail to send offer'});
                });
            } else {
                done();
                resp.send({status: 'error', statusMessage: `You're not authorized`})
            }
        });
    }
});

app.post('/api/offer/edit', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }

            let authorized = await client.query(`SELECT job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

            if (authorized.rows[0].job_client === req.session.user.username) {
                (async () => {
                    try {
                        await client.query(`BEGIN`);
                        let offer = await client.query(`UPDATE offers SET offer_type = $1, offer_term = $2, completed_by = $3, offer_price = $4, offer_currency = $5, offer_payment_type = $6, offer_payment_period = $7, offer_number_of_payments = $8, offer_amount_type = $9, offer_payment_1 = $10, offer_payment_2 = $11, offer_payment_3 = $12, offer_payment_4 = $13, offer_payment_5 = $14, offer_payment_6 = $15, offer_for_job = $16, offer_confidentiality = $17, offer_modified_date = current_timestamp WHERE offer_id = $18 RETURNING *`,
                        [req.body.offerType, req.body.term, req.body.date, req.body.price, req.body.currency, req.body.paymentType, req.body.paymentPeriod, req.body.numberOfPayments, req.body.amountType, req.body.payments[0], req.body.payments[1], req.body.payments[2], req.body.payments[3], req.body.payments[4], req.body.payments[5], req.body.job_id, req.body.confidential, req.body.offer_id]);

                        let messageBody = `The offer has been updated.`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, is_reply) VALUES ($1, $2, $3, $4) RETURNING *`, [req.body.job_id, messageBody, 'Update', true]);

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
                    console.log(err);
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
            if (err) {console.log(err) };

            let authorized = await client.query(`SELECT job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

            if (authorized && authorized.rows[0].job_client === req.session.user.username) {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        await client.query(`UPDATE offers SET offer_status = 'Deleted' WHERE offer_id = $1`, [req.body.offer_id]);
                        
                        let messageBody = `The offer has been cancelled.`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_type, message_body, is_reply) VALUES ($1, $2, $3, $4) RETURNING *`,
                        [req.body.job_id, 'Warning', messageBody, true]);

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
                    console.log(err);
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
            if (err) { console.log(err); }

            let authorized = await client.query(`SELECT job_user FROM jobs WHERE job_id = $1`, [req.body.job_id]);

            if (authorized.rows[0].job_user === req.session.user.username) {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        await client.query(`UPDATE jobs SET job_stage = 'Active' WHERE job_id = $1`, [req.body.job_id]);
                        await client.query(`UPDATE offers SET offer_status = 'Accepted' WHERE offer_id = $1`, [req.body.offer_id]);

                        let messageBody = `The offer has been accepted.`;

                        await client.query(`INSERT INTO messages (message_body, belongs_to_job, message_type, is_reply) VALUES ($1, $2, $3, $4)`, [messageBody, req.body.job_id, 'Update', true]);
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
                    console.log(err);
                    resp.send({status: 'error', statusMessage: 'Fail to accept offer'});
                });
            } else {
                done();
                resp.send({status: 'error', statusMessage: `You're not authorized`});
            }
        });
    }
});


module.exports = app;