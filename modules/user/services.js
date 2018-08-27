const app = require('express').Router();
const db = require('../db');

app.post('/api/user/services/add', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }

            let insert = await client.query(`INSERT INTO user_services (service_name, service_detail, service_provided_by, service_listed_under, service_worldwide, service_country, service_region, service_city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [req.body.name, req.body.detail, req.session.user.username, req.body.listUnder, req.body.worldwide, req.body.country, req.body.region, req.body.city])
            .then(result => {
                if (result !== undefined) {
                    return result;
                }
            })
            .catch(err => {
                console.log(err);
                done();
                resp.send({status: 'add service error'})
            });

            if (insert.rowCount === 1) {
                await client.query(`SELECT * FROM user_services WHERE service_provided_by = $1 ORDER BY service_id`, [req.session.user.username])
                .then(result => {
                    done();
                    if (result !== undefined) {
                        resp.send({status: 'add service success', services: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    done();
                    resp.send({status: 'add service error'});
                });
            } else {
                done();
                resp.send({status: 'add service fail'});
            }
        });
    }
});

app.post('/api/user/services/delete', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }

            let deleted = await client.query(`DELETE FROM user_services WHERE service_id = $1`, [req.body.id])
            .then(result => {
                console.log(result);
                if (result !== undefined) {
                    return result;
                }
            })
            .catch(err => {
                console.log(err);
                done();
                resp.send({status: 'delete service error'});
            });

            if (deleted.rowCount === 1) {
                await client.query(`SELECT * FROM user_services WHERE service_provided_by = $1 ORDER BY service_id`, [req.session.user.username])
                .then(result => {
                    if (result !== undefined) {
                        resp.send({status: 'delete service success', services: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    done();
                    resp.send({status: 'delete service error'});
                });
            } else {
                done();
                resp.send({status: 'delete service fail'});
            }
        });
    }
});

app.post('/api/user/services/status', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }

            let changed = await client.query(`UPDATE user_services SET service_status = $1 WHERE service_id = $2`, [req.body.available, req.body.id])
            .then(result => {
                if (result !== undefined) {
                    return result;
                }
            })
            .catch(err => {
                console.log(err);
                done();
                resp.send({status: 'service status error'});
            });

            if (changed.rowCount === 1) {
                await client.query(`SELECT * FROM user_services WHERE service_provided_by = $1 ORDER BY service_id`, [req.session.user.username])
                .then(result => {
                    done();
                    if (result !== undefined) {
                        resp.send({status: 'service status success', services: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    done();
                    resp.send({status: 'service status error'});
                });
            } else {
                done();
                resp.send({status: 'service status fail'});
            }
        });
    }
});

app.post('/api/user/services/edit', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }

            let edited = await client.query(`UPDATE user_services SET service_name = $1, service_detail = $2, service_listed_under = $3, service_worldwide = $4, service_country = $5, service_region = $6, service_city = $7 WHERE service_id = $8`, [req.body.name, req.body.detail, req.body.listUnder, req.body.worldwide, req.body.country, req.body.region, req.body.city, req.body.id])
            .then(result => {
                if (result !== undefined) {
                    return result;
                }
            })
            .catch(err => {
                console.log(err);
                done();
                resp.send({status: 'edit service error'});
            });

            if (edited.rowCount === 1) {
                await client.query(`SELECT * FROM user_services WHERE service_provided_by = $1 ORDER BY service_id`, [req.session.user.username])
                .then(result => {
                    done();
                    if (result != undefined) {
                        resp.send({status: 'edit service success', services: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    done();
                    resp.send({status: 'edit service error'});
                });
            } else {
                done();
                resp.send({status: 'edit service fail'});
            }
        });
    }
});

module.exports = app;