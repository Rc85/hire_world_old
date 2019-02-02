const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.get('/api/admin/get-errors', async(req, resp) => {
    await db.query(`SELECT * FROM error_log ORDER BY error_id`)
    .then(result => {
        if (result) {
            resp.send({status: 'success', errors: result.rows});
        }
    })
    .catch(err => console.log(err));
});

module.exports = app;