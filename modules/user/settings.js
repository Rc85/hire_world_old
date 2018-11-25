const app = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');

app.post('/api/user/settings/profile/save', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            let businessNameCheck = /^(\w|\d|\s(?!\s)|,|\.|\/|\?|;|'|\[|\]|!|@|#|\$|%|\^|&|\*|\(|\)|_|\+|-|=|{|}|:|"){1,40}$/;
            let addressCheck = /^(\w|\d|\s(?!\s)|,|\.|\/|\?|;|'|\[|\]|!|@|#|\$|%|\^|&|\*|\(|\)|_|\+|-|=|{|}|:|"){1,300}$/;
            let cityCodeCheck = /^([0-9]{1,5}|[a-zA-Z]{1}[0-9]{1}[a-zA-Z]{1}(\s)?[0-9]{1}[a-zA-Z]{1}[0-9]{1})$/;
            let phoneCheck = /^(\+1)?(\s)?([0-9]{1,15}|(\()?[0-9]{3}(\))?(\s|\-)?([0-9]{7,12}|[0-9]{3}(\s|\-)?[0-9]{4,9}))$/;
            let locationCheck = /^[a-zA-Z0-9À-ž,'().\-\s]*$/;

            if (req.body.businessName && !businessNameCheck.test(req.body.businessName)) {
                resp.send({status: 'error', statusMessage: 'Business name too long or has invalid characters'});
            } else if (req.body.address && !addressCheck.test(req.body.address)) {
                resp.send({status: 'error', statusMessage: 'Address too long or has invalid characters'});
            } else if (req.body.phone && !phoneCheck.test(req.body.phone)) {
                resp.send({status: 'error', statusMessage: 'Phone number too long or invalid format'});
            } else if (req.body.code && !cityCodeCheck.test(req.body.code)) {
                resp.send({status: 'error', statusMessage: 'Invalid city code format'});
            } else if (req.body.country && !locationCheck.test(req.body.country)) {
                resp.send({status: 'error', statusMessage: 'Invalid character(s) in country'});
            } else if (req.body.region && !locationCheck.test(req.body.region)) {
                resp.send({status: 'error', statusMessage: 'Invalid character(s) in region'});
            } else if (req.body.city && !locationCheck.test(req.body.city)) {
                resp.send({status: 'error', statusMessage: 'Invalid character(s) in city'});
            } else {
                (async() => {
                    try {
                        await client.query(`BEGIN`);

                        await client.query(`UPDATE user_profiles SET user_business_name = $1, user_address = $2, user_phone = $3, user_city_code = $4, user_country = $6, user_region = $7, user_city = $8 WHERE user_profile_id = $5`, [req.body.businessName, req.body.address, req.body.phone, req.body.code, req.session.user.user_id, req.body.country, req.body.region, req.body.city]);

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

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success', statusMessage: 'Profile saved', user: user.rows[0]}));
                    } catch (e) {
                        await client.query(`ROLLBACK`);
                        ;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
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
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

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
                                if (err) error.log({name: err.name, message: err.message, origin: 'bcrypt Compare', url: req.url});

                                if (matched) {
                                    bcrypt.hash(req.body.newPassword, 10, async(err, result) => {
                                        if (err) error.log({name: err.name, message: err.message, origin: 'bcrypt Unhashing', url: req.url});
                                        
                                        await client.query(`UPDATE users SET user_password = $1 WHERE user_id = $2`, [result, req.session.user.user_id]);

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
                                        .then(() => resp.send({status: 'success', statusMessage: 'Password saved', user: user.rows[0]}));
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
                        ;
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

app.post('/api/user/settings/email/change', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

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
                        .then(() => resp.send({status: 'success', statusMessage: 'Email saved', user: user.rows[0]}));
                    } catch (e) {
                        await client.query('ROLLBACK');
                        ;
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

app.post('/api/user/settings/change', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let allowMessaging = await client.query(`SELECT allow_messaging FROM user_settings WHERE user_setting_id = $1`, [req.session.user.user_id]);
                    let hasInquiries;

                    if (req.body.allow_messaging !== allowMessaging.rows[0].allow_messaging && !req.body.allow_messaging) {
                        hasInquiries = await client.query(`SELECT job_id FROM jobs WHERE job_status = 'Active' AND (job_client = $1 OR job_user = $1)`, [req.session.user.username]);
                    }

                    if (hasInquiries && hasInquiries.rows.length > 0) {
                        let error = new Error(`You have active messages or jobs`);
                        error.type = 'user_defined';
                        rror;
                    } else {
                        await client.query(`UPDATE user_settings SET hide_email = $1, display_fullname = $2, email_notifications = $3, allow_messaging = $4, hide_business_hours = $6, hide_phone = $7 WHERE user_setting_id = $5`, [req.body.hide_email, req.body.display_fullname, req.body.email_notifications, req.body.allow_messaging, req.session.user.user_id, req.body.hide_business_hours, req.body.hide_phone]);

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

                        if (user.rows[0].hide_phone) {
                            delete user.rows[0].user_phone;
                        }

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', user: user.rows[0]}));
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    ;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
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
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            let valueCheck = /^[a-zA-Z0-9\s\-_.,()\/+]*$/;

            if (valueCheck.test(req.body.value)) {
                (async() => {
                    try {
                        await client.query('COMMIT');
                        let column = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = $1`, [req.body.column]);

                        if (column && column.rows.length === 1) {
                            await client.query(`UPDATE user_profiles SET ${column.rows[0].column_name} = $1 WHERE user_profile_id = $2`, [req.body.value, req.session.user.user_id])

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

                            let titleResults = await client.query(`SELECT user_title FROM user_profiles`);

                            let titles = [];

                            for (let title of titleResults.rows) {
                                titles.push(title.user_title);
                            }
                            
                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', user: user.rows[0], titles: titles}));
                        } else {
                            resp.send({status: 'error', statusMessage: 'An error occurred'});
                        }
                    } catch (e) {
                        await client.query('ROLLBACK');
                        ;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
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