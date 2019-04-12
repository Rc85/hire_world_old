const app = require('express').Router();
const db = require('./db');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const util = require('util');
const error = require('./utils/error-handler');

stripe.setApiVersion('2019-02-19');

app.post('/stripe-webhooks/subscription/renew', async(req, resp) => {
    let sig = req.headers['stripe-signature'];

    try {
        let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_RENEW_WEBHOOK_KEY);

        let user = await db.query(`SELECT username FROM users WHERE stripe_id = $1`, [event.data.object.customer]);

        if (event.data.object.paid) {
            await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Subscription renewed', user.rows[0].username, 'Subscription']);
            await db.query(`UPDATE users SET subscription_end_date = subscription_end_date + interval '1 month' WHERE stripe_id = $1`, [event.data.object.customer]);
        } else {
            await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Failed to renew subscription', user.rows[0].username, 'Subscription']);
        }

        resp.json({received: true});
    } catch (e) {
        console.log(err);
        resp.status(400).end();
    }
});

app.post('/stripe-webhooks/connected', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_CONNECTED_WEBHOOK_KEY);

    let user = await db.query(`SELECT username FROM users WHERE connected_id = $1`, [event.account]);

    await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `Your connected account was updated`, 'Account']);

    resp.json({received: true})
});

module.exports = app;