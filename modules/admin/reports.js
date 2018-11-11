const app = require('express').Router();
const db = require('../db');

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
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
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
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    } else {
        resp.send({status: 'error', statusMessage: 'Report already taken care of'});
    }
});

module.exports = app;