const app = require('express').Router();
const db = require('./db');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const util = require('util');
const error = require('./utils/error-handler');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

stripe.setApiVersion('2019-02-19');

app.post('/stripe-webhooks/scription/notification', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_SUBSCRIPTION_REMINDER_WEBHOOK_KEY);
    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created]);

    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id]);
            let user = await db.query(`SELECT user_email FROM users WHERE stripe_id = $1`, [event.data.object.customer]);

            let renewalDate = moment(event.data.object.next_payment_attempt * 1000).format('MM-DD-YYYY');

            let message = {
                to: user.rows[0].user_email,
                from: 'admin@hireworld.ca',
                subject: 'Notice: Subscription Renewing Soon',
                templateId: 'd-f9a740ac97e34c759bf9d321ad47a12f',
                dynamicTemplateData: {
                    config_url: `${process.env.SITE_URL}/dashboard/settings/subscription`,
                    renew_date: renewalDate
                },
                trackingSettings: {
                    clickTracking: {
                        enable: false
                    }
                }
            }

            sgMail.send(message);

            resp.json({received: true});
            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id]);
        } catch (e) {
            error.log(err, req);
            resp.status(400).end();
        }
    }
})

app.post('/stripe-webhooks/subscription/renew', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_RENEW_WEBHOOK_KEY);
    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created]);

    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id]);
            let user = await db.query(`SELECT username FROM users WHERE stripe_id = $1`, [event.data.object.customer]);

            if (event.type === 'invoice.payment_succeeded') {
                await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Subscription renewed', user.rows[0].username, 'Subscription']);
                await db.query(`UPDATE users SET subscription_end_date = subscription_end_date + interval '1 month' WHERE stripe_id = $1`, [event.data.object.customer]);
            } else if (event.type === 'invoice.payment_failed') {
                await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Failed to renew subscription', user.rows[0].username, 'Subscription']);

                let message = {
                    to: user.rows[0].user_email,
                    from: 'admin@hireworld.ca',
                    subject: 'Notice: Subscription Renewing Soon',
                    templateId: 'd-f9a740ac97e34c759bf9d321ad47a12f',
                    dynamicTemplateData: {
                        config_url: `${process.env.SITE_URL}/dashboard/settings/subscription`,
                        renew_date: renewalDate
                    },
                    trackingSettings: {
                        clickTracking: {
                            enable: false
                        }
                    }
                }
        
                sgMail.send(message);
            }

            resp.json({received: true});
            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id]);
        } catch (e) {
            error.log(err, req);
            resp.status(400).end();
        }
    }
});

app.post('/stripe-webhooks/link_work', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_CONNECTED_WEBHOOK_KEY);
    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created]);

    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id]);
            let user = await db.query(`SELECT username FROM users WHERE link_work_id = $1`, [event.account]);

            if (event.type === 'person.updated') {    
                if (event.data.object.verification.status === 'verified') {
                    await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `Your Link Work account has been verified`, 'Update']);
                    await db.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `Link Work account verified`, 'Link Work']);
                }
            }

            await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `There is an update on your Link Work account`, 'Update']);

            resp.json({received: true});
            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id]);
        } catch (e) {
            error.log(err, req);
            resp.status(400).end();
        }
    }
});

app.post('/stripe-webhooks/payout', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_PAYOUT_WEBHOOK_KEY);
    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created]);

    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id]);

            if (event.type === 'payout.failed') {
                await db.query(`UPDATE job_milestones SET payout_fail_code = $1, payout_fail_message = $2, payout_status = 'failed' WHERE payout_id = $3`, [event.data.object.failure_code, event.data.object.failure_message, event.data.object.id]);
            } else if (event.type === 'payout.paid') {
                await db.query(`UPDATE job_milestones SET payout_status = 'paid' WHERE payout_id = $1`, [event.data.object.id]);
            } else if (event.type === 'payout.updated') {
                await db.query(`UPDATE job_milestones SET payout_status = $1 WHERE payout_id = $2`, [event.data.object.status, event.data.object.id]);
            } else if (event.type === 'payout.canceled') {
                await db.query(`UPDATE job_milestones SET payout_status = 'canceled' WHERE payout_id = $1`, [event.data.object.id]);
            }

            resp.json({received: true});
            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id]);
        } catch (e) {
            error.log(err, req);
            resp.status(400).end();
        }
    }
});

module.exports = app;