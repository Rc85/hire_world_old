const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY);
const validate = require('../utils/validate');
const moment = require('moment');
const request = require('request');
const controller = require('../utils/controller');

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
                        if (err) error.log({name: err.name, message: err.message, origin: 'fs Creating Directory', url: req.url});
                    });
                }

                fs.readdir(dir, (err, files) => {
                    if (err) error.log({name: err.name, message: err.message, origin: 'fs Reading Directory', url: req.url});

                    for (let file of files) {
                        console.log(file);
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
            if (err) error.log({err: err.name, message: err.message, origin: 'Database Connection', url: '/'});

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

                            let user = await controller.session.retrieve(req.session.user.user_id);

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
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url}, (type) => {
                    resp.send({status: type, statusMessage: err.message});
                });
            });
        });
    }
});

app.post('/api/user/profile-pic/delete', async(req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});
        
            (async() => {
                try {
                    await client.query('UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2', ['/images/profile.png', req.session.user.user_id]);

                    let user = await controller.session.retrieve(req.session.user.user_id);

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
                error.log({name: err.name, message: err.message, origin: 'Deleting profile picture', url: req.url});
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
                if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

                (async() => {
                    try {
                        await client.query(`BEGIN`);
                        await client.query(`UPDATE user_profiles SET ${type} = $1 WHERE user_profile_id = $2`, [req.body.value, req.session.user.user_id]);

                        let user = await controller.session.retrieve(req.session.user.user_id);

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
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
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
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/user/business_hours/save', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            delete req.body.status;
            delete req.body.showSettings;

            let timeCheck = /^([0-9]|[1-2][0-4]):[0-5][0-9](\s?(AM|am|PM|pm))?(\s[A-Za-z]{3,5})?$/;
            let invalidFormat = false;

            for (let key in req.body) {
                if (req.body[key] !== 'Closed') {
                    let times = req.body[key].split(' - ');

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

                        let user = await client.query(`SELECT account_type FROM users WHERE username = $1`, [req.session.user.username]);

                        if (user.rows[0].account_type !== 'User') {
                            await client.query(`INSERT INTO business_hours (monday, tuesday, wednesday, thursday, friday, saturday, sunday, business_owner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (business_owner) DO UPDATE SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7`, [req.body.mon, req.body.tue, req.body.wed, req.body.thu, req.body.fri, req.body.sat, req.body.sun, req.session.user.username]);
                        } else {
                            let error = new Error(`You're not subscribed`);
                            error.type = 'CUSTOM';
                            throw error;
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
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});

                    let message = 'An error occurred';

                    if (err.type === 'CUSTOM') {
                        message = err.message;
                    }

                    resp.send({status: 'error', statusMessage: message});
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
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error'});
        });
    }
});

app.post('/api/user/subscription/add', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.SUBSCRIPTION_RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
                if (err) error.log({name: err.name, message: err.message, origin: 'Subscription recaptcha', url: req.url});

                let response = JSON.parse(res.body);

                if (response.success) {
                    (async() => {
                        try {
                            await client.query('BEGIN');

                            let user = await client.query(`SELECT * FROM users
                            LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                            WHERE username = $1`, [req.session.user.username]);

                            if (req.body.saveAddress) {
                                await client.query(`UPDATE user_profiles SET user_address = $1, user_city = $2, user_region = $3, user_country = $4, user_city_code = $5 WHERE user_profile_id = $6`, [req.body.address_line1, req.body.address_city, req.body.address_state, req.body.address_country, req.body.address_zip, req.session.user.user_id]);
                            }

                            let customer, subscription, accountType;

                            if (req.body.plan === 'plan_EFVAGdrFIrpHx5' || req.body.plan === 'plan_EAIyF94Yhy1BLB' /* testing */) {
                                accountType = 'Listing';
                            }

                            // If user already has a stripe account
                            if (user.rows[0].stripe_cust_id) {
                                let customerParams = {
                                    source: req.body.token.id,
                                    email: user.rows[0].user_email
                                }

                                // If user is using a stored payment method
                                if (req.body.usePayment && req.body.usePayment !== 'New') {
                                    customerParams = {
                                        default_source: req.body.token.id,
                                        email: user.rows[0].user_email
                                    }
                                }

                                // Update the user's default payment method
                                await stripe.customers.update(user.rows[0].stripe_cust_id, customerParams);

                                // If user is not subscribed
                                if (!user.rows[0].is_subscribed) {
                                    let subscriptionParams = {
                                        customer: user.rows[0].stripe_cust_id,
                                        items: [{plan: req.body.plan}]
                                    }

                                    let now = new Date();
                                    
                                    // If user still have days left on their subscription
                                    if (user.rows[0].subscription_end_date > now) {
                                        // Get the different of subscription end date and today
                                        let dayDiff = Math.ceil(moment.duration(user.rows[0].subscription_end_date - now).asDays());
                                        // Apply the difference to the trial days so user gets billed at the end of their remaining subscription days
                                        subscriptionParams['trial_period_days'] = dayDiff;
                                    }

                                    subscription = await stripe.subscriptions.create(subscriptionParams);

                                    await client.query(`UPDATE users SET is_subscribed = true, subscription_id = $1, plan_id = $2, account_type = $4 WHERE username = $3`, [subscription.id, subscription.plan.id, req.session.user.username, accountType]);
                                }
                            } else {
                                customer = await stripe.customers.create({
                                    source: req.body.token.id,
                                    email: user.rows[0].user_email,
                                });

                                subscription = await stripe.subscriptions.create({
                                    customer: customer.id,
                                    items: [{plan: req.body.plan}]
                                });

                                await client.query(`UPDATE users SET account_type = $3, is_subscribed = true, stripe_cust_id = $1, subscription_id = $4, plan_id = $5, subscription_end_date = current_timestamp + interval '32 days' WHERE username = $2`, [customer.id, req.session.user.username, accountType, subscription.id, subscription.plan.id]);
                            }

                            await client.query('COMMIT')
                            .then(async() => {
                                await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Subscription created', req.session.user.username, 'Subscription']);
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
                        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                        
                        let message = 'An error occurred';

                        if (err.type === 'CUSTOM') {
                            message = err.message;
                        }

                        resp.send({status: 'error', statusMessage: message});
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
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});
            
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
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
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
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_cust_id, user_email FROM users WHERE username = $1`, [req.session.user.username]);

                    if (req.body.saveAddress) {
                        await client.query(`UPDATE user_profiles SET user_address = $1, user_city = $2, user_region = $3, user_country = $4, user_city_code = $5 WHERE user_profile_id = $6`, [req.body.address_line1, req.body.address_city, req.body.address_state, req.body.address_country, req.body.address_zip, req.session.user.user_id]);
                    }

                    if (user && user.rows[0].stripe_cust_id) {
                        let card = await stripe.customers.createSource(user.rows[0].stripe_cust_id, {source: req.body.token.id});

                        let customer = await stripe.customers.retrieve(user.rows[0].stripe_cust_id);

                        await client.query('COMMIT')
                        .then(async() => {
                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Added a payment method ending in ${card.last4}`, req.session.user.username, 'Payment']);
                            resp.send({status: 'success', card: card, defaultSource: customer.default_source});
                        });
                    } else if (user && !user.rows[0].stripe_cust_id) {
                        let customer = await stripe.customers.create({
                            source: req.body.token.id,
                            email: user.rows[0].user_email,
                            shipping: {
                                address_line1: req.body.defaultAddress ? req.body.user.user_address : req.body.address_line1,
                                address_city: req.body.defaultAddress ? req.body.user.user_city : req.body.address_city,
                                address_state: req.body.defaultAddress ? req.body.user.user_region : req.body.address_state,
                                address_country: req.body.defaultAddress ? req.body.user.user_country : req.body.address_country,
                                address_zip: req.body.defaultAddress ? req.body.user.user_city_code : req.body.address_zip
                            }
                        });

                        await client.query(`UPDATE users SET stripe_cust_id = $1 WHERE username = $2`, [customer.id, req.session.user.username]);

                        await client.query('COMMIT')
                        .then(async() => {
                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Added a payment method ending in ${customer.sources.data.last4}`, req.session.user.username, 'Payment']);
                            resp.send({status: 'success', defaultSource: customer.default_source, card: customer.sources.data[0]});
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
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
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
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_cust_id FROM users WHERE username = $1`, [req.session.user.username]);

                    let card = await stripe.customers.updateCard(user.rows[0].stripe_cust_id, req.body.source, {
                        address_line1: req.body.address_line1,
                        address_city: req.body.address_city,
                        address_state: req.body.address_state,
                        address_country: req.body.address_country,
                        address_zip: req.body.address_zip
                    });

                    await client.query('COMMIT')
                    .then(async() => {
                        await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Updated payment method ending in ${card.last4}`, req.session.user.username, 'Payment']);
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
                error.log({name: err.name, message: err.message, origin: 'Stripe updating client card', url: req.url});
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    }
});

app.post('/api/user/payment/default', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_cust_id FROM users WHERE username = $1`, [req.session.user.username]);

                    if (user && user.rows[0].stripe_cust_id) {
                        let customer = await stripe.customers.update(user.rows[0].stripe_cust_id, {default_source: req.body.id});

                        let defaultPayment;

                        for (let source of customer.sources.data) {
                            if (source.id === customer.default_source) {
                                defaultPayment = source.last4;
                            }
                        }

                        await client.query('COMMIT')
                        .then(async() => {
                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Set payment method ending in ${defaultPayment} as default`, req.session.user.username, 'Payment']);
                            resp.send({status: 'success', statusMessage: 'Default payment has been set', defaultSource: customer.default_source});
                        });
                    } else if (user && !user.rows[0].stripe_cust_id) {
                        let error = new Error(`You need to add a payment`);
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
                error.log({name: err.name, message: err.message, origin: 'Setting Stripe default payment', url: req.url});
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
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_cust_id, is_subscribed FROM users WHERE username = $1`, [req.session.user.username]);

                    if (user && user.rows[0].stripe_cust_id) {
                        let customer = await stripe.customers.retrieve(user.rows[0].stripe_cust_id);

                        if (user.rows[0].is_subscribed && customer.sources.data.length === 1) {
                            let error = new Error(`You're subscribed and cannot delete payment`);
                            error.type = 'CUSTOM';
                            throw error;
                        } else if (customer.sources.data.length > 1) {
                            card = await stripe.customers.deleteCard(user.rows[0].stripe_cust_id, req.body.id);

                            if (card.deleted) {
                                customer = await stripe.customers.retrieve(user.rows[0].stripe_cust_id);

                                await client.query('COMMIT')
                                .then(async() => {
                                    await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Deleted a payment method`, req.session.user.username, 'Payment']);
                                    resp.send({status: 'success', statusMessage: 'Payment method deleted', defaultSource: customer.default_source});
                                });
                            } else {
                                let error = new Error('Cannot delete payment method');
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
                error.log({name: err.name, message: err.message, origin: 'Deleting payment method', url: req.url});
                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    }
});

module.exports = app;