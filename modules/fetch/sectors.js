const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.get('/api/get/sectors', async(req, resp) => {
    db.query('SELECT * FROM sectors ORDER BY sector')
    .then(result => {
        if (result !== undefined) {
            for (let row of result.rows) {
                row.sector_created_on = moment(row.sector_created_on).format('MM-DD-YYYY @ hh:mm:ss A');
            }

            resp.send({status: 'get sectors success', sectors: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'get sectors error'});
    });
});

module.exports = app;