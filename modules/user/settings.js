const app = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');

app.post('/api/user/settings/profile/save', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);

                    await client.query(`UPDATE user_profiles SET user_business_name = $1, user_city = $2, user_region = $3, user_country = $4, user_worldwide = $5, user_address = $6, user_phone = $7, user_city_code = $8 WHERE user_profile_id = $9`, [req.body.businessName, req.body.city, req.body.region, req.body.country, req.body.worldwide, req.body.address, req.body.phone, req.body.code, req.session.user.user_id]);

                    let user = await client.query(`SELECT * FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id WHERE users.user_id = $1`, [req.session.user.user_id]);

                    await client.query(`COMMIT`)
                    .then(() => resp.send({status: 'success', statusMessage: 'Profile saved', user: user.rows[0]}));
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
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/settings/password/change', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);
            
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

                                    let user = await client.query(`SELECT * FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id WHERE users.user_id = $1`, [req.session.user.user_id]);

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

app.post('/api/user/settings/email/change', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            if (req.body.newEmail === req.body.confirmEmail) {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        await client.query(`UPDATE users SET user_email = $1 WHERE user_id = $2`, [req.body.newEmail, req.session.user.user_id]);

                        let user = await client.query(`SELECT * FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id WHERE users.user_id = $1`, [req.session.user.user_id]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'Email saved', user: user.rows[0]}));
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
                resp.send({status: 'error', statusMessage: 'Emails do not match'});
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
                    await client.query(`UPDATE user_settings SET hide_email = $1, display_fullname = $2, email_notifications = $3, allow_messaging = $4 WHERE user_setting_id = $5`, [req.body.state.hide_email, req.body.state.display_fullname, req.body.state.email_notifications, req.body.state.allow_messaging, req.session.user.user_id]);

                    let user = await client.query(`SELECT * FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id WHERE users.user_id = $1`, [req.session.user.user_id]);

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', user: user.rows[0]}));
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

app.post('/api/user/profile/update', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            let valueCheck = /^[a-zA-Z0-9\s\-_.,()\/+]*$/;

            if (valueCheck.test(req.body.value)) {
                (async() => {
                    try {
                        await client.query('COMMIT');
                        let column = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = $1`, [req.body.column]);

                        if (column && column.rows.length === 1) {
                            await client.query(`UPDATE user_profiles SET ${column.rows[0].column_name} = $1 WHERE user_profile_id = $2`, [req.body.value, req.session.user.user_id])

                            let user = await client.query(`SELECT * FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id WHERE users.user_id = $1`, [req.session.user.user_id]);

                            let titleResults = await client.query(`SELECT user_title FROM user_profiles`);

                            let titles = [];

                            for (let title of titleResults.rows) {
                                titles.push(title.user_title);
                            }

                            console.log(titles);
                            
                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', user: user.rows[0], titles: titles}));
                        } else {
                            resp.send({status: 'error', statusMessage: 'An error occurred'});
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
            } else {
                resp.send({status: 'error', statusMessage: 'Invalid characters'});
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;