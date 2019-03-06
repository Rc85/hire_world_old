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

stripe.setApiVersion('2019-02-19');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = `./user_files/${req.session.user.user_id}`;

        if (fs.existsSync(dir)) {
            cb(null, dir);
        } else {
            return cb(new Error('Directory does not exist'));
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
                        if (err) console.log(err);
                    });
                }

                fs.readdir(dir, (err, files) => {
                    if (err) console.log(err);

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
            return cb(new Error('Cannot use that file'));
        }
    }
});

app.post('/api/user/profile-pic/upload', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            let uploadProfilePic = upload.single('profile_pic');

            (async() => {
                try {
                    uploadProfilePic(req, resp, async err => {
                        if (err) {  
                            throw err;
                        } else {
                            await client.query('BEGIN');

                            let filePath;
                    
                            if (req.file) {
                                filePath = `/${req.file.destination.substring(2)}/${req.file.filename}`;
                            } else {
                                let error = new Error('No file found');
                                error.type = 'CUSTOM';
                                throw error;
                            }

                            await client.query(`UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2`, [filePath, req.session.user.user_id]);

                            /* let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
                            LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                            LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                            LEFT JOIN user_listings ON users.username = user_listings.listing_user
                            WHERE users.user_id = $1`, [req.session.user.user_id]); */

                            let user = await controller.session.retrieve(client, req.session.user.user_id);

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', user: user}));
                        }
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
                    resp.send({status: type, statusMessage: err.message});
                //});
            });
        });
    }
});

app.post('/api/user/profile-pic/delete', async(req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);
        
            (async() => {
                try {
                    await client.query('UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2', ['/images/profile.png', req.session.user.user_id]);

                    /* let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
                    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                    LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                    LEFT JOIN user_listings ON users.username = user_listings.listing_user
                    WHERE users.user_id = $1`, [req.session.user.user_id]); */

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
            .catch(err => {
                 console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/edit', (req, resp) => {
    if (req.session.user) {
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
                if (err) console.log(err);

                (async() => {
                    try {
                        await client.query(`BEGIN`);
                        await client.query(`UPDATE user_profiles SET ${type} = $1 WHERE user_profile_id = $2`, [req.body.value, req.session.user.user_id]);

                        /* let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
                        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                        LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                        LEFT JOIN user_listings ON users.username = user_listings.listing_user
                        WHERE users.user_id = $1`, [req.session.user.user_id]); */

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
                .catch(err => {
                     console.log(err);
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                });
            });
        } else {
            resp.send({status: 'error', statusMessage: 'URL only'});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
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
    .catch(err => {
         console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/user/business_hours/save', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            let timeCheck = /^([0-9]|[1-2][0-4]):?([0-5][0-9])?(\s?(AM|am|PM|pm))?(\s[A-Za-z]{3,5})?$/;
            let invalidFormat = false;

            for (let key in req.body.days) {
                if (req.body.days[key] !== 'Closed') {
                    let times = req.body.days[key].split(' - ');

                    if (times.length !== 2) {
                        invalidFormat = true;
                        break;
                    } else {
                        for (let time of times) {
                            if (!timeCheck.test(time)) {
                                invalidFormat = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (invalidFormat) {
                resp.send({status: 'error', statusMessage: 'Invalid time format'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let user = await client.query(`SELECT account_type FROM users
                        LEFT JOIN user_listings ON users.username = user_listings.listing_user
                        WHERE username = $1 AND listing_id = $2`, [req.session.user.username, req.body.id]);

                        if (user.rows[0].account_type !== 'User') {
                            let businessHour = await client.query(`SELECT * FROM business_hours WHERE for_listing = $1`, [req.body.id]);

                            if (businessHour.rows.length === 0) {
                                await client.query(`INSERT INTO business_hours (monday, tuesday, wednesday, thursday, friday, saturday, sunday, for_listing) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [req.body.days.mon, req.body.days.tue, req.body.days.wed, req.body.days.thu, req.body.days.fri, req.body.days.sat, req.body.days.sun, req.body.id]);
                            } else if (businessHour.rows.length === 1) {
                                await client.query('UPDATE business_hours SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7 WHERE for_listing = $8', [req.body.days.mon, req.body.days.tue, req.body.days.wed, req.body.days.thu, req.body.days.fri, req.body.days.sat, req.body.days.sun, req.body.id])
                            }

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Business hours saved'}));
                        } else if (user.rows[0].account_type === 'User') {
                            let error = new Error(`You're not subscribed`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack}
                            throw errObj;
                        }
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
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/notifications/viewed', async(req, resp) => {
    if (req.session.user) {
        await db.query(`UPDATE notifications SET notification_status = 'Viewed' WHERE notification_recipient = $1`, [req.session.user.username])
        .then(result => {
            if (result) {
                resp.send({status: 'success'});
            }
        })
        .catch(err => {
             console.log(err);
            resp.send({status: 'error'});
        });
    }
});

app.post('/api/user/subscription/add', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.SUBSCRIPTION_RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
                if (err) console.log(err);

                let response = JSON.parse(res.body);
                
                if (response.success) {
                    (async() => {
                        try {
                            await client.query('BEGIN');

                            let user = await client.query(`SELECT username, user_email, stripe_id, subscription_end_date, is_subscribed, plan_id, subscription_id, user_profiles.* FROM users
                            LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                            WHERE username = $1`, [req.session.user.username]);

                            if (req.body.saveAddress) {
                                await client.query(`UPDATE user_profiles SET user_address = $1, user_city = $2, user_region = $3, user_country = $4, user_city_code = $5 WHERE user_profile_id = $6`, [req.body.address_line1, req.body.address_city, req.body.address_state, req.body.address_country, req.body.address_zip, req.session.user.user_id]);
                            }

                            let customer, subscription, customerParams;
                            let now = new Date();

                            if (req.body.plan === 'plan_EVUbtmca9pryxy' || req.body.plan === 'plan_EVTJiZUT4rVkCT') {
                                // Set subscription parameters
                                let subscriptionParams = {
                                    customer: null,
                                    items: [{plan: req.body.plan}],
                                    trial_end: null
                                };
                                
                                // If user already has a stripe account
                                if (user.rows[0].stripe_id) {
                                    subscriptionParams.customer = user.rows[0].stripe_id;
                                    
                                    // Set customer parameters with information sent from client
                                    customerParams = {
                                        source: req.body.token.id,
                                        email: user.rows[0].user_email
                                    }

                                    // If user is using a stored payment method
                                    if (req.body.usePayment && req.body.usePayment !== 'New') {
                                        // Set customer default payment to the stored payment method
                                        customerParams = {
                                            default_source: req.body.usePayment,
                                            email: user.rows[0].user_email
                                        }
                                    }
                                } else { // If user doesn't have a stripe account
                                    // Create a customer account
                                    customer = await stripe.customers.create({
                                        source: req.body.token.id,
                                        email: user.rows[0].user_email,
                                    });
                                    
                                    // Set subscription parameters with new account id
                                    subscriptionParams.customer = customer.id
                                }
                                
                                // If user is not subscribed
                                if (user.rows[0].is_subscribed) {
                                    if (user.rows[0].plan_id === 'plan_EVUbtmca9pryxy' || user.rows[0].plan_id === 'plan_EVTJiZUT4rVkCT') {
                                        let error = new Error(`You're already subscribed to that plan`);
                                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                        throw errObj;
                                    }

                                    // If user still have days left on their subscription
                                    if (new Date(user.rows[0].subscription_end_date) > now) {
                                        // Get the different of subscription end date and today
                                        let dayDiff = moment(user.rows[0].subscription_end_date).unix();
                                        // Apply the difference to the trial days so user gets billed at the end of their remaining subscription days
                                        subscriptionParams.trial_end = dayDiff;
                                    }
                                } else {
                                    await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Subscription created', req.session.user.username, 'Subscription']);
                                    await client.query(`UPDATE users SET account_type = $3, is_subscribed = true, stripe_id = $1, subscription_id = $4, plan_id = $5, subscription_end_date = CASE WHEN subscription_end_date > current_timestamp THEN subscription_end_date + interval '31 days' ELSE current_timestamp + interval '31 days' END WHERE username = $2`, [customer.id, req.session.user.username, 'Listing', subscription.id, subscription.plan.id]);
                                }
                                
                                subscription = await stripe.subscriptions.create(subscriptionParams);
                            } else if (req.body.plan === '30 Day Listing') {
                                let charge;

                                if (!user.rows[0].stripe_id) {
                                    charge = await stripe.charges.create({
                                        amount: 800,
                                        currency: 'cad',
                                        source: req.body.token.id,
                                        receipt_email: user.rows[0].user_email,
                                        description: 'HireWorld 30 Day Listing'
                                    });
                                } else if (user.rows[0].stripe_id && !user.rows[0].is_subscribed) {
                                    charge = await stripe.charges.create({
                                        amount: 800,
                                        currency: 'cad',
                                        customer: user.rows[0].stripe_id,
                                        source: req.body.token.id
                                    });
                                } else if (user.rows[0].stripe_id && user.rows[0].is_subscribed) {
                                    let error = new Error(`You're already subscribed`);
                                    let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                    throw errObj;
                                }

                                if (charge.paid && charge.status === 'succeeded') {
                                    if (user.rows[0].subscription_end_date && new Date(user.rows[0].subscription_end_date) > now) {
                                        await client.query(`UPDATE users SET subscription_end_date = subscription_end_date + interval '30 days', account_type = 'Listing' WHERE username = $1`, [req.session.user.username]);
                                    } else if (user.rows[0].subscription_end_date && new Date(user.rows[0].subscription_end_date) < now || !user.rows[0].subscription_end_date) {
                                        await client.query(`UPDATE users SET subscription_end_date = current_timestamp + interval '30 days', account_type = 'Listing' WHERE username = $1`, [req.session.user.username]);
                                    }

                                    await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Purchased 30 Day Listing', req.session.user.username, 'Purchase']);
                                } else {
                                    let error = new Error('Failed to process payment');
                                    let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                    throw errObj;
                                }
                            }

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
                         error.log(err, req, resp);
                    });
                } else {
                    resp.send({status: 'error', statusMessage: `You're not human`});
                }
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/subscription/cancel', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);
            
            (async() => {
                try {
                    await client.query('BEGIN');

                    let subscriptionId = await client.query('SELECT subscription_id FROM users WHERE username = $1', [req.session.user.username]);

                    let subscription = await stripe.subscriptions.del(subscriptionId.rows[0].subscription_id);

                    if (subscription.status === 'canceled') {
                        await client.query(`UPDATE users SET is_subscribed = false WHERE username = $1`, [req.session.user.username]);
                    }

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
            .catch(err => {
                 console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/payment/add', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

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
                            email: user.rows[0].user_email
                        });

                        await client.query(`UPDATE users SET stripe_id = $1 WHERE username = $2`, [customer.id, req.session.user.username]);

                        await client.query('COMMIT')
                        .then(async() => {
                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Added a card ending in ${customer.sources.data.last4}`, req.session.user.username, 'Payment']);
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
            .catch(err => {
                 console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: `You're not logged in`});
    }
});

app.post('/api/user/payment/edit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_id FROM users WHERE username = $1`, [req.session.user.username]);

                    let card = await stripe.customers.updateCard(user.rows[0].stripe_id, req.body.source, {
                        address_line1: req.body.address_line1,
                        address_city: req.body.address_city,
                        address_state: req.body.address_state,
                        address_country: req.body.address_country,
                        address_zip: req.body.address_zip
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
            .catch(err => {
                 console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    }
});

app.post('/api/user/payment/default', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

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
                        error.type = 'CUSTOM';
                        throw error;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                 console.log(err);
                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    }
});

app.post('/api/user/payment/delete', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_id, is_subscribed FROM users WHERE username = $1`, [req.session.user.username]);

                    if (user && user.rows[0].stripe_id) {
                        let customer = await stripe.customers.retrieve(user.rows[0].stripe_id);

                        if (user.rows[0].is_subscribed && customer.sources.data.length === 1) {
                            let error = new Error(`This card cannot be deleted`);
                            error.type = 'CUSTOM';
                            throw error;
                        } else if (customer.sources.data.length > 1) {
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
                                error.type = 'CUSTOM';
                                throw error;
                            }
                        }
                    } else {
                        let error = new Error(`Account does not exist`);
                        error.type = 'CUSTOM';
                        throw error;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                 console.log(err);
                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    }
});

app.post('/api/user/dismiss/announcement', async(req, resp) => {
    if (req.session.user) {
        await db.query(`INSERT INTO dismissed_announcements (dismissed_announcement, dismissed_by) VALUES ($1, $2) ON CONFLICT ON CONSTRAINT unique_dismiss DO NOTHING`, [req.body.id, req.session.user.username])
        .then(() => resp.send({status: 'success'}))
        .catch(err => {
             console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    }
});

app.post('/api/user/notifications/read', async(req, resp) => {
    if (req.session.user) {
        await db.query(`UPDATE notifications SET notification_status = 'Viewed' WHERE notification_recipient = $1`, [req.session.user.username])
        .then(result => {
            if (result && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        })
        .catch(err => {
             console.log(err);
        });
    }
});

app.post('/api/user/friend', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

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
            .catch(err => {
                console.log(err);

                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    }
});

app.post('/api/user/block', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

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
            .catch(err => {
                console.log(err);

                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    }
});

module.exports = app;