const app = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');

app.post('/api/user/settings/locations/save', (req, resp) => {
    if (req.session.user) {
        db.query(`UPDATE users SET user_country = $1, user_region = $2, user_city = $3, user_worldwide = $4, default_location = $5
        WHERE user_id = $6 RETURNING *`,
        [req.body.country, req.body.region, req.body.city, req.body.worldwide, req.body.defaultLocation, req.session.user.user_id])
        .then(result => {
            if ( result !== undefined && result.rowCount === 1) {
                delete result.rows[0].user_password;

                resp.send({status: 'save locations success', user: result.rows[0]});
            } else {
                resp.send({status: 'save locations fail'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'save locations error'});
        });
    }
});

app.post('/api/user/settings/profile/save', (req, resp) => {
    if (req.session.user) {
        let firstName = req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1);
        let lastName = req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1);

        console.log(firstName, lastName);

        db.query(`UPDATE users SET user_firstname = $1, user_lastname = $2, business_name = $3, display_business_name = $4, display_fullname = $5
        WHERE user_id = $6 RETURNING *`,
        [firstName, lastName, req.body.businessName, req.body.displayBusinessName, req.body.displayFullName, req.session.user.user_id])
        .then(result => {
            if ( result !== undefined && result.rowCount === 1) {
                delete result.rows[0].user_password;

                resp.send({status: 'save profile success', user: result.rows[0]});
            } else {
                resp.send({status: 'save profile fail'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'save profile error'});
        });
    }
});

app.post('/api/user/settings/password/change', async(req, resp) => {
    if (req.session.user) {
        let password = await db.query(`SELECT user_password FROM users WHERE user_id = $1`, [req.session.user.user_id])
        .then(result => {
            return result;
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'password save error'});
        });

        if (password !== undefined && password.rows.length === 1) {
            bcrypt.compare(req.body.currentPassword, password.rows[0].user_password, (err, matched) => {
                if (err) {
                    console.log(err);
                    resp.send({status: 'password save error'});
                }

                if (matched) {
                    bcrypt.hash(req.body.newPassword, 10, (err, result) => {
                        if (err) {
                            console.log(err);
                            resp.send({status: 'password save error'});
                        }

                        db.query(`UPDATE users SET user_password = $1 WHERE user_id =$2`, [result, req.session.user.user_id])
                        .then(result => {
                            if (result !== undefined && result.rowCount === 1) {
                                resp.send({status: 'password save success'});
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            resp.send({status: 'password save error'});
                        });
                    });
                } else {
                    resp.send({status: 'incorrect password'});
                }
            });
        } else {
            resp.send({status: 'user not found'});
        }
    }
});

app.post('/api/user/settings/email/change', (req, resp) => {
    if (req.session.user) {
        db.query(`UPDATE users SET user_email = $1, hide_email = $2 WHERE user_id = $3 RETURNING *`,
        [req.body.newEmail, req.body.hideEmail, req.session.user.user_id])
        .then(result => {
            if ( result !== undefined && result.rowCount === 1) {
                delete result.rows[0].user_password;

                resp.send({status: 'save email success', user: result.rows[0]});
            } else {
                resp.send({status: 'save email fail'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'save email error'});
        });
    }
});

module.exports = app;