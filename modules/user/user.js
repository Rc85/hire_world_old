const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY);
const validate = require('../utils/validate');

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

                            console.log(req.file);
                    
                            if (req.file) {
                                filePath = `/${req.file.destination.substring(2)}/${req.file.filename}`;
                            } else {
                                let error = new Error('No file found');
                                error.type = 'CUSTOM';
                                throw error;
                            }

                            await client.query(`UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2`, [filePath, req.session.user.user_id]);

                            let user = await client.query(`SELECT * FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id WHERE users.user_id = $1`, [req.session.user.user_id]);

                            delete user.rows[0].user_password;
                            delete user.rows[0].user_level;

                            if (user.rows[0].hide_email) {
                                delete user.rows[0].user_email;
                            }

                            if (!user.rows[0].display_fullname) {
                                delete user.rows[0].user_firstname;
                                delete user.rows[0].user_lastname;
                            }

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', user: user.rows[0]}));
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
        await db.query('UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2', ['/images/profile.png', req.session.user.user_id]);

        await db.query(`SELECT * FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id WHERE users.user_id = $1`, [req.session.user.user_id])
        .then(result => {
            if (result !== undefined && result.rowCount === 1) {
                delete result.rows[0].user_password;
                delete result.rows[0].user_level;

                if (result.rows[0].hide_email) {
                    delete result.rows[0].user_email;
                }

                if (!result.rows[0].display_fullname) {
                    delete result.rows[0].user_firstname;
                    delete result.rows[0].user_lastname;
                }

                resp.send({status: 'success', user: result.rows[0]});
            } else if (result.rowCount === 0) {
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            }
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
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
            type = 'user_twtitter';
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

                        let user = await client.query(`SELECT * FROM users
                        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                        LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
                        WHERE users.user_id = $1`, [req.session.user.user_id]);

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success', user: user.rows[0]}));
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
    //let searchValue = new RegExp('\\b' + req.body.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');

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

                        await client.query(`INSERT INTO business_hours (monday, tuesday, wednesday, thursday, friday, saturday, sunday, business_owner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (business_owner) DO UPDATE SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7`, [req.body.mon, req.body.tue, req.body.wed, req.body.thu, req.body.fri, req.body.sat, req.body.sun, req.session.user.username]);

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
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
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

app.post('/api/user/payment/submit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    if (!req.body.defaultAddress) {
                        if (req.body.country && !validate.locationCheck.test(req.body.country)) {
                            let error = new Error('Country is required');
                            error.type = 'CUSTOM';
                            throw error;
                        } else if (req.body.region && !validate.locationCheck.test(req.body.region)) {
                            let error = new Error('Region is required');
                            error.type = 'CUSTOM';
                            throw error;
                        } else if (req.body.city && !validate.locationCheck.test(req.body.city)) {
                            let error = new Error('City is required');
                            error.type = 'CUSTOM';
                            throw error;
                        } else if (req.body.name && !validate.fullNameCheck.test(req.body.name)) {
                            let error = new Error('Name is required');
                            error.type = 'CUSTOM';
                            throw error;
                        } else if (req.body.cityCode && !validate.cityCodeCheck.test(req.body.cityCode)) {
                            let error = new Error('Postal/Zip code is required');
                            error.type = 'CUSTOM';
                            throw error;
                        }
                    }
                
                    await client.query('BEGIN');

                    let address, city, region, country, cityCode;

                    let user = await client.query(`SELECT * FROM users
                    LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                    WHERE username = $1`, [req.session.user.username]);

                    if (req.body.defaultAddress) {
                        if (user.rows[0].user_address) {
                            address = user.rows[0].user_address;
                        } else {
                            let error = new Error('Address is not set');
                            error.type = 'CUSTOM';
                            throw error;
                        }

                        if (user.rows[0].user_city) {
                            city = user.rows[0].user_city;
                        } else {
                            let error = new Error('City is not set');
                            error.type = 'CUSTOM';
                            throw error;
                        }

                        if (user.rows[0].user_region) {
                            region = user.rows[0].user_region;
                        } else {
                            let error = new Error('State/Province is not set');
                            error.type = 'CUSTOM';
                            throw error;
                        }

                        if (user.rows[0].user_country) {
                            country = user.rows[0].user_country;
                        } else {
                            let error = new Error('Country is not set');
                            error.type = 'CUSTOM';
                            throw error;
                        }

                        if (user.rows[0].user_city_code) {
                            cityCode = user.rows[0].user_city_code;
                        } else {
                            let error = new Error('Postal/Zip Code not set');
                            error.type = 'CUSTOM';
                            throw error;
                        }
                    } else {
                        address = req.body.address;
                        city = req.body.city;
                        region = req.body.region;
                        country = req.body.country;
                        cityCode = req.body.cityCode;

                        if (req.body.saveAddress) {
                            await client.query(`UPDATE user_profiles SET user_address = $1, user_city = $2, user_region = $3, user_country = $4, user_city_code = $5 WHERE user_profile_id = $6`, [address, city, region, country, cityCode, req.session.user.user_id]);
                        }
                    }

                    let customer, subscription;

                    if (user.rows[0].stripe_cust_id) {
                        await stripe.customers.update(user.rows[0].stripe_cust_id, {
                            source: req.body.token.id,
                            shipping: {
                                name: req.body.name,
                                address: {
                                    line1: address,
                                    city: city,
                                    country: country,
                                    postal_code: cityCode,
                                    state: region
                                }
                            }
                        });

                        if (!user.rows[0].is_subscribed) {
                            let subscriptionParams = {
                                customer: user.rows[0].stripe_cust_id,
                                items: [{plan: req.body.plan}]
                            }

                            let now = new Date();

                            if (user.rows[0].subscription_end_date > now) {
                                subscriptionParams['trial_period_days'] = now + user.rows[0].subscription_end_date;
                               
                                console.log(user.rows[0].subscription_end_date > now);
                                console.log(now + user.rows[0].subscription_end_date);
                            }

                            subscription = await stripe.subscriptions.create(subscriptionParams);
                        }
                    } else {
                        customer = await stripe.customers.create({
                            email: user.rows[0].user_email,
                            source: req.body.token.id,
                            shipping: {
                                name: req.body.name,
                                address: {
                                    line1: address,
                                    city: city,
                                    country: country,
                                    postal_code: cityCode,
                                    state: region
                                }
                            }
                        });

                        let accountType;

                        if (req.body.plan === 'plan_EAIyF94Yhy1BLB') {
                            accountType = 'Listing';
                        }

                        subscription = await stripe.subscriptions.create({
                            customer: customer.id,
                            items: [{plan: req.body.plan}]
                        });

                        await client.query(`UPDATE users SET account_type = $3, is_subscribed = true, stripe_cust_id = $1, subscription_id = $4, subscription_end_date = current_timestamp + interval '32 days' WHERE username = $2`, [customer.id, req.session.user.username, accountType, subscription.id]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success'}));
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
                
                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
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
                        await client.query(`UPDATE users SET account_type = 'User', is_subscribed = false, subscription_id = null WHERE username = $1`, [req.session.user.username]);
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success'}));
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

                    let user = await client.query(`SELECT stripe_cust_id FROM users WHERE username = $1`, [req.session.user.username]);

                    if (req.body.saveAddress) {
                        await client.query(`UPDATE user_profiles SET user_address = $1, user_city = $2, user_region = $3, user_country = $4, user_city_code = $5 WHERE user_id = $6`, [req.body.address, req.body.city, req.body.region, req.body.country, req.body.cityCode, req.session.user.user_id]);
                    }

                    await stripe.customers.createSource(user.rows[0].stripe_cust_id, {source: req.body.token.id}, async(err, card) => {
                        if (err) throw err;

                        console.log(card);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', card: card}));
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
        resp.send({status: `You're not logged in`});
    }
});

app.post('/api/user/payment/edit', (req, resp) => {
    if (req.session.user) {
        console.log(req.body);
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let user = await client.query(`SELECT stripe_cust_id FROM users WHERE username = $1`, [req.session.user.username]);

                    await stripe.customers.updateCard(user.rows[0].stripe_cust_id, req.body.source, {
                        address_line1: req.body.address_line1,
                        address_city: req.body.address_city,
                        address_state: req.body.address_state,
                        address_country: req.body.address_country,
                        address_zip: req.body.address_zip
                    }, async(err, card) => {
                        if (err) throw err;

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'Card updated', card: card}));
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

module.exports = app;