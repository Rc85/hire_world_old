const app = require('express').Router();
const db = require('../db');

app.get('/api/get/sectors', async(req, resp) => {
    db.query(`SELECT * FROM sectors WHERE sector_status = 'Open' ORDER BY sector`)
    .then(result => {
        if (result !== undefined) {
            resp.send({status: 'get sectors success', sectors: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'get sectors error'});
    });
});

module.exports = app;