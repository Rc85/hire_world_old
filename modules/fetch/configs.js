const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/get/announcements', async(req, resp) => {
    let dismissedIds = [];

    if (req.session.user) {
        let dismissed = await db.query(`SELECT * FROM dismissed_announcements WHERE dismissed_by = $1`, [req.session.user.username]);

        for (let d of dismissed.rows) {
            dismissedIds.push(d.dismissed_announcement);
        }
    }

    await db.query(`SELECT * FROM announcements WHERE announcement_start_date <= current_timestamp AND announcement_end_date >= current_timestamp AND NOT (announcement_id = ANY($1))`, [dismissedIds])
    .then(result => {
        resp.send({status: 'success', announcements: result.rows})
    })
    .catch(err => {
         console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;