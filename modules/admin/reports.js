const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/admin/reports/get', async(req, resp) => {
    let query;
    let params = [];

    if (req.body.type) {
        query = `SELECT * FROM reports WHERE report_type = $1 AND report_status = 'Pending'`;
        params.push(req.body.type)
    } else {
        query = `SELECT * FROM reports WHERE report_status != 'Pending'`;
    }

    await db.query(query, params)
    .then(result => {
        if (result) resp.send({status: 'success', reports: result.rows});
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/admin/report/change-status', async(req, resp) => {
    let status, query, params, successMessage;

    if (req.body.status === 'Suspend' || req.body.status === 'Ban') {
        if (req.body.status === 'Suspend') {
            status = 'Suspended';
        } else if (req.body.status === 'Ban') {
            status = 'Banned';
        }

        query = `UPDATE reports SET report_status = $1 WHERE reported_user = $2`;
        params = [status, req.body.user];
    } else {
        successMessage = 'Report dismissed';
        query = `UPDATE reports SET report_status = $1 WHERE report_id = $2`;
        params = [req.body.status, req.body.id];
    }

    let reportStatusChanged = await db.query(`SELECT report_status FROM reports WHERE report_id = $1`, [req.body.id]);

    if (reportStatusChanged && reportStatusChanged.rows[0].report_status === 'Pending') {
        await db.query(query, params)
        .then(result => {
            if (result) {
                resp.send({status: 'success', statusMessage: successMessage});
            }
        })
        .catch(err => error.log(err, req, resp));
    } else {
        resp.send({status: 'error', statusMessage: 'Report already taken care of'});
    }
});

app.post('/api/admin/report/get-review', async(req, resp) => {
    await db.query(`SELECT * FROM user_reviews WHERE review_id = $1`, [req.body.id])
    .then(result => {
        if (result && result.rows.length === 1) {
            resp.send({status: 'success', review: result.rows[0]});
        } else if (result && result.rows.length === 0) {
            resp.send({status: 'error', statusMessage: 'Review not found'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/admin/report/delete-review', async(req, resp) => {
    await db.query(`UPDATE user_reviews SET review_status = 'Deleted' WHERE review_id = $1 RETURNING *`, [req.body.id])
    .then(result => {
        if (result && result.rowCount === 1) {
            resp.send({status: 'success', statusMessage: 'Review deleted', review: result.rows[0]});
        } else if (result && result.rowCount === 0) {
            resp.send({status: 'error', statusMessage: 'Nothing to delete'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

module.exports = app;