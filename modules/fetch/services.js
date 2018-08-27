const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.get('/api/get/services', async(req, resp) => {
    if (req.session.user) {
        await db.query(`SELECT * FROM user_services WHERE service_provided_by = $1 ORDER BY service_id`, [req.session.user.username])
        .then(result => {
            if (result !== undefined) {
                for (let i in result.rows) {
                    result.rows[i].service_created_on = moment(result.rows[i].service_created_on).fromNow();
                }

                resp.send({status: 'get services success', services: result.rows});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'get services error'});
        });
    }
});

app.post('/api/get/services/listings', (req, resp) => {
    db.query(`SELECT * FROM user_services WHERE service_status = 'Active' AND service_listed_under = $1 ORDER BY service_created_on`, [req.body.sector])
    .then(result => {
        if (result !== undefined) {
            for (let i in result.rows) {
                result.rows[i].service_created_on = moment(result.rows[i].service_created_on).fromNow();
            }

            resp.send({status: 'get listings success', services: result.rows});
        } else {
            resp.send({status: 'get listings fail'});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error'});
    });
});

module.exports = app;