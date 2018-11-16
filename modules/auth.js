const db = require('./db');
const app = require('express').Router();
const bcrypt = require('bcrypt');
const validate = require('./utils/validate');
const moment = require('moment');
const cryptoJS = require('crypto-js');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/auth/register', (req, resp) => {
    console.log(req.body);

    if (req.body.agreed) {
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
                if (err) { console.log(err); }

                db.connect((err, client, done) => {
                    if (err) console.log(err);
                    
                    (async() => {
                        try {
                            await client.query(`BEGIN`);

                            let registrationKey = cryptoJS.AES.encrypt(req.body.email, 'registering for m-ploy');

                            let user = await client.query(`INSERT INTO users (username, user_password, user_email, account_type, registration_key) VALUES ($1, $2, $3, $4, $5) RETURNING user_id`, [req.body.username, result, req.body.email, req.body.accountType, registrationKey.toString()]);

                            await client.query(`INSERT INTO user_profiles (user_profile_id, user_firstname, user_lastname, user_country, user_region, user_city, user_title) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [user.rows[0].user_id, req.body.firstName, req.body.lastName, req.body.country, req.body.region, req.body.city, req.body.title]);
                            await client.query(`INSERT INTO user_settings (user_setting_id) VALUES ($1)`, [user.rows[0].user_id]);

                            let message = {
                                to: req.body.email,
                                from: 'support@m-ploy.org',
                                subject: 'Welcome to M-ploy',
                                html: `<div style="text-align: center;">In order to start using M-ploy, you need to activate your account. Click on the button below to activate your account.

                                <p><a href='http://localhost:9999/activate-account?key=${registrationKey.toString()}'>
                                    <button type='button' style="background: #007bff; padding: 10px; border-radius: 0.25rem; color: #fff; border: 0px; cursor: pointer;">Activate</button>
                                </a></p>
                                
                                <p><strong>You have 24 hours to activate your account.</strong> You will need to <a href='http://localhost:9999/resend-confirmation'>request a new confirmation email</a> if 24 hours have past.</p>
                                
                                <p><small><strong>Note:</strong> New confirmation emails may end up in your spam folder.</small></p>
                                
                                <p><small><a href='https://www.m-ploy.org'>M-ploy.org</a></div>`
                            }

                            sgMail.send(message);

                            await client.query(`COMMIT`)
                            .then(() => resp.send({status: 'success', statusMessage: 'Registration successful. Please check your email to confirm your account'}));
                        } catch (e) {
                            await client.query(`ROLLBACK`);
                            throw e;
                        } finally {
                            done();
                        }
                    })()
                    .catch(err => {
                        console.log(err);
                        
                        if (err.code === '23505') {
                            if (err.constraint === 'unique_email') {
                                resp.send({status: 'error', statusMessage: 'Email already taken'});
                            } else if (err.constraint === 'unique_username') {
                                resp.send({status: 'error', statusMessage: 'Username already taken'});
                            }
                        } else if (err.code === '23502') {
                            resp.send({status: 'error', statusMessage: 'All fields are required'});
                        } else {
                            resp.send({status: 'error', statusMessage: 'An error occurred'});
                        }
                    });
                });
            });
        }
    } else {
        resp.send({status: 'error', statusMessage: 'You must agree to the terms of service'});
    }
});

app.post('/api/auth/login', async(req, resp, next) => {
    if (req.session.user) {
        next();
    } else {
        let auth = await db.query(`SELECT * FROM users WHERE username = $1`, [req.body.username])
        .then(result => {
            return result;
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });

        let banEndDate = await db.query(`SELECT ban_end_date FROM user_bans WHERE banned_user = $1 ORDER BY ban_id DESC LIMIT 1`, [req.body.username])
        .then(result => {
            if (result && result.rows.length === 1) {
                return result.rows[0].ban_end_date
            }
        })
        .catch(err => console.log(err));

        let today = new Date();

        if (auth && auth.rows.length === 1) {
            if (today < banEndDate) {
                if (auth.rows[0].user_status === 'Ban') {
                    resp.send({status: 'access error', statusMessage: 'Your account has been permanently banned'});
                } else if (auth.rows[0].user_status === 'Suspend') {
                    let date = moment(banEndDate).format('MMM DD, YYYY');

                    resp.send({status: 'access error', statusMessage: `Your account has been temporarily banned. You will have access again after ${date}`});
                }
            } else if (today >= banEndDate) {
                await db.query(`UPDATE users SET user_status = 'Active' WHERE username = $1`, [req.body.username]);
            }
            
            if (auth.rows[0].user_status === 'Pending') {
                resp.send({status: 'access error', statusMessage: `You need to activate your account.`});
            } else {
                bcrypt.compare(req.body.password, auth.rows[0].user_password, async(err, match) => {
                    if (err) {
                        console.log(err);
                        resp.send({status: 'error', statusMessage: 'An error occurred'});
                    }

                    if (match) {
                        await db.query(`UPDATE users SET user_last_login = $1, user_this_login = current_timestamp WHERE user_id = $2`, [auth.rows[0].user_this_login, auth.rows[0].user_id])
                        .catch(err => console.log(err));

                        let session = {
                            user_id: auth.rows[0].user_id,
                            username: auth.rows[0].username,
                            accountType: auth.rows[0].account_type,
                            userLevel: auth.rows[0].user_level
                        }

                        req.session.user = session;
                        resp.send({status: 'success'});
                    } else {
                        resp.send({status: 'error', statusMessage: 'Incorrect username or password'});
                    }
                });
            }
        } else {
            resp.send({status: 'error', statusMessage: 'Incorrect username or password'});
        }
    }
});

app.post('/api/auth/login', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query(`SELECT users.user_id, users.username, users.user_email, users.user_last_login, user_profiles.*, user_settings.* FROM users
        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
        LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
        WHERE users.user_id = $1`, [req.session.user.user_id]);

        let newMessageCount = await db.query(`SELECT COUNT(job_id) AS message_count FROM jobs WHERE job_status = 'New' AND job_user = $1`, [req.session.user.username]);

        let notifications = await db.query(`SELECT * FROM notifications WHERE notification_recipient = $1 AND notification_status = 'New'`, [req.session.user.username]);

        if (user && user.rows.length === 1) {
            delete user.rows[0].user_id;
            
            resp.send({status: 'get session success', user: user.rows[0], messageCount: newMessageCount.rows[0].message_count, notifications: notifications.rows});
        } else {
            resp.send({status: 'get session fail'});
        }
    } else {
        resp.send({status: 'get session fail'});
    }
});

app.post('/api/auth/logout', (req, resp) => {
    req.session = null;

    resp.send({status: 'logged out'});
});

module.exports = app;