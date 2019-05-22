const app = require('express').Router();
const db = require('../../pg_conf');
const error = require('../utils/error-handler');
const authenticate = require('../../middlewares/auth');

app.post('/api/report/submit', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        (async() => {
            try {
                await client.query('BEGIN');
                await client.query(`INSERT INTO reports (reporter, report_type, report_reason, other_reason, reported_content_link) VALUES ($1, $2, $3, $4, $5)`, [req.session.user.username, req.body.type, req.body.reason, req.body.specified, req.body.url])
                await client.query('COMMIT')
                .then(() => resp.send({status: 'success', statusMessage: 'Report sent'}));
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                done();
            }
        })()
        .catch(err => error.log(err, req, null, null, (err) => {
            let message = 'An error occurred';
    
            if (err.code === '23505') {
                message = 'You already reported';
            } else if (err.type === 'CUSTOM') {
                message = err.message;
            }
    
            resp.send({status: 'error', statusMessage: message});
        }));
    });
});

module.exports = app;