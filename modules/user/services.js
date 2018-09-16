const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.post('/api/user/services/add', async(req, resp) => {
    if (req.session.user) {
        await db.query(`INSERT INTO user_services (service_name, service_detail, service_provided_by, service_listed_under, service_worldwide, service_country, service_region, service_city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [req.body.name, req.body.detail, req.session.user.username, req.body.listUnder, req.body.worldwide, req.body.country, req.body.region, req.body.city])
        .then(result => {
            if (result && result.rows.length === 1) {
                resp.send({status: 'success', statusMessage: 'Service added', service: result.rows[0]});
            } else {
                resp.send({status: 'error', statusMessage: 'Fail to add service'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'})
        });
    }
});

app.post('/api/user/services/delete', async(req, resp) => {
    if (req.session.user) {
        //db.connect(async(err, client, done) => {
            //if (err) { console.log(err); }

            /* let deleted =  */await db.query(`UPDATE user_services SET service_status = 'Deleted' WHERE service_id = $1`, [req.body.id])
            .then(result => {
                if (result && result.rowCount === 1) {
                    resp.send({status: 'success'});
                }
            })
            .catch(err => {
                console.log(err);
                if (err.code === '23503') {
                    resp.send({status: 'error', statusMessage: 'Unable to delete with active jobs'});
                } else {
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                }
            });

            /* if (deleted !== undefined) {
                if (deleted.rowCount === 1) {
                    await client.query(`SELECT * FROM user_services WHERE service_provided_by = $1 AND service_status != 'Deleted' ORDER BY service_id`, [req.session.user.username])
                    .then(result => {
                        if (result !== undefined) {
                            for (let i in result.rows) {
                                result.rows[i].service_created_on = moment(result.rows[i].service_created_on).fromNow();
                            }

                            resp.send({status: 'success', statusMessage: 'Service deleted', services: result.rows});
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        done();
                        resp.send({status: 'error', statusMessage: 'An error occurred'});
                    });
                } else {
                    done();
                    resp.send({status: 'error', statusMessage: 'Delete service failed'});
                }
            }
        }); */
    }
});

app.post('/api/user/services/status', async(req, resp) => {
    if (req.session.user) {
        //db.connect(async(err, client, done) => {
            //if (err) { console.log(err); }

            await db.query(`UPDATE user_services SET service_status = $1 WHERE service_id = $2 RETURNING service_status`, [req.body.available, req.body.id])
            .then(result => {
                if (result !== undefined && result.rowCount === 1) {
                    resp.send({status: 'success', statusMessage: 'Service status updated', available: result.rows[0].service_status});
                } else {
                    resp.send({status: 'error', statusMessage: 'Cannot change availability'});
                }
            })
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        //});
    }
});

app.post('/api/user/services/edit', async(req, resp) => {
    if (req.session.user) {
        /* db.connect(async(err, client, done) => {
            if (err) { console.log(err); } */

            await db.query(`UPDATE user_services SET service_name = $1, service_detail = $2, service_listed_under = $3, service_worldwide = $4, service_country = $5, service_region = $6, service_city = $7, service_negotiable = $9, service_price_rate = $10, service_price_rate_type = $11, service_price_currency = $12 WHERE service_id = $8 RETURNING *`, [req.body.service_name, req.body.service_detail, req.body.service_listed_under, req.body.service_worldwide, req.body.service_country, req.body.service_region, req.body.service_city, req.body.service_id, req.body.service_negotiable, req.body.service_price_rate, req.body.service_price_rate_type, req.body.service_price_currency])
            .then(result => {
                if (result !== undefined && result.rows.length === 1) {
                    resp.send({status: 'success', statusMessage: 'Service edited', service: result.rows[0]});
                }
            })
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });

            /* if (edited.rowCount === 1) {
                await client.query(`SELECT * FROM user_services WHERE service_provided_by = $1 AND service_status != 'Deleted' ORDER BY service_id`, [req.session.user.username])
                .then(result => {
                    done();
                    if (result != undefined) {
                        for (let i in result.rows) {
                            result.rows[i].service_created_on = moment(result.rows[i].service_created_on).fromNow();
                        }

                        resp.send({status: 'success', statusMessage: 'Service updated', services: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    done();
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                });
            } else {
                done();
                resp.send({status: 'error', statusMessage: 'Edit service failed'});
            }
        }); */
    }
});

module.exports = app;