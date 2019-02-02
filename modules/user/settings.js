const app = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const error = require('../utils/error-handler');
const validate = require('../utils/validate');
const controller = require('../utils/controller');

app.post('/api/user/settings/profile/save', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);
            
            if (req.body.businessName && !validate.businessNameCheck.test(req.body.businessName)) {
                resp.send({status: 'error', statusMessage: 'Business name too long or has invalid characters'});
            } else if (req.body.address && !validate.addressCheck.test(req.body.address)) {
                resp.send({status: 'error', statusMessage: 'Address too long or has invalid characters'});
            } else if (req.body.phone && !validate.phoneCheck.test(req.body.phone)) {
                resp.send({status: 'error', statusMessage: 'Phone number too long or invalid format'});
            } else if (req.body.code && !validate.cityCodeCheck.test(req.body.code)) {
                resp.send({status: 'error', statusMessage: 'Invalid city code format'});
            } else if (req.body.country && !validate.locationCheck.test(req.body.country)) {
                resp.send({status: 'error', statusMessage: 'Invalid character(s) in country'});
            } else if (req.body.region && !validate.locationCheck.test(req.body.region)) {
                resp.send({status: 'error', statusMessage: 'Invalid character(s) in region'});
            } else if (req.body.city && !validate.locationCheck.test(req.body.city)) {
                resp.send({status: 'error', statusMessage: 'Invalid character(s) in city'});
            } else {
                (async() => {
                    try {
                        await client.query(`BEGIN`);

                        await client.query(`UPDATE user_profiles SET user_business_name = $1, user_address = $2, user_phone = $3, user_city_code = $4, user_country = $6, user_region = $7, user_city = $8 WHERE user_profile_id = $5 RETURNING *`, [req.body.businessName, req.body.address, req.body.phone, req.body.code, req.session.user.user_id, req.body.country, req.body.region, req.body.city])
                        
                        /* let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
                        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                        LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                        LEFT JOIN user_listings ON users.username = user_listings.listing_user
                        WHERE users.user_id = $1`, [req.session.user.user_id]); */

                        let user = await controller.session.retrieve(client, req.session.user.user_id);

                        await client.query(`COMMIT`)
                        .then(async() => {
                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Updated profile`, req.session.user.username, 'Account']);
                            resp.send({status: 'success', statusMessage: 'Profile saved', user: user});
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
                    resp.send({status:  'error', statusMessage: 'An error occurred'});
                });
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/settings/password/change', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            let blankCheck = /^\s*$/;
            let charCheck = /.{6,15}/;
    
            if (blankCheck.test(req.body.currentPassword) || blankCheck.test(req.body.newPassword)) {
                resp.send({status: 'error', statusMessage: 'Passwords cannot be blank'});
            } else if (!charCheck.test(req.body.newPassword) || !charCheck.test(req.body.confirmPassword)) {
                resp.send({status: 'error', statusMessage: 'Password too short'});
            } else if (req.body.newPassword !== req.body.confirmPassword) {
                resp.send({status: 'error', statusMessage: 'Passwords do not match'});
            } else {
                (async() => {
                    try {
                        await client.query('COMMIT');

                        let authorized = await client.query(`SELECT user_password FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (authorized && authorized.rows.length === 1) {
                            bcrypt.compare(req.body.currentPassword, authorized.rows[0].user_password, (err, matched) => {
                                if (err) console.log(err);

                                if (matched) {
                                    bcrypt.hash(req.body.newPassword, 10, async(err, result) => {
                                        if (err) console.log(err);
                                        
                                        await client.query(`UPDATE users SET user_password = $1 WHERE user_id = $2`, [result, req.session.user.user_id]);

                                        let user = controller.user.retrieve(req.session.user.user_id);

                                        await client.query('COMMIT')
                                        .then(async() => {
                                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Changed password`, req.session.user.username, 'Account']);
                                            resp.send({status: 'success', statusMessage: 'Password saved', user: user.rows[0]});
                                        });
                                    });
                                } else {
                                    resp.send({status: 'error', statusMessage: 'Incorrect password'});
                                }
                            });
                        } else {
                            resp.send({status: 'error', statusMessage: 'User does not exist'});
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
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/settings/email/change', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            let emailCheck = /^[a-zA-Z0-9_\-]+(\.{1}[a-zA-Z0-9_\-]*){0,2}@{1}[a-zA-Z0-9_\-]+\.([a-zA-Z0-9_\-]*\.{1}){0,2}[a-zA-Z0-9_\-]{2,}$/;

            if (req.body.newEmail !== req.body.confirmEmail) {
                resp.send({status: 'error', statusMessage: 'Emails do not match'});
            } else if (!emailCheck.test(req.body.newEmail)) {
                resp.send({status: 'error', statusMessage: 'Invalid email format'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        await client.query(`UPDATE users SET user_email = $1 WHERE user_id = $2`, [req.body.newEmail, req.session.user.user_id]);

                        /* let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
                        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                        LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                        LEFT JOIN user_listings ON users.username = user_listings.listing_user
                        WHERE users.user_id = $1`, [req.session.user.user_id]); */

                        let user = await controller.session.retrieve(client, req.session.user.user_id);

                        await client.query('COMMIT')
                        .then(async() => {
                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`Changed email`, req.session.user.username, 'Account']);
                            resp.send({status: 'success', statusMessage: 'Email saved', user: user});
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
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/settings/change', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let allowMessaging = await client.query(`SELECT allow_messaging FROM user_settings WHERE user_setting_id = $1`, [req.session.user.user_id]);
                    let hasInquiries;

                    // If incoming request is to turn off messaging and if database is not already set to false
                    if (req.body.allow_messaging !== allowMessaging.rows[0].allow_messaging && !req.body.allow_messaging) {
                        hasInquiries = await client.query(`SELECT job_id FROM jobs WHERE job_status = 'Active' AND (job_client = $1 OR job_user = $1)`, [req.session.user.username]);
                    }

                    // Check if user have active jobs
                    if (hasInquiries && hasInquiries.rows.length > 0) {
                        let error = new Error(`Cannot change setting due to active jobs`);
                        error.type = 'user_defined';
                        throw error;
                    } else {
                        await client.query(`UPDATE user_settings SET hide_email = $1, display_fullname = $2, email_notifications = $3, allow_messaging = $4, display_business_hours = $6 WHERE user_setting_id = $5`, [req.body.hide_email, req.body.display_fullname, req.body.email_notifications, req.body.allow_messaging, req.session.user.user_id, req.body.display_business_hours]);

                        if (req.body.display_business_hours) {
                            await client.query(`INSERT INTO business_hours (business_owner, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES ($1, $2, $2, $2, $2, $2, $2, $2) ON CONFLICT (business_owner) DO NOTHING`, [req.session.user.username, 'Closed']);
                        }

                        /* let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
                        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                        LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                        LEFT JOIN user_listings ON users.username = user_listings.listing_user
                        WHERE users.user_id = $1`, [req.session.user.user_id]); */

                        let user = await controller.session.retrieve(client, req.session.user.user_id);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', user: user}));
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

                if (err.type === 'user_defined') {
                    message = err.message;
                }
                
                resp.send({status: 'error', statusMessage: message});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/profile/update', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            let valueCheck, column;

            if (req.body.field === 'business name') {
                column = 'user_business_name';
                
                if (req.body.value) {
                    valueCheck = validate.businessNameCheck;
                } else {
                    valueCheck = validate.blankCheck;
                }
            } else if (req.body.field === 'user title') {
                column = 'user_title';

                if (req.body.value) {
                    valueCheck = validate.userTitleCheck;
                } else {
                    valueCheck = validate.blankCheck;
                }
            } else if (req.body.field === 'user facebook' || req.body.field === 'user github' || req.body.field === 'user twitter' || req.body.field === 'user instagram' || req.body.field === 'user linkedin' || req.body.field === 'user website') {
                if (req.body.value) {
                    valueCheck = validate.urlCheck;
                } else {
                    valueCheck = validate.blankCheck;
                }

                if (req.body.field === 'user facebook') {
                    column = 'user_facebook';
                } else if (req.body.field === 'user github') {
                    column = 'user_github';
                } else if (req.body.field === 'user twitter') {
                    column = 'user_twitter';
                } else if (req.body.field === 'user instagram') {
                    column = 'user_instagram';
                } else if (req.body.field === 'user website') {
                    column = 'user_website';
                }
            }

            if (valueCheck.test(req.body.value)) {
                (async() => {
                    try {
                        await client.query('COMMIT');

                        await client.query(`UPDATE user_profiles SET ${column} = $1 WHERE user_profile_id = $2`, [req.body.value, req.session.user.user_id])

                        /* let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
                        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                        LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                        LEFT JOIN user_listings ON users.username = user_listings.listing_user
                        WHERE users.user_id = $1`, [req.session.user.user_id]); */

                        let user = await controller.session.retrieve(client, req.session.user.user_id);
                        
                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'Saved', user: user}));
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
            } else {
                resp.send({status: 'error', statusMessage: 'Invalid characters'});
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;