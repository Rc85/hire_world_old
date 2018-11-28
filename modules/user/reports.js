const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/report/submit', (req, resp) => {
    if (req.session.user) {
        if (req.body.user === req.session.user.username) {
            resp.send({status: 'error', statusMessage: 'You cannot report yourself'});
        } else {
            db.connect((err, client, done) => {
                if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

                (async() => {
                    try {
                        await client.query('BEGIN');

                        let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (user && user.rows[0].user_status === 'Active') {
                            await client.query(`INSERT INTO reports (reporter, report_type, report_from_url, reported_user, reported_id) VALUES ($1, $2, $3, $4, $5)`, [req.session.user.username, req.body.type, req.body.url, req.body.user, req.body.id])
                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Report sent'}));
                        } else if (user && user.rows[0].user_status === 'Suspend') {
                            let error = new Error(`You're temporarily banned`);
                            error.type = 'CUSTOM';
                            throw error;
                        }
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    
                    let message = 'An error occurred';

                    if (err.code === '23505') {
                        message = 'You already reported';
                    } else if (err.type === 'CUSTOM') {
                        message = err.message;
                    }

                    resp.send({status: 'error', statusMessage: message});
                });
            });
        }
    } else {
        resp.send({status: 'redirect'});
    }
});

module.exports = app;