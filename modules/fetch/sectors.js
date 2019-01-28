const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.get('/api/get/sectors', async(req, resp) => {
    db.query(`SELECT * FROM sectors WHERE sector_status NOT IN ('Close', 'Delete')  ORDER BY sector`)
    .then(result => {
        if (result !== undefined) {
            resp.send({status: 'get sectors success', sectors: result.rows});
        }
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'get sectors error'});
    });
});

module.exports = app;