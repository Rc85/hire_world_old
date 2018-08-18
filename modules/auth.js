const db = require('./db');
const app = require('express').Router();
const bcrypt = require('bcrypt');

app.post('/api/auth/register', (req, resp) => {
    bcrypt.hash(req.body.password, 10, (err, result) => {
        if (err) { console.log(err); }

        db.query(`INSERT INTO users (username, user_password, user_email) VALUES ($1, $2, $3) RETURNING username`, [req.body.username, result, req.body.email])
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
});

app.post('/api/auth/login', async(req, resp) => {
    console.log(req.body);
    let user = await db.query(`SELECT * FROM users WHERE username = $1`, [req.body.username])
    .then(result => {
        if (result !== undefined && result.rows.length === 1) {
            return result.rows[0];
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'login error'});
    });

    bcrypt.compare(req.body.password, user.user_password, (err, match) => {
        if (err) {
            console.log(err);
        }

        if (match) {
            delete user.user_password;
            req.session.user = user;

            resp.send({status: 'login success', user: req.session.user});
        } else {
            resp.send({status: 'login fail'});
        }
    });
});

app.post('/api/auth/get-session', (req, resp) => {
    if (req.session.user) {
        resp.send({status: 'get session success', user: req.session.user});
    } else {
        resp.send({status: 'get session fail'});
    }
});

app.post('/api/auth/logout', (req, resp) => {
    req.session = null;

    resp.send({status: 'logged out'});
});

module.exports = app;