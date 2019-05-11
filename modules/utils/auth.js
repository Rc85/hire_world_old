const db = require('../db');
const bcrypt = require('bcrypt');
const error = require('./error-handler');

module.exports = async(req, resp, next) => {
    if (req.body.username && req.body.password) {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let auth = await client.query(`SELECT user_id, username, user_password, user_this_login, user_status, two_fa_enabled FROM users WHERE username ILIKE $1`, [req.body.username]);

                    if (auth.rows.length === 1) {
                        if (auth.rows[0].user_status === 'Suspended') {
                            resp.send({status: 'suspended', statusMessage: 'Your account has been temporarily banned'});
                        } else if (auth.rows[0].user_status === 'Banned') {
                            resp.send({status: 'banned', statusMessage: `Your account has been permanently banned`});
                        } else if (auth.rows[0].user_status === 'Pending') {
                            resp.send({status: 'activation required'});
                        } else if (auth.rows[0].user_status === 'Active') {
                            bcrypt.compare(req.body.password, auth.rows[0].user_password, async(err, match) => {
                                if (err) error.log(err, req, resp);

                                if (match) {
                                    if (auth.rows[0].two_fa_enabled) {
                                        req.session.auth = {
                                            user_id: auth.rows[0].user_id
                                        }

                                        await client.query('COMMIT')
                                        .then(() => resp.send({status: '2fa required'}));
                                    } else {
                                        let session = {
                                            user_id: auth.rows[0].user_id,
                                            username: auth.rows[0].username
                                        }

                                        req.session.user = session;    
                                        
                                        await db.query(`UPDATE users SET user_last_login = $1, user_this_login = current_timestamp WHERE username = $2`, [auth.rows[0].user_this_login, auth.rows[0].username]);

                                        await client.query('COMMIT')
                                        .then(() => next());
                                    }
                                } else {
                                    await client.query('ROLLBACK');
                                    resp.send({status: 'error', statusMessage: 'Incorrect username or password'});
                                    return;
                                }
                            });
                        }
                    } else {
                        let error = new Error(`Incorrect username or password`);
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
    } else if (req.session.user) {
        await db.query(`SELECT user_status FROM users WHERE username = $1 AND user_status != 'Inactive'`, [req.session.user.username])
        .then(result => {
            if (result && result.rows.length === 1) {
                if (result.rows[0].user_status === 'Active') {
                    next();
                } else if (result.rows[0].user_status === 'Suspended') {
                    resp.send({status: 'suspended', statusMessage: 'Your account has been temporarily banned'});
                } else if (result.rows[0].user_status === 'Banned') {
                    resp.send({status: 'banned', statusMessage: `Your account has been permanently banned`});
                } else if (result.rows[0].user_status === 'Pending') {
                    resp.send({status: 'activation required'});
                }
            } else if (result.rows.length === 0) {
                return resp.send({status: 'error', statusMessage: `Incorrect username or password`});
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
}