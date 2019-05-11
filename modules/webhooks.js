const app = require('express').Router();
const db = require('./db');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const util = require('util');
const error = require('./utils/error-handler');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const moneyFormatter = require('./utils/money-formatter');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/stripe-webhooks/subscription/notification', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_SUBSCRIPTION_REMINDER_WEBHOOK_KEY);
    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created])
    .catch(err => {
        error.log(err, req);
        return resp.status(400).end();
    });

    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });

            let user = await db.query(`SELECT users.user_email, subscriptions.subscription_id, subscription_end_date, referral_status, is_eligible FROM users
            LEFT JOIN subscriptions ON subscriptions.subscriber = users.username
            LEFT JOIN referrals ON referrals.referred_email = users.user_email
            WHERE stripe_id = $1`, [event.data.object.customer])
            .catch(err => {
                throw err;
            });

            console.log(event);

            if (user.rows.length === 1) {
                if (event.type === 'customer.subscription.trial_will_end') {
                    console.log(user.rows)
                    if (user.rows[0].referral_status === 'Activated' && user.rows[0].is_eligible) {
                        let trialEnd = moment(user.rows[0].subscription_end_date).add(3, 'days').unix();
                        console.log(trialEnd)

                        await stripe.subscriptions.update(user.rows[0].subscription_id, {
                            trial_end: trialEnd
                        })
                        .then(async subscription => {
                            console.log(subscription);
                            await db.query(`UPDATE subscriptions SET subscription_end_date = to_timestamp($1) WHERE subscription_id = $2`, [trialEnd, subscription.id])
                            .catch(err => {
                                return err;
                            })

                            await db.query(`UPDATE referrals SET referral_status = 'Claimed' WHERE referred_email = $1`, [user.rows[0].user_email])
                            .catch(err => {
                                return err;
                            })
                        })
                        .catch(err => {
                            throw err;
                        });
                    }
                } else {
                    let renewalDate = moment(event.data.object.next_payment_attempt * 1000).format('MM-DD-YYYY');

                    let message = {
                        to: user.rows[0].user_email,
                        from: {
                            name: 'Hire World',
                            email: 'admin@hireworld.ca'
                        },
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

                    sgMail.send(message)
                    .catch(err => {
                        throw err;
                    });
                }
            }

            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });
            resp.json({received: true});
        } catch (e) {
            error.log(e, req);
            resp.status(400).end();
            throw e;
        }
    }
})

app.post('/stripe-webhooks/subscription/renew', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_RENEW_WEBHOOK_KEY);

    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created])
    .catch(err => {
        error.log(err, req);
        return resp.status(400).end();
    });
    
    console.log(event);
    
    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });
            
            let user = await db.query(`SELECT username FROM users WHERE stripe_id = $1`, [event.data.object.customer])
            .catch(err => {
                throw err;
            });

            if (user.rows.length === 1) {
                if (event.type === 'invoice.payment_succeeded') {
                    let activity;
                    if (event.data.object.billing_reason === 'subscription_create') {
                        activity = 'Subscription created';
                    } else if (event.data.object.billing_reason === 'subscription_update') {
                        activity = 'Subscription renewed';
                    }

                    await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [activity, user.rows[0].username, 'Subscription'])
                    .catch(err => {
                        throw err;
                    });

                    await db.query(`UPDATE subscriptions SET subscription_end_date = subscription_end_date + interval '1 month' WHERE subscriber = $1 AND subscription_id = $2`, [user.rows[0].username, event.data.object.subscription])
                    .catch(err => {
                        throw err;
                    });
                } else if (event.type === 'invoice.payment_failed') {
                    await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Failed to renew subscription', user.rows[0].username, 'Subscription'])
                    .catch(err => {
                        throw err;
                    });

                    await db.query(`UPDATE subscriptions SET is_subscribed = false WHERE subscriber = $1 AND subscription_id = $2`, [user.rows[0].username, event.data.object.subscription])
                    .catch(err => {
                        throw err;
                    });

                    let message = {
                        to: user.rows[0].user_email,
                        from: {
                            name: 'Hire World',
                            email: 'admin@hireworld.ca'
                        },
                        subject: 'Notice: Renewal failed',
                        templateId: 'd-9459cc1fde43454ca77670ea97ee2d5a',
                        dynamicTemplateData: {
                            content: `This is a notice to let you know that your subscription at Hire World did not successfully renewed. This could be due to a couple of reasons: 
                            <ol>
                                <li>Your default payment card has expired</li>
                                <li>Your default payment card issuer declined the charge</li>
                            </ol>
                            If you don't think any of these reasons apply to the failure of renewal, please contact our administrator and we'll be happy to assist you.`,
                            subject: 'Notice: Renewal failed'
                        },
                        trackingSettings: {
                            clickTracking: {
                                enable: false
                            }
                        }
                    }
            
                    sgMail.send(message)
                    .catch(err => {
                        throw err;
                    });
                }
            }

            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });
            resp.json({received: true});
        } catch (e) {
            error.log(e, req);
            resp.status(400).end();
            throw e;
        }
    }
});

app.post('/stripe-webhooks/link_work', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_CONNECTED_WEBHOOK_KEY);
    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created])
    .catch(err => {
        error.log(err, req);
        return resp.status(400).end();
    });

    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });

            let user = await db.query(`SELECT username FROM users WHERE link_work_id = $1`, [event.account])
            .catch(err => {
                throw err;
            });

            if (user && user.rows.length === 1) {
                if (event.type === 'person.updated') {    
                    if (event.data.object.verification.status === 'verified') {
                        await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `Your Link Work account has been verified`, 'Update'])
                        .catch(err => {
                            throw err;
                        });

                        await db.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `Link Work account verified`, 'Link Work'])
                        .catch(err => {
                            throw err;
                        });
                    }
                }

                await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `There is an update on your Link Work account`, 'Update']
                .catch(err => {
                    throw err;
                }));
            }

            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });
            resp.json({received: true});
        } catch (e) {
            error.log(e, req);
            resp.status(400).end();
            throw e;
        }
    }
});

app.post('/stripe-webhooks/payout', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_PAYOUT_WEBHOOK_KEY);
    let loggedEvent = await db.query(`INSERT INTO stripe_events (event_id, event_created_date) VALUES ($1, to_timestamp($2)) ON CONFLICT (event_id) DO NOTHING RETURNING *`, [event.id, event.created])
    .catch(err => {
        error.log(err, req);
        return resp.status(400).end();
    });

    console.log(event);

    if (loggedEvent.rows.length === 1 && (loggedEvent.rows[0].event_status === 'Processing' || loggedEvent.rows[0].event_status === 'Processed')) {
        resp.status(409).end();
    } else {
        try {
            await db.query(`UPDATE stripe_events SET event_status = 'Processing' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });

            let user = await db.query(`SELECT username, link_work_id FROM users WHERE link_work_id = $1`, [event.account])
            .catch(err => {
                throw err;
            });

            if (event.type === 'payout.failed') {
                await db.query(`UPDATE job_milestones SET milestone_status = 'Unpaid' WHERE payout_id = $1`, [event.data.object.id])
                .catch(err => {
                    throw err;
                });

                await db.query(`UPDATE jobs SET job_status = 'Error' WHERE job_id = $1`, [event.data.object.metadata.job_id])
                .catch(err => {
                    throw err;
                });

                await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `A payout for a milestone in job ID: ${event.data.object.metadata.job_id} has failed and the job and milestone status has been set to "Unpaid". Please add a valid account to pay out the funds.`, 'Warning'])
                .catch(err => {
                    throw err;
                });
            } else if (event.type === 'payout.paid') {
                let payout = await stripe.payouts.retrieve(event.data.object.id, {expand: ['destination']}, {stripe_account: user.rows[0].link_work_id})
                .catch(err => {
                    throw err;
                });

                await db.query(`UPDATE job_milestones SET milestone_status = 'Complete' WHERE payout_id = $1`, [event.data.object.id])
                .catch(err => {
                    throw err;
                });

                await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].username, `A payout amount of $${moneyFormatter(event.data.object.amount / 100)} ${event.data.object.currency.toUpperCase()} was successfully deposited into your bank account ending in ${payout.destination.last4}`, 'Update'])
                .catch(err => {
                    throw err;
                });
            }

            await db.query(`UPDATE stripe_events SET event_status = 'Processed' WHERE event_id = $1`, [event.id])
            .catch(err => {
                throw err;
            });
            resp.json({received: true});
        } catch (e) {
            error.log(e, req);
            resp.status(400).end();
            throw e;
        }
    }
});

app.post('/stripe-webhooks/balance', async(req, resp) => {
    let sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_BALANCE_WEBHOOK_KEY);
})

module.exports = app;