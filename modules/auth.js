const db = require('./db');
const app = require('express').Router();
const bcrypt = require('bcrypt');

app.post('/api/auth/register', (req, resp) => {
    let usernameCheck = /^[a-zA-Z0-9_-]{5,15}$/;
    let passwordCheck = /^.{6,20}$/;
    let emailCheck = /^[a-zA-Z0-9_\-]+(\.{1}[a-zA-Z0-9_\-]*){0,2}@{1}[a-zA-Z0-9_\-]+\.([a-zA-Z0-9_\-]*\.{1}){0,2}[a-zA-Z0-9_\-]{2,}$/;
    let nameCheck = /^[a-zA-Z]{1,15}\.?$/;

    if (req.body.agreed) {
        if (!usernameCheck.test(req.body.username)) {
            resp.send({status: 'Invalid username'});
        } else if (req.body.password !== req.body.confirmPassword) {
            resp.send({status: 'Passwords do not match'});
        } else if (!passwordCheck.test(req.body.password) || !passwordCheck.test(req.body.confirmEmail)) {
            resp.send({status: 'Passwords length too short or long'});
        } else if (req.body.email !== req.body.confirmEmail) {
            resp.send({status: 'Emails do not match'});
        } else if (!emailCheck.test(req.body.email) || !emailCheck.test(req.body.confirmEmail)) {
            resp.send({status: 'Invalid email format'});
        } else if (req.body.firstName !== '') {
            if (!nameCheck.test(req.body.firstName)) {
                resp.send({status: 'Invalid name'});
            }
        } else if (req.body.lastName !== '') {
            if (!nameCheck.test(req.body.lastName)) {
                resp.send({status: 'Invalid name'});
            }
        } else {
            console.log('here')
            bcrypt.hash(req.body.password, 10, (err, result) => {
                if (err) { console.log(err); }

                db.query(`INSERT INTO users (username, user_password, user_email, user_firstname, user_lastname, business_name, user_country, user_region, user_city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING username`, [req.body.username, result, req.body.email, req.body.firstName, req.body.lastName, req.body.businessName, req.body.country, req.body.region, req.body.city])
                .then(result => {
                    if (result !== undefined && result.rowCount === 1) {
                        resp.send({status: 'register success'});
                    } else {
                        resp.send({status: 'register fail'});
                    }
                })
                .catch(err => {
                    console.log(err)
                    resp.send({status: 'register error'});
                });
            });
        }
    } else {
        resp.send({status: 'You must agree to the terms of service'});
    }
});

app.post('/api/auth/login', async(req, resp) => {
    let user = await db.query(`SELECT * FROM users WHERE username = $1`, [req.body.username])
    .then(result => {
        return result;
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'login error'});
    });

    if (user !== undefined && user.rows.length === 1) {
        if (user.rows[0].user_status === 'Banned') {
            resp.send({status: 'banned'})
        } else {
            bcrypt.compare(req.body.password, user.rows[0].user_password, (err, match) => {
                if (err) {
                    console.log(err);
                    resp.send({status: 'login error'});
                }

                if (match) {
                    let session = {
                        user_id: user.rows[0].user_id,
                        username: user.rows[0].username
                    }

                    req.session.user = session;

                    delete user.rows[0].user_password;

                    resp.send({status: 'login success', user: user.rows[0]});
                } else {
                    resp.send({status: 'incorrect'});
                }
            });
        }
    } else {
        resp.send({status: 'incorrect'});
    }
});

app.post('/api/auth/get-session', (req, resp) => {
    if (req.session.user) {
        db.query(`SELECT * FROM users WHERE user_id = $1`, [req.session.user.user_id])
        .then(result => {
            if (result !== undefined && result.rows.length === 1) {
                delete result.rows[0].user_password;

                resp.send({status: 'get session success', user: result.rows[0]});
            }
        })
    } else {
        resp.send({status: 'get session fail'});
    }
});

app.post('/api/auth/logout', (req, resp) => {
    req.session = null;

    resp.send({status: 'logged out'});
});

module.exports = app;