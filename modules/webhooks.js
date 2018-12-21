const app = require('express').Router();
const db = require('./db');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY);

app.post('/api/subscription/renew', async(req, resp) => {
    let sig = req.headers['stripe-signature'];

    try {
        let event = stripe.webhooks.constructEvent(req.body, sig, process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_RENEW_WEBHOOK_KEY : process.env.STRIPE_RENEW_WEBHOOK_KEY);

        if (event.data.object.paid) {
            resp.json({received: true});

            await db.query(`UPDATE users SET subscription_end_date = subscription_end_date + interval '1 month' WHERE stripe_cust_id = $1`, [event.data.object.customer]);
        }
    } catch (e) {
        resp.status(400).end();
    }
});

module.exports = app;