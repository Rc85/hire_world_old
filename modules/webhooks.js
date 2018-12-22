const app = require('express').Router();
const db = require('./db');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY);
const error = require('./utils/error-handler');

app.post('/stripe-webhooks/subscription/renew', async(req, resp) => {
    let sig = req.headers['stripe-signature'];

    try {
        let event = stripe.webhooks.constructEvent(req.rawBody, sig, 'whsec_ZPKSvPn5q5VcSvcbnBGys8XVqWHoPqy6');

        if (event.data.object.paid) {
            await db.query(`UPDATE users SET subscription_end_date = subscription_end_date + interval '1 month' WHERE stripe_cust_id = $1`, [event.data.object.customer]);

            resp.json({received: true});
        }
    } catch (e) {
        error.log({name: e.name, message: e.message, origin: 'Stripe subscription renew webhook', url: req.url});
        resp.status(400).end();
    }
});

module.exports = app;