const app = require('express').Router();
const db = require('../db');

app.post('/api/user/services/add', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }

            let insert = await client.query(`INSERT INTO user_services (service_name, service_description, service_provided_by) VALUES ($1, $2, $3)`, [req.body.name, req.body.description, req.session.user.username])
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
                await client.query(`SELECT * FROM user_services WHERE service_provided_by = $1`, [req.session.user.username])
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
                resp.send({status: 'add service fail'});
            }
        });
    }
});

module.exports = app;