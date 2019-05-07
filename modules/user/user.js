const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const validate = require('../utils/validate');
const moment = require('moment');
const request = require('request');
const controller = require('../utils/controller');
const authenticate = require('../utils/auth');
const sgClient = require('@sendgrid/client');
const sgMail = require('@sendgrid/mail');
const util = require('util');
const sa = require('../utils/sa');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

stripe.setApiVersion('2019-02-19');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = `./user_files/${req.session.user.user_id}`;

        if (fs.existsSync(dir)) {
            cb(null, dir);
        } else {
            fs.mkdirSync(dir);
            cb(null, dir);
        }
    },
    filename: (req, file, cb) => {
        let fileHash = Date.now();

        cb(null, `profile_pic_${fileHash}.jpg`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2000000
    },
    fileFilter: (req, file, cb) => {
        let extension = path.extname(file.originalname);
        let extCheck = /.(jpg|jpeg|png|gif)$/;
        let filesize = parseInt(req.headers['content-length']);
        let dir = `./user_files/${req.session.user.user_id}`;
        let filenameCheck = /^profile_pic/;

        if (extCheck.test(extension)) {
            if (filesize < 2000000) {
                if (!fs.existsSync(dir)) {
                    fs.mkdir(dir, (err) => {
                        if (err) error.log(err, req, resp);
                    });
                }

                fs.readdir(dir, (err, files) => {
                    if (err) error.log(err, req, resp);

                    for (let file of files) {
                        if (file.match(filenameCheck)) {
                            fs.unlinkSync(`${dir}/${file}`);
                        }
                    }
                });

                cb(null, true);
            } else {
                return cb(new Error('File size exceeded'));
            }
        } else {
            return cb(new Error('File type not supported'));
        }
    }
});

app.post('/api/user/profile-pic/upload', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            let uploadProfilePic = upload.single('profile_pic');

            uploadProfilePic(req, resp, async err => {
                if (err) {
                    resp.send({status: 'error', statusMessage: err.message});
                } else {
                    (async() => {
                        try {
                            await client.query('BEGIN');

                            let filePath;
                    
                            if (req.file) {
                                filePath = `/${req.file.destination.substring(2)}/${req.file.filename}`;
                            } else {
                                let error = new Error('No file found');
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};;
                                throw errObj;
                            }

                            await client.query(`UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2`, [filePath, req.session.user.user_id]);

                            let user = await controller.session.retrieve(client, req.session.user.user_id);

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', user: user}));
                        } catch (e) {
                            await client.query('ROLLBACK');
                            throw e;
                        } finally {
                            done();
                        }
                    })()
                    .catch(err => error.log(err, req, resp));
                }
            });
        });
});

app.post('/api/user/profile-pic/delete', authenticate, async(req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);
    
        (async() => {
            try {
                await client.query('UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2', ['/images/profile.png', req.session.user.user_id]);

                let user = await controller.session.retrieve(client, req.session.user.user_id);

                await client.query('COMMIT')
                .then(() => resp.send({status: 'success', user: user}));
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                done();
            }
        })()
        .catch(err => error.log(err, req, resp));
    });
});

app.post('/api/user/edit', authenticate, (req, resp) => {
    let type;

    if (req.body.column === 'Github') {
        type = 'user_github';
    } else if (req.body.column === 'LinkedIn') {
        type = 'user_linkedin';
    } else if (req.body.column === 'Facebook') {
        type = 'user_facebook';
    } else if (req.body.column === 'Twitter') {
        type = 'user_twitter';
    } else if (req.body.column === 'Website') {
        type = 'user_website';
    } else if (req.body.column === 'Instagram') {
        type = 'user_instagram';
    }

    if (validate.urlCheck.test(req.body.value)) {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query(`BEGIN`);
                    await client.query(`UPDATE user_profiles SET ${type} = $1 WHERE user_profile_id = $2`, [req.body.value, req.session.user.user_id]);

                    let user = await controller.session.retrieve(client, req.session.user.user_id);

                    await client.query(`COMMIT`)
                    .then(() => resp.send({status: 'success', user: user}));
                } catch (e) {
                    await client.query(`ROLLBACK`);
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
    } else {
        resp.send({status: 'error', statusMessage: 'URL only'});
    }
});

app.post('/api/user/search/titles', async(req, resp) => {
    await db.query(`SELECT user_title FROM user_profiles
    LEFT JOIN users ON users.user_id = user_profiles.user_profile_id WHERE user_title ILIKE $1 AND user_status = 'Active'`, [`%${req.body.value}%`])
    .then(result => {
        if (result) {
            let titles = [];

            if (result.rows.length > 0) {
                for (let title of result.rows) {
                    titles.push(title.user_title);
                }
            }

            resp.send({status: 'success', titles: titles});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/user/business_hours/save', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        let timeCheck = /^([0-9]|[1][1-2]|[1-2][0-4]):?([0-5][0-9])?(\s?(AM|am|PM|pm))(\s[A-Za-z]{3,5})?$/;
        let invalidFormat = false;

        for (let key in req.body.days) {
            if (req.body.days[key] !== 'Closed') {
                let times = req.body.days[key].split(' - ');

                if (times.length !== 2) {
                    invalidFormat = true;
                    break;
                } else {
                    for (let time of times) {
                        let timeString = time.trim();
                        if (!timeCheck.test(timeString)) {
                            invalidFormat = true;
                            break;
                        }
                    }
                }
            }
        }

        if (!req.body.id) {
            resp.send({status: 'error', statusMessage: `You haven't listed your profile`});
        } else if (invalidFormat) {
            resp.send({status: 'error', statusMessage: 'Invalid time format'});
        } else {
            (async() => {
                try {
                    await client.query('BEGIN');

                    let businessHour = await client.query(`SELECT * FROM business_hours WHERE for_listing = $1`, [req.body.id]);

                    if (businessHour.rows.length === 0) {
                        await client.query(`INSERT INTO business_hours (monday, tuesday, wednesday, thursday, friday, saturday, sunday, for_listing) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [req.body.days.mon, req.body.days.tue, req.body.days.wed, req.body.days.thu, req.body.days.fri, req.body.days.sat, req.body.days.sun, req.body.id]);
                    } else if (businessHour.rows.length === 1) {
                        await client.query('UPDATE business_hours SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7 WHERE for_listing = $8', [req.body.days.mon, req.body.days.tue, req.body.days.wed, req.body.days.thu, req.body.days.fri, req.body.days.sat, req.body.days.sun, req.body.id])
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', statusMessage: 'Business hours saved'}));
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                    error.log(err, req, resp);
            });
        }
    });
});

app.post('/api/user/notifications/viewed', authenticate, async(req, resp) => {
        await db.query(`UPDATE notifications SET notification_status = 'Viewed' WHERE notification_recipient = $1`, [req.session.user.username])
        .then(result => {
            if (result) {
                resp.send({status: 'success'});
            }
        })
        .catch(err => error.log(err, req, resp));
});

app.post('/api/user/subscription/add', authenticate, (req, resp) => {
    db.connect(async(err, client, done) => {
        if (err) error.log(err, req, resp);

        let plans = await stripe.plans.list()
        .then(list => {
            return list.data.map(plan => {
                return plan.id;
            });
        })
        .catch(err => {
            return error.log(err, req, resp);
        });

        if (plans.indexOf(req.body.plan) < 0) {
            resp.send({status: 'error', statusMessage: `That plan does not exist`});
        } else if (req.body.token.card && !validate.locationCheck.test(req.body.token.card.address_city)) {
            resp.send({status: 'error', statusMessage: 'City is invalid'});
        } else if (req.body.token.card && !validate.locationCheck.test(req.body.token.card.address_state)) {
            resp.send({status: 'error', statusMessage: 'Region is invalid'});
        } else if (req.body.token.card && !validate.addressCheck.test(req.body.token.card.address_line1)) {
            resp.send({status: 'error', statusMessage: 'Address line 1 is invalid'});
        } else if (req.body.token.card && req.body.token.card.address_line2 && !validate.addressCheck.test(req.body.token.card.address_line2)) {
            resp.send({status: 'error', statusMessage: 'Address line 2 is invalid'});
        } else if (req.body.token.card && !validate.locationCheck.test(req.body.token.card.address_country)) {
            resp.send({status: 'error', statusMessage: 'Country is invalid'});
        } else if (req.body.token.card && !validate.cityCodeCheck.test(req.body.token.card.address_zip)) {
            resp.send({status: 'error', statusMessage: 'Postal/zip code is invalid'});
        } else if (req.body.token.card && (validate.blankCheck.test(req.body.token.card.adress_line1) || !req.body.token.card.address_line1)) {
            resp.send({status: 'error', statusMessage: 'An address is required'});
        } else if (req.body.token.card && (validate.blankCheck.test(req.body.token.card.address_country) || !req.body.token.card.address_country)) {
            resp.send({status: 'error', statusMessage: 'Country is required'});
        } else if (req.body.token.card && (validate.blankCheck.test(req.body.token.card.address_state) || !req.body.token.card.address_state)) {
            resp.send({status: 'error', statusMessage: 'Region is required'});
        } else if (req.body.token.card && (validate.blankCheck.test(req.body.token.card.address_city) || !req.body.token.card.address_city)) {
            resp.send({status: 'error', statusMessage: 'City is required'});
        } else if (req.body.token.card && (validate.blankCheck.test(req.body.token.card.address_zip) || !req.body.token.card.address_zip)) {
            resp.send({status: 'error', statusMessage: 'Postal/zip code is required'});
        } else {
            (async() => {
                try {
                    await client.query('BEGIN');
                    
                    let user = await client.query(`SELECT username, user_email, stripe_id, subscription_end_date, CASE WHEN subscriptions.sub_id IS NOT NULL AND subscriptions.subscription_status = 'Active' THEN true ELSE false END AS is_subscribed, subscriptions.*, user_profiles.* FROM users
                    LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                    LEFT JOIN subscriptions ON users.username = subscriptions.subscriber
                    WHERE username = $1`, [req.session.user.username]);

                    if (user.rows[0].is_subscribed) {
                        let error = new Error(`You're already subscribed`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }

                    if (req.body.saveAddress) {
                        await client.query(`UPDATE user_profiles SET user_address = $1, user_city = $2, user_region = $3, user_country = $4, user_city_code = $5 WHERE user_profile_id = $6`, [req.body.token.card.address_line1, req.body.token.card.address_city, req.body.token.card.address_state, req.body.token.card.address_country, req.body.token.card.address_zip, req.session.user.user_id]);
                    }

                    let customer, subscription, customerId, stripeAccount;

                    // Set subscription parameters
                    let subscriptionParams = {
                        customer: null,
                        items: [{plan: req.body.plan}]
                    };
                    
                    // If user already has a stripe account
                    if (user.rows[0].stripe_id) {
                        stripeAccount = await stripe.customers.retrieve(user.rows[0].stripe_id);
                    }

                    if (stripeAccount) {
                        if (stripeAccount.sources.data.length > 0) {
                            subscriptionParams.customer = user.rows[0].stripe_id;
                            subscriptionParams['default_source'] = req.body.token.id;

                            customerId = user.rows[0].stripe_id;
                        } else {
                            let source = await stripe.customers.createSource(user.rows[0].stripe_id, {
                                source: req.body.token.id
                            });

                            subscriptionParams.customer = source.customer;
                            subscriptionParams['default_source'] = source.id;

                            customerId = source.customer;
                        }
                    } else { // If user doesn't have a stripe account
                        // Create a customer account
                        customer = await stripe.customers.create({
                            source: req.body.token.id,
                            email: user.rows[0].user_email,
                        });
                        
                        // Set subscription parameters with new account id
                        subscriptionParams.customer = customer.id
                        customerId = customer.id;
                    }
                    
                    // If user is not subscribed
                    if (!user.rows[0].is_subscribed && user.rows[0].subscription_end_date) {
                        let subscriptionEndDate = new Date(user.rows[0].subscription_end_date);
                        let now = new Date();

                        if (subscriptionEndDate.getTime() - now.getTime() > 0) {
                            let dayDiff = moment(user.rows[0].subscription_end_date).unix();
                            // Apply the difference to the trial days so user gets billed at the end of their remaining subscription days
                            subscriptionParams['trial_end'] = dayDiff;
                        }
                    } else if (!user.rows[0].is_subscribed && !user.rows[0].subscription_end_date) {
                        await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Subscription created', req.session.user.username, 'Subscription']);
                    }

                    subscriptionParams['expand'] = ['latest_invoice.charge']
                    
                    subscription = await stripe.subscriptions.create(subscriptionParams);

                    if (subscription.latest_invoice.charge.outcome.risk_level === 'elevated') {
                        await sa.create('Subscription', 'Elevated risk reported by Stripe', req.session.user.username, 4, subscription.latest_invoice.charge.id);
                    }
                    
                    await client.query(`UPDATE users SET account_type = $3, stripe_id = $1 WHERE username = $2`, [customerId, req.session.user.username, 'Link Work', subscription.id, subscription.plan.id]);
                    await client.query(`INSERT INTO subscriptions (subscription_id, subscription_end_date, subscriber) VALUES ($1, $2, $3) ON CONFLICT (subscription_id) DO UPDATE SET subscription_end_date = CASE WHEN subscription_end_date < current_timestamp THEN current_timestamp + interval '1 month' END, subscription_created_date = current_timestamp`);

                    await client.query('COMMIT')
                    .then(async() => {
                        resp.send({status: 'success'});
                    });
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                return error.log(err, req, resp);
            });
        }
    });
});

app.post('/api/user/subscription/cancel', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);
            
            (async() => {
                try {
                    await client.query('BEGIN');

                    let subscriptionId = await client.query('SELECT subscription_id FROM subscriptions WHERE subscriber = $1', [req.session.user.username]);

                    await stripe.subscriptions.del(subscriptionId.rows[0].subscription_id);

                    await client.query('COMMIT')
                    .then(async() => {
                        await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Subscription canceled', req.session.user.username, 'Subscription']);
                        resp.send({status: 'success'});
                    });
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

app.post('/api/user/payment/add', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            if (req.body.error) {
                req.body.error['stack'] = req.body.error.message;
                error.log(req.body.error, req, resp);
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let user = await client.query(`SELECT stripe_id, user_email FROM users WHERE username = $1`, [req.session.user.username]);
                        
                        if (req.body.saveAddress) {
                            await client.query(`UPDATE user_profiles SET user_address = $1, user_city = $2, user_region = $3, user_country = $4, user_city_code = $5 WHERE user_profile_id = $6`, [req.body.address_line1, req.body.address_city, req.body.address_state, req.body.address_country, req.body.address_zip, req.session.user.user_id]);
                        }

                        if (user && user.rows[0].stripe_id) {
                            let card = await stripe.customers.createSource(user.rows[0].stripe_id, {source: req.body.token.id});

                            let customer = await stripe.customers.retrieve(user.rows[0].stripe_id);

                            await client.query('COMMIT')
                            .then(async() => {
                                await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Added a card ending in ${card.last4}`, req.session.user.username, 'Payment']);
                                resp.send({status: 'success', card: card, defaultSource: customer.default_source});
                            });
                        } else if (user && !user.rows[0].stripe_id) {
                            let customer = await stripe.customers.create({
                                source: req.body.token.id,
                                email: user.rows[0].user_email,
                                shipping: {
                                    name: req.body.token.name,
                                    address: {
                                        line1: req.body.token.address_line1,
                                        city: req.body.token.address_city,
                                        state: req.body.token.address_state,
                                        country: req.body.token.address_country,
                                        postal_code: req.body.token.adress_zip
                                    }
                                }
                            });

                            await client.query(`UPDATE users SET stripe_id = $1 WHERE username = $2`, [customer.id, req.session.user.username]);

                            await client.query('COMMIT')
                            .then(async() => {
                                await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Added a card ending in ${customer.sources.data[customer.sources.data.length - 1].last4}`, req.session.user.username, 'Payment']);
                                resp.send({status: 'success', statusMessage: 'Card added', defaultSource: customer.default_source, card: customer.sources.data[0]});
                            });
                        }
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => error.log(err, req, resp));
            }
        });
});

app.post('/api/user/payment/edit', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_id FROM users WHERE username = $1`, [req.session.user.username]);

                    let card = await stripe.customers.updateCard(user.rows[0].stripe_id, req.body.id, {
                        address_line1: req.body.address_line1,
                        address_city: req.body.address_city,
                        address_state: req.body.address_state,
                        address_country: req.body.address_country,
                        address_zip: req.body.address_zip,
                        exp_month: req.body.card_exp_month,
                        exp_year: req.body.card_exp_year
                    });

                    await client.query('COMMIT')
                    .then(async() => {
                        await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Updated card ending in ${card.last4}`, req.session.user.username, 'Payment']);
                        resp.send({status: 'success', statusMessage: 'Card updated', card: card});
                    });
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

app.post('/api/user/payment/default', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_id FROM users WHERE username = $1`, [req.session.user.username]);

                    if (user && user.rows[0].stripe_id) {
                        let customer = await stripe.customers.update(user.rows[0].stripe_id, {default_source: req.body.id});

                        let defaultPayment;

                        for (let source of customer.sources.data) {
                            if (source.id === customer.default_source) {
                                defaultPayment = source.last4;
                            }
                        }

                        await client.query('COMMIT')
                        .then(async() => {
                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Set card ending in ${defaultPayment} as default`, req.session.user.username, 'Payment']);
                            resp.send({status: 'success', statusMessage: 'Default card has been set', defaultSource: customer.default_source});
                        });
                    } else if (user && !user.rows[0].stripe_id) {
                        let error = new Error(`You need to add a card`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

app.post('/api/user/payment/delete', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_id, CASE WHEN subscriptions.sub_id IS NOT NULL AND subscriptions.subscription_status = 'Active' THEN true ELSE false END AS is_subscribed FROM users
                    LEFT JOIN subscriptions ON user.username = subscriptions.subscriber
                    WHERE username = $1`, [req.session.user.username]);

                    if (user && user.rows[0].stripe_id) {
                        let customer = await stripe.customers.retrieve(user.rows[0].stripe_id);

                        if (user.rows[0].is_subscribed && customer.sources.data.length === 1) {
                            let error = new Error(`At least one card is required for an active subscription`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};;
                            throw errObj;
                        } else if (!user.rows[0].is_subscribed && customer.sources.data.length > 0) {
                            card = await stripe.customers.deleteCard(user.rows[0].stripe_id, req.body.id);

                            if (card.deleted) {
                                customer = await stripe.customers.retrieve(user.rows[0].stripe_id);

                                await client.query('COMMIT')
                                .then(async() => {
                                    await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Deleted a card`, req.session.user.username, 'Payment']);
                                    resp.send({status: 'success', statusMessage: 'Card deleted', defaultSource: customer.default_source});
                                });
                            } else {
                                let error = new Error('Failed to delete card');
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};;
                                throw errObj;
                            }
                        }
                    } else {
                        let error = new Error(`Account does not exist`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};;
                        throw errObj;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

app.post('/api/user/dismiss/announcement', authenticate, async(req, resp) => {
        await db.query(`INSERT INTO dismissed_announcements (dismissed_announcement, dismissed_by) VALUES ($1, $2) ON CONFLICT ON CONSTRAINT unique_dismiss DO NOTHING`, [req.body.id, req.session.user.username])
        .then(() => resp.send({status: 'success'}))
        .catch(err => error.log(err, req, resp));
});

app.post('/api/user/notifications/read', authenticate, async(req, resp) => {
        await db.query(`UPDATE notifications SET notification_status = 'Viewed' WHERE notification_recipient = $1`, [req.session.user.username])
        .then(result => {
            if (result && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        })
        .catch(err => error.log(err, req, resp));
});

app.post('/api/user/friend', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        if (req.session.user.username === req.body.user) {
            resp.send({status: 'error', statusMessage: `You cannot add yourself as friend`});
        } else {
            (async() => {
                try {
                    await client.query('BEGIN');
                    
                    if (req.body.action === 'add') {
                        await client.query(`INSERT INTO friends (friend_user_1, friend_user_2) VALUES ($1, $2)`, [req.session.user.username, req.body.user]);
                    } else if (req.body.action === 'remove') {
                        await client.query(`DELETE FROM friends WHERE friend_user_1 = $1 AND friend_user_2 = $2`, [req.session.user.username, req.body.user]);
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', statusMessage: req.body.action === 'add' ? 'Added to Friends' : 'Removed from Friends'}));
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        }
    });
});

app.post('/api/user/block', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        (async() => {
            try {
                await client.query('BEGIN');

                if (req.body.action === 'block') {
                    await client.query(`INSERT INTO blocked_users (blocking_user, blocked_user) VALUES ($1, $2)`, [req.session.user.username, req.body.user]);
                } else if (req.body.action === 'unblock') {
                    await client.query(`DELETE FROM blocked_users WHERE blocking_user = $1 AND blocked_user = $2`, [req.session.user.username, req.body.user]);
                }

                await client.query('COMMIT')
                .then(() => resp.send({status: 'success', statusMessage: req.body.action === 'block' ? 'User blocked' : 'User unblocked'}));
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                done();
            }
        })()
        .catch(err => error.log(err, req, resp));
    });
});

app.post('/api/email/subscribe', async(req, resp) => {
    request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.MAILING_LIST_RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
        if (err) return error.log(err, req, resp);

        let response = JSON.parse(res.body);
        
        if (response.success) {
            sgClient.request({
                url: '/v3/contactdb/recipients',
                method: 'POST',
                body: [
                    {email: req.body.email}
                ]
            })
            .then(([response]) => {
                if (response.statusCode === 201) {
                    resp.send({status: 'success', statusMessage: 'Subscribed'});
                } else if (resp.statusCode >= 400) {
                    resp.send({status: 'error', statusMessage: response.statusMessage});
                }
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: `You're not human`});
        }
    });
});

app.post('/api/refer', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) return error.log(err, req, resp);

        let hasEmail = false;

        for (let email of req.body) {
            if (email.email || !/^\s*$/.test(email.email)) {
                hasEmail = true;
                break;
            }
        }

        if (hasEmail) {
            (async() => {
                try {
                    await client.query('BEGIN');

                    let emails = [];

                    for (let email of req.body) {
                        let referral = await client.query(`INSERT INTO referrals (referer, referred_email, referral_key) VALUES ($1, $2, $3) ON CONFLICT (referer, referred_email) DO UPDATE SET referral_created_date = current_timestamp RETURNING *`, [req.session.user.username, email.email, email.referKey]);

                        if (referral && referral.rows.length === 1) {
                            emails.push({
                                to: email.email,
                                from: 'admin@hireworld.ca',
                                templateId: 'd-da70ebb683ad4f399599acc12678fc97',
                                dynamicTemplateData: {
                                    url: process.env.SITE_URL,
                                    referKey: referral.rows[0].referral_key
                                },
                                trackSettings: {
                                    clickTracking: {
                                        enable: false
                                    }
                                }
                            });
                        }
                    }

                    sgMail.send(emails)
                    .catch(err => {
                        throw err;
                    });

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', statusMessage: 'Referral(s) sent'}));
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                return error.log(err, req, resp);
            });
        } else {
            resp.send({status: 'error', statusMessage: 'At least one email is required'});
        }
    });
});


module.exports = app;