const db = require('../pg_conf');
const app = require('express').Router();
const bcrypt = require('bcrypt');
const validate = require('./utils/validate');
const cryptoJS = require('crypto-js');
const sgMail = require('@sendgrid/mail');
const error = require('./utils/error-handler');
const request = require('request');
const users = require('../controllers/users');
const emails = require('../controllers/emails');
const fs = require('fs');
const authenticate = require('../middlewares/auth');
const speakeasy = require('speakeasy');
const qrCode = require('qrcode');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/auth/register', (req, resp) => {
    request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
        if (err) error.log(err, req, resp);

        let response = JSON.parse(res.body);

        if (response.success) {
            if (req.body.agreed) {
                if (req.body.username && (/admin/.test(req.body.username) || /hireworld/.test(req.body.username))) {
                    resp.send({status: 'error', statusMessage: 'That username is now allowed'});
                } else if (req.body.username && !validate.usernameCheck.test(req.body.username)) {
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
                        if (err) error.log(err, req, resp);

                        db.connect((err, client, done) => {
                            if (err) error.log(err, req, resp);
                            
                            (async() => {
                                try {
                                    await client.query(`BEGIN`);

                                    if (req.body.key) {
                                        let referral = await client.query(`SELECT * FROM referrals WHERE referred_email = $1 AND referral_key = $2`, [req.body.email, req.body.key]);
            
                                        if (referral && referral.rows.length === 1) {
                                            await client.query(`UPDATE referrals SET referral_accepted_date = current_timestamp, referral_status = 'Activated' WHERE referral_id = $1`, [referral.rows[0].referral_id]);
                                        } else {
                                            let error = new Error(`The email does not match the referred email`);
                                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                            throw errObj;
                                        }
                                    }

                                    let encrypted = cryptoJS.AES.encrypt(req.body.email, process.env.ACTIVATE_ACCOUNT_SECRET);
                                    let regKeyString = encrypted.toString();
                                    let registrationKey = encodeURIComponent(regKeyString);

                                    let user = await client.query(`INSERT INTO users (username, user_password, user_email, registration_key) VALUES ($1, $2, $3, $4) RETURNING user_id, username`, [req.body.username, result, req.body.email, regKeyString]);

                                    await client.query(`INSERT INTO user_profiles (user_profile_id, user_firstname, user_lastname, user_title, user_country, user_region, user_city) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [user.rows[0].user_id, req.body.firstName, req.body.lastName, req.body.title, req.body.country, req.body.region, req.body.city]);
                                    await client.query(`INSERT INTO user_settings (user_setting_id) VALUES ($1)`, [user.rows[0].user_id]);

                                    let message = {
                                        to: req.body.email,
                                        from: {
                                            name: 'Hire World',
                                            email: 'admin@hireworld.ca'
                                        },
                                        subject: 'Welcome to Hire World',
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

                                    let dirExist = fs.existsSync(`./user_files/${user.rows[0].user_id}`);

                                    if (!dirExist) {
                                        fs.mkdirSync(`./user_files/${user.rows[0].user_id}`);
                                    }

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
                                return error.log(err, req, resp);
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

app.post('/api/auth/login', authenticate, async(req, resp) => {
    let user = await users.session.retrieve(false, req.session.user.user_id);

    resp.send({status: 'success', user: user});
});

app.post('/api/auth/2fa/login', async(req, resp) => {
    let auth = await db.query(`SELECT username, two_fa_key, user_this_login FROM users WHERE user_id = $1`, [req.session.auth.user_id]);

    let verified = speakeasy.totp.verify({
        secret: auth.rows[0].two_fa_key,
        encoding: 'base32',
        token: req.body.code,
        window: 2
    });

    if (verified) {
        req.session.user = {
            user_id: req.session.auth.user_id,
            username: auth.rows[0].username
        }

        await db.query(`UPDATE users SET user_last_login = $1, user_this_login = current_timestamp WHERE user_id = $2`, [auth.rows[0].user_this_login, req.session.auth.user_id]);
        let user = await users.session.retrieve(false, req.session.auth.user_id);

        req.session.auth = null;

        resp.send({status: 'success', user: user});
    } else {
        resp.send({status: 'error', statusMessage: 'Incorrect code'});
    }
});

app.all('/api/auth/logout', (req, resp) => {
    req.session.destroy();

    resp.send({status: 'error', statusMessage: `Logged out`});
});

app.post('/api/resend-confirmation', async(req, resp) => {
    request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.RECAPTCHA_SECRET, response: req.body.verified}}, async(err, res, body) => {
        if (err) error.log(err, req, resp);

        let response = JSON.parse(res.body);

        if (response.success) {
            db.connect((err, client, done) => {
                if (err) error.log(err, req, resp);

                (async() => {
                    try {
                        client.query('BEGIN');

                        let user = await client.query(`SELECT user_id, user_status FROM users WHERE user_email = $1`, [req.body.email]);

                        if (user && user.rows.length === 1 && user.rows[0].user_status === 'Pending') {
                            let encrypted = cryptoJS.AES.encrypt(req.body.email, process.env.ACTIVATE_ACCOUNT_SECRET);
                            let regKeyString = encrypted.toString();
                            let registrationKey = encodeURIComponent(regKeyString);
                            
                            let message = {
                                to: req.body.email,
                                from: {
                                    name: 'Hire World',
                                    email: 'admin@hireworld.ca'
                                },
                                subject: 'Reset Password',
                                templateId: 'd-d299977ec2404a5d9952b08a21576be5',
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

                            await client.query(`UPDATE users SET registration_key = $1, reg_key_expire_date = current_timestamp + interval '1' day WHERE user_id = $2`, [regKeyString, user.rows[0].user_id])
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
                .catch(err => error.log(err, req, resp));
            });
        } else {
            resp.send({status: 'error', statusMessage: `You're not human`});
        }
    });
});

app.post('/api/activate-account', async(req, resp) => {
    if (req.session.user) {
        req.session = null;
    }
    
    let registrationKey = decodeURIComponent(req.body.key);

    let user = await db.query(`SELECT username, registration_key, reg_key_expire_date, user_status, user_email, user_id FROM users WHERE registration_key = $1 AND user_status = 'Pending'`, [registrationKey])

    if (user && user.rows.length === 1) {
        if (new Date(user.rows[0].reg_key_expire_date) < new Date) {
            resp.send({status: 'error', statusMessage: 'The link has expired'});
        } else {
            let decrypted = cryptoJS.AES.decrypt(registrationKey, process.env.ACTIVATE_ACCOUNT_SECRET);

            if (decrypted.toString(cryptoJS.enc.Utf8) === user.rows[0].user_email) {
                await db.query(`UPDATE users SET user_status = 'Active', activation_date = current_timestamp WHERE user_id = $1`, [user.rows[0].user_id])
                .then(result => {
                    if (result && result.rowCount === 1) {
                        resp.send({status: 'success', statusMessage: `Your account has been activated`});
                    }
                })
            } else {
                resp.send({status: 'error', statusMessage: 'Failed to activated account. Please try again or contact an administrator.'})
            }
        }
    } else {
        resp.send({status: 'error', statusMessage: `The account requiring activation does not exist`});
    }
});

app.post('/api/forgot-password', async(req, resp) => {
    request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.RECAPTCHA_SECRET, response: req.body.verified}}, async(err, res, body) => {
        if (err) error.log(err, req, resp);

        let response = JSON.parse(res.body);

        if (response.success) {
            emails.password.reset(req.body.email, (err, message) => {
                if (err && message) {
                    let error = new Error(message);
                    let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                    error.log(errObj, req, resp);
                } else if (err && !message) {
                    error.log(err, req, resp);
                } else {
                    resp.send({status: 'success'});
                }
            });
        } else {
            resp.send({status: 'error', statusMessage: `You're not human`});
        }
    });
});

app.post('/api/reset-password', async(req, resp) => {
    if (req.body.password === req.body.confirm) {
        let resetKey = decodeURIComponent(req.body.key);

        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let key = await client.query(`SELECT reset_user, reset_key, reset_expires FROM reset_passwords WHERE reset_key = $1`, [resetKey]);

                    if (key.rows.length === 1) {
                        if (new Date(key.rows[0].reset_expires) < new Date) {
                            let error = new Error('The request has expired, please request a new one');
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errObj;
                        } else {
                            bcrypt.hash(req.body.password, 10, async(err, result) => {
                                if (err) {
                                    let error = new Error('Please contact an administrator');
                                    let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                    throw errObj;
                                } else {
                                    await client.query(`UPDATE users SET user_password = $1 WHERE username = $2`, [result, key.rows[0].reset_user]);
                                    await client.query(`DELETE FROM reset_passwords WHERE reset_key = $1`, [resetKey]);
                                }
                            });

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success'}));
                        }
                    } else {
                        let error = new Error('Reset request does not exist');
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
    }
});

app.post('/api/auth/get/2fa', authenticate, async(req, resp) => {
    let user = await db.query(`SELECT user_email FROM users WHERE username = $1`, [req.session.user.username]);
    let secret = speakeasy.generateSecret();
    let url = speakeasy.otpauthURL({secret: secret.ascii, label: `Hire World (${user.rows[0].user_email})`});

    req.session.user.secret = secret;

    qrCode.toDataURL(url, function(err, data_url) {
        if (err) return error.log(err, req, resp);

        resp.send({status: 'success', imageUrl: data_url});
    });
});

app.post('/api/auth/verify/2fa', authenticate, async(req, resp) => {
    let verified = speakeasy.totp.verify({
        secret: req.session.user.secret.base32,
        encoding: 'base32',
        token: req.body.code,
        window: 2
    });

    if (verified) {
        await db.query(`UPDATE users SET two_fa_key = $1, two_fa_enabled = true WHERE username = $2`, [req.session.user.secret.base32, req.session.user.username])
        .then(async result => {
            if (result && result.rowCount === 1) {
                let user = await users.session.retrieve(false, req.session.user.user_id);
                resp.send({status: 'success', statusMessage: 'Two-factor authentication enabled', user: user});
            } else {
                resp.send({status: 'error', statusMessage: 'Fail to save'});
            }
        })
        .catch(err => {
            return error.log(err, req, resp);
        });
    } else {
        resp.send({status: 'error', statusMessage: 'Incorrect code'});
    }
});

app.post('/api/auth/disable/2fa', authenticate, async(req, resp) => {
    let user = await db.query(`SELECT user_password, two_fa_key FROM users WHERE username = $1`, [req.session.user.username]);

    let verified = speakeasy.totp.verify({
        secret: user.rows[0].two_fa_key,
        encoding: 'base32',
        token: req.body.code,
        window: 2
    });
    
    if (verified) {
        bcrypt.compare(req.body.password, user.rows[0].user_password, async(err, matched) => {
            if (err) return error.log(err, req, resp);

            if (matched) {
                await db.query(`UPDATE users SET two_fa_key = null, two_fa_enabled = false WHERE username = $1`, [req.session.user.username])
                .then(async result => {
                    let user = await users.session.retrieve(false, req.session.user.user_id);

                    if (result && result.rowCount === 1) {
                        resp.send({status: 'success', statusMessage: 'Two-factor authentication disabled', user: user});
                    } else {
                        resp.send({status: 'error', statusMessage: 'Fail to disable'});
                    }
                })
                .catch(err => {
                    return error.log(err, req, resp);
                });
            } else {
                resp.send({status: 'error', statusMessage: 'Incorrect password'});
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: 'Incorrect code'});
    }
});

app.post('/api/account/close', authenticate, async(req, resp) => {
    let authorized = await db.query(`SELECT username, user_password FROM users WHERE username = $1`, [req.body.user])
    .catch(err => {
        return error.log(err, req, resp);
    });

    if (authorized.rows[0].username === req.session.user.username) {
        bcrypt.compare(req.body.password, authorized.rows[0].user_password, async(err, match) => {
            if (err) return error.log(err, req, resp);

            if (match) {
                await db.query(`UPDATE users SET user_status = 'Closed' WHERE username = $1`, [req.session.user.username])
                .then(result => {
                    if (result && result.rowCount === 1) {
                        resp.send({status: 'success'});
                    } else {
                        resp.send({status: 'error', statusMessage: 'Fail to close account'});
                    }
                })
                .catch(err => {
                    return error.log(err, req, resp);
                });
            } else {
                resp.send({status: 'error', statusMessage: 'Incorrect password'});
            }
        });
    }
});

module.exports = app;