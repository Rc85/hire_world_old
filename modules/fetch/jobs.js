const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY);

app.post('/api/job/accounts/fetch', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query('SELECT connected_id FROM users WHERE username = $1', [req.session.user.username]);

        if (user && user.rows[0].connected_id) {
            await stripe.accounts.retrieve(user.rows[0].connected_id)
            .then(account => {
                resp.send({status: 'success', account: account});
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'success', account: {}});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;