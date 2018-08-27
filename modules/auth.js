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