const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/report/submit', async(req, resp) => {
    if (req.session.user) {
        if (req.body.user === req.session.user.username) {
            resp.send({status: 'error', statusMessage: 'You cannot report yourself'});
        } else {
            await db.query(`INSERT INTO reports (reporter, report_type, report_from_url, reported_user, reported_id) VALUES ($1, $2, $3, $4, $5)`, [req.session.user.username, req.body.type, req.body.url, req.body.user, req.body.id])
            .then(result => {
                if (result) resp.send({status: 'success', statusMessage: 'Report sent'});
            })
            .catch(err => {
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                if (err.code === '23505') {
                    resp.send({status: 'error', statusMessage: 'You already reported'});
                } else {
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                }
            });
        }
    } else {
        resp.send({status: 'redirect'});
    }
});

module.exports = app;