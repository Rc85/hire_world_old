const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/admin/config/get', async(req, resp) => {
    let configs = await db.query(`SELECT * FROM site_configs ORDER BY config_id`);
    let promotions = await db.query(`SELECT * FROM promotions`);
    let plans = await db.query(`SELECT * FROM subscription_plans WHERE plan_status != 'Delete'`);
    let announcements = await db.query(`SELECT * FROM announcements ORDER BY announcement_created_date DESC LIMIT 3`);

    if (configs && promotions && plans && announcements) {
        resp.send({status: 'success', configs: configs.rows, promotions: promotions.rows, plans: plans.rows, announcements: announcements.rows});
    } else {
        resp.send({status: 'access error', statusMessage: 'An error occurred while trying to retrieve one or more configurations'});
    }
});

app.post('/api/admin/config/set/:name', async(req, resp) => {
    let col;

    if (req.params.name === 'site') {
        col = 'Site';
    } else if (req.params.name === 'registration') {
        col = 'Registration';
    }

    await db.query(`UPDATE site_configs SET config_status = $1 WHERE config_name = $2`, [req.body.status, col])
    .then(result => {
        if (result) resp.send({status: 'success', statusMessage: 'Status changed'});
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/admin/announcement/create', async(req, resp) => {
    let blankCheck = /^\s*$/;

    let numberOfAnnouncements = await db.query(`SELECT announcement_id FROM announcements`);

    if (numberOfAnnouncements.rows.length < 3) {
        if (blankCheck.test(req.body.announcement)) {
            resp.send({status: 'error', statusMessage: 'Announcement cannot be blank'});
        } else if (req.body.start > req.body.end) {
            resp.send({status: 'error', statusMessage: 'Start date cannot be after end date'});
        } else {
            await db.query(`INSERT INTO announcements (announcement, announcement_start_date, announcement_end_date, announcer) VALUES ($1, $2, $3, $4) RETURNING *`, [req.body.announcement, req.body.start, req.body.end, req.session.user.username])
            .then(result => {
                if (result) resp.send({status: 'success', announcement: result.rows[0]});
            })
            .catch(err => {
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        }
    } else {
        resp.send({status: 'error', statusMessage: 'Cannot create more announcements'});
    }
});

app.post('/api/admin/announcement/delete', async(req, resp) => {
    await db.query(`DELETE FROM announcements WHERE announcement_id = $1`, [req.body.id])
    .then(result => {
        if (result) resp.send({status: 'success'});
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/admin/promo/change-status', async(req, resp) => {
    let exist = await db.query(`SELECT promo_id FROM promotions WHERE promo_status = 'Active'`);

    if (exist && exist.rows.length === 1) {
        resp.send({status: 'error', statusMessage: 'Only one active promo is allowed'});
    } else {
        await db.query(`UPDATE promotions SET promo_status = $1 WHERE promo_id = $2 RETURNING *`, [req.body.status, req.body.id])
        .then(result => {
            if (result) resp.send({status: 'success', promo: result.rows[0]});
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    }
});

app.post('/api/admin/plan/change-status', async(req, resp) => {
    await db.query(`UPDATE subscription_plans SET plan_status = $1 WHERE plan_id = $2 RETURNING *`, [req.body.status, req.body.id])
    .then(result => {
        if (result) resp.send({status: 'success', plan: result.rows[0]});
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;