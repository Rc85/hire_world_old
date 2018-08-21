const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.get('/api/get/categories', async(req, resp) => {
    db.query('SELECT * FROM categories')
    .then(result => {
        if (result !== undefined) {
            for (let row of result.rows) {
                row.category_created_on = moment(row.category_created_on).format('MM/DD/YYYY @ hh:mm:ss A');
            }

            resp.send({status: 'get categories success', categories: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'get categories error'});
    });
});

module.exports = app;