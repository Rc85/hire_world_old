const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/get/announcements', async(req, resp) => {
    let dismissed = await db.query(`SELECT * FROM dismissed_announcements WHERE dismissed_by = $1`, [req.session.user.username]);
    let dismissedIds = [];

    for (let d of dismissed.rows) {
        dismissedIds.push(d.dismissed_announcement);
    }

    await db.query(`SELECT * FROM announcements WHERE announcement_start_date <= current_timestamp AND announcement_end_date >= current_timestamp AND NOT (announcement_id = ANY($1))`, [dismissedIds])
    .then(result => {
        resp.send({status: 'success', announcements: result.rows})
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Getting announcements', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;