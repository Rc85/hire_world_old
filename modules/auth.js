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
    request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
        if (err) console.log(err);

        let response = JSON.parse(res.body);

        if (response.success) {
            if (req.body.agreed) {
                if (req.body.username && !validate.usernameCheck.test(req.body.username)) {
                    resp.send({status: 'error', statusMessage: 'Invalid username'});
                } else if (req.body.password && req.body.password !== req.body.confirmPassword) {
                    resp.send({status: 'error', statusMessage: 'Passwords do not match'});
                } else if (req.body.confirmPassword && !validate.passwordCheck.test(req.body.password)) {
                    resp.send({status: 'error', statusMessage: 'Passwords too short or long'});
                } else if (req.body.confirmEmail && req.body.email !== req.body.confirmEmail) {
                    resp.send({status: 'error', statusMessage: 'Emails do not match'});
                } else if (req.body.email && !validate.emailCheck.test(req.body.email)) {
                    resp.send({status: 'error', statusMessage: 'Invalid email format'});
                } else if (req.body.firstName && !validate.nameCheck.test(req.body.firstName)) {
                    resp.send({status: 'error', statusMessage: 'Invalid first name'});
                } else if (req.body.lastName && !validate.nameCheck.test(req.body.lastName)) {
                    resp.send({status: 'error', statusMessage: 'Invalid last name'});
                } else if (req.body.firstName && validate.blankCheck.test(req.body.firstName)) {
                    resp.send({status: 'error', statusMessage: 'First name cannot be blank'});
                } else if (req.body.lastName && validate.blankCheck.test(req.body.lastName)) {
                    resp.send({status: 'error', statusMessage: 'Last name cannot be blank'});
                } else if (req.body.country && validate.blankCheck.test(req.body.country)) {
                    resp.send({status: 'error', statusMessage: 'Please select a country'});
                } else if (req.body.region && validate.blankCheck.test(req.body.region)) {
                    resp.send({status: 'error', statusMessage: 'Please select a region'});
                } else if (req.body.city && validate.blankCheck.test(req.body.city)) {
                    resp.send({status: 'error', statusMessage: 'Please enter your city name'});
                } else if (req.body.country && !validate.locationCheck.test(req.body.country)) {
                    resp.send({status: 'error', statusMessage: 'Invalid country'});
                } else if (req.body.region && !validate.locationCheck.test(req.body.region)) {
                    resp.send({status: 'error', statusMessage: 'Invalid region'});
                } else if (req.body.city && !validate.locationCheck.test(req.body.city)) {
                    resp.send({status: 'error', statusMessage: 'Invalid city'});
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

                                    let user = await client.query(`INSERT INTO users (username, user_password, user_email, registration_key) VALUES ($1, $2, $3, $4) RETURNING user_id, username`, [req.body.username, result, req.body.email, regKeyString]);

                                    await client.query(`INSERT INTO user_profiles (user_profile_id, user_firstname, user_lastname, user_title, user_country, user_region, user_city) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [user.rows[0].user_id, req.body.firstName, req.body.lastName, req.body.title, req.body.country, req.body.region, req.body.city]);
                                    await client.query(`INSERT INTO user_settings (user_setting_id) VALUES ($1)`, [user.rows[0].user_id]);

                                    let message = {
                                        to: req.body.email,
                                        from: 'admin@hireworld.ca',
                                        subject: 'Welcome to HireWorld',
                                        templateId: 'd-4994ab4fd122407ea5ba295506fc4b2a',
                                        dynamicTemplateData: {
                                            url: process.env.SITE_URL,
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
                resp.send({status: 'error', statusMessage: 'Your agreement is required'});
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

                    if (req.body.username) {
                        let auth = await client.query(`SELECT * FROM users WHERE LOWER(username) = LOWER($1)`, [req.body.username]);
                    
                        // If user exists
                        if (auth && auth.rows.length === 1) {
                            // Get user's ban date and today's date
                            let banEndDate = await client.query(`SELECT ban_end_date FROM user_bans WHERE banned_user = $1 ORDER BY ban_id DESC LIMIT 1`, [req.body.username]);
                            let today = new Date();
                            // If user is banned, deny access
                            if (auth.rows[0].user_status === 'Ban') {
                                let error = new Error(`Your account has been permanently banned`);
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                throw errObj
                            // if users haven't activated their account
                            } else if (auth.rows[0].user_status === 'Pending') {
                                let error = new Error(`You need to activate your account`);
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack, status: 'access error'};
                                throw errObj
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
                                    return;
                                }
                            });
                        } else {
                            await client.query('ROLLBACK');
                            resp.send({status: 'error', statusMessage: 'User not found'});
                            return;
                        }    
                    } else {
                        resp.send({status: 'not logged in'});
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

app.post('/api/auth/logout', (req, resp) => {
    req.session = null;

    resp.send({status: 'logged out'});
});

module.exports = app;