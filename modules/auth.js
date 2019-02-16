const db = require('./db');
const app = require('express').Router();
const bcrypt = require('bcrypt');
const validate = require('./utils/validate');
const cryptoJS = require('crypto-js');
const sgMail = require('@sendgrid/mail');
const error = require('./utils/error-handler');
const request = require('request');
const controller = require('./utils/controller');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/auth/register', (req, resp) => {
    request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.RECAPTCHA_SECRET, response: req.body['g-recaptcha-response']}}, (err, res, body) => {
        if (err) console.log(err);

        let response = JSON.parse(res.body);

        if (response.success) {
            if (req.body.agreed) {
                if (req.body.legal) {
                    if (!validate.usernameCheck.test(req.body.username)) {
                        resp.send({status: 'error', statusMessage: 'Invalid username'});
                    } else if (req.body.password !== req.body.confirmPassword) {
                        resp.send({status: 'error', statusMessage: 'Passwords do not match'});
                    } else if (!validate.passwordCheck.test(req.body.password)) {
                        resp.send({status: 'error', statusMessage: 'Passwords too short or long'});
                    } else if (req.body.email !== req.body.confirmEmail) {
                        resp.send({status: 'error', statusMessage: 'Emails do not match'});
                    } else if (!validate.emailCheck.test(req.body.email)) {
                        resp.send({status: 'error', statusMessage: 'Invalid email format'});
                    } else if (!validate.nameCheck.test(req.body.firstName)) {
                        resp.send({status: 'error', statusMessage: 'Invalid first name'});
                    } else if (!validate.nameCheck.test(req.body.lastName)) {
                        resp.send({status: 'error', statusMessage: 'Invalid last name'});
                    } else if (validate.blankCheck.test(req.body.firstName)) {
                        resp.send({status: 'error', statusMessage: 'First name cannot be blank'});
                    } else if (validate.blankCheck.test(req.body.lastName)) {
                        resp.send({status: 'error', statusMessage: 'Last name cannot be blank'});
                    } else if (validate.blankCheck.test(req.body.country)) {
                        resp.send({status: 'error', statusMessage: 'Please select a country'});
                    } else if (validate.blankCheck.test(req.body.region)) {
                        resp.send({status: 'error', statusMessage: 'Please select a region'});
                    } else if (validate.blankCheck.test(req.body.city)) {
                        resp.send({status: 'error', statusMessage: 'Please enter your city name'});
                    } else {
                        bcrypt.hash(req.body.password, 10, (err, result) => {
                            if (err) console.log(err);

                            db.connect((err, client, done) => {
                                if (err) console.log(err);
                                
                                (async() => {
                                    try {
                                        await client.query(`BEGIN`);

                                        let encrypted = cryptoJS.AES.encrypt(req.body.email, 'registering for hireworld');
                                        let regKeyString = encrypted.toString();
                                        let registrationKey = encodeURIComponent(regKeyString);

                                        let user = await client.query(`INSERT INTO users (username, user_password, user_email, account_type, registration_key) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username`, [req.body.username, result, req.body.email, 'User', regKeyString]);

                                        await client.query(`INSERT INTO user_profiles (user_profile_id, user_firstname, user_lastname, user_title) VALUES ($1, $2, $3, $4)`, [user.rows[0].user_id, req.body.firstName, req.body.lastName, req.body.title]);
                                        await client.query(`INSERT INTO user_settings (user_setting_id) VALUES ($1)`, [user.rows[0].user_id]);

                                        let message = {
                                            to: req.body.email,
                                            from: 'admin@hireworld.ca',
                                            subject: 'Welcome to HireWorld',
                                            templateId: 'd-4994ab4fd122407ea5ba295506fc4b2a',
                                            dynamicTemplateData: {
                                                url: process.env.NODE_ENV === 'development' ? `${process.env.DEV_SITE_URL}` : `${process.env.SITE_URL}`,
                                                regkey: registrationKey
                                            },
                                            trackingSettings: {
                                                clickTracking: {
                                                    enable: false
                                                }
                                            }
                                        }

                                        sgMail.send(message);

                                        await client.query(`COMMIT`)
                                        .then(async() => {
                                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Account created', user.rows[0].username, 'Account']);
                                            resp.send({status: 'success', statusMessage: 'Registration successful. Please check your email to confirm your account'});
                                        });
                                    } catch (e) {
                                        await client.query(`ROLLBACK`);
                                        throw e;
                                    } finally {
                                        done();
                                    }
                                })()
                                .catch(err => {
                                     console.log(err);
                                    
                                    let message = `An error occurred`;
                                    
                                    if (err.code === '23505') {
                                        if (err.constraint === 'unique_email') {
                                            message = 'Email already taken';
                                        } else if (err.constraint === 'unique_username') {
                                            message = 'Username already taken';
                                        }
                                    } else if (err.code === '23502') {
                                        message = 'All fields are required';
                                    }

                                    resp.send({status: 'error', statusMessage: message});
                                });
                            });
                        });
                    }
                } else {
                    resp.send({status: 'error', statusMessage: 'You must be 18 years or older'});
                }
            } else {
                resp.send({status: 'error', statusMessage: 'You must agree to the terms of service'});
            }
        } else {
            resp.send({status: 'error', statusMessage: 'You are not human'});
        }
    });
});

app.post('/api/auth/login', async(req, resp, next) => {
    if (req.session.user) {
        next();
    } else {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let auth = await client.query(`SELECT * FROM users WHERE LOWER(username) = LOWER($1)`, [req.body.username]);
                   
                    // If user exists
                    if (auth && auth.rows.length === 1) {
                        // Get user's ban date and today's date
                        let banEndDate = await client.query(`SELECT ban_end_date FROM user_bans WHERE banned_user = $1 ORDER BY ban_id DESC LIMIT 1`, [req.body.username]);
                        let today = new Date();
                        // If user is banned, deny access
                        if (auth.rows[0].user_status === 'Ban') {
                            let error = new Error(`Your account has been permanently banned`);
                            error.type = 'CUSTOM';
                            error.status = 'access error';
                            throw error;
                        // if users haven't activated their account
                        } else if (auth.rows[0].user_status === 'Pending') {
                            let error = new Error(`You need to activate your account`);
                            error.type = 'CUSTOM';
                            error.status = 'error';
                            throw error;
                        // If user is temporarily banned, check if today is after ban date. If it is, set user status to 'Active'
                        } else if (auth.rows[0].user_status === 'Suspend') {
                            if (today >= banEndDate) {
                                await client.query(`UPDATE users SET user_status = 'Active' WHERE username = $1`, [req.body.username]);
                            }
                        }

                        // Compare password
                        bcrypt.compare(req.body.password, auth.rows[0].user_password, async(err, match) => {
                            if (err) console.log(err);

                            if (match) {
                                let now = new Date();

                                if (now > auth.rows[0].subscription_end_date) {
                                    await client.query(`UPDATE users SET account_type = 'User', subscription_id = null, plan_id = null WHERE user_id = $1`, [auth.rows[0].user_id]);
                                }
                                
                                await client.query(`UPDATE users SET user_last_login = $1, user_this_login = current_timestamp WHERE user_id = $2`, [auth.rows[0].user_this_login, auth.rows[0].user_id])
                                // .catch(err => console.log(err);

                                let session = {
                                    user_id: auth.rows[0].user_id,
                                    username: auth.rows[0].username
                                }

                                req.session.user = session;
                                
                                await client.query('COMMIT')
                                .then(() => next());
                            } else {
                                await client.query('ROLLBACK');
                                resp.send({status: 'error', statusMessage: 'Incorrect username or password'});
                            }
                        });
                    } else {
                        let error = new Error('User not found');
                        let errorObj = {error, stack: error.stack, type: 'CUSTOM'}
                        throw errorObj;
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
        }); 
    }
},
async(req, resp) => {
    if (req.session.user) {
        /* let user = await db.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
        LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
        LEFT JOIN user_listings ON users.username = user_listings.listing_user
        WHERE users.user_id = $1`, [req.session.user.user_id]); */

        let user = await controller.session.retrieve(false, req.session.user.user_id);

        if (user) {    
            resp.send({status: 'get session success', user: user});
        } else {
            resp.send({status: 'get session fail', statusMessage: `The user does not exist`});
        }
    } else {
        resp.send({status: 'get session fail', statusMessage: `You're not logged in`});
    }
});

/* app.get('/api/auth/privilege', (req, resp) => {
    if (req.session.user) {
        db.query(`SELECT user_level FROM users WHERE username = $1`, [req.session.user.username])
        .then(result => {
            if (result.rows[0].user_level > 90) {
                resp.send({status: 'success'});
            } else {
                resp.send({status: 'access error', statusMessage: `You're not authorized to access this area`});
            }
        })
        .catch(err => {
             console.log(err);
            resp.send({status: 'error', statusMessage: 'An errorr occurred'});
        });
    }
}); */

app.post('/api/auth/logout', (req, resp) => {
    req.session = null;

    resp.send({status: 'logged out'});
});

module.exports = app;