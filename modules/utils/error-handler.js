const db = require('../db');
const sa = require('./sa');

module.exports = {
    log: async (err, req, resp, url, callback) => {
        console.log(err);
        
        let message = 'An error occurred';
        let status = 'error';

        if (err.code === '23505') {
            if (err.constraint === 'unique_email') {
                message = 'Email already taken';
            } else if (err.constraint === 'unique_username') {
                message = 'Username already taken';
            }
        } else if (err.code === '23502') {
            message = 'All fields are required';
        }

        if (err.type === 'CUSTOM') {
            message = err.error.message;
        } else {
            await db.query(`INSERT INTO error_log (error, error_url) VALUES ($1, $2) ON CONFLICT (error) DO UPDATE SET error_occurrence = error_log.error_occurrence + 1`, [err.stack, url ? url : req.url])
            .catch(err => error.log(err, req, resp));

            if (err.type === 'StripeInvalidRequestError' || err.type === 'validation_error') {
                message = err.message;
            }

            if (err.type === 'StripeCardError' && err.code === 'card_declined') {
                message = err.message;

                if (err.raw.decline_code === 'fraudulent') {
                    await sa.create('Subscription', 'Possible fraud reported by Stripe', req.session.user.username, 5, err.raw.charge);
                }
            }
        }

        if (err.status) {
            status = err.status;
        }

        if (resp) {
            resp.send({status: status, statusMessage: message});
        } else if (callback) {
            callback(err);
        }
    }
}