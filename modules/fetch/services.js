const app = require('express').Router();
const db = require('../db');

app.get('/api/get/services', async(req, resp) => {
    await db.query(`SELECT * FROM user_services WHERE service_provided_by = $1`, [req.session.user.username])
    .then(result => {
        if (result !== undefined) {
            resp.send({status: 'get services success', services: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'get services error'});
    });
});

module.exports = app;