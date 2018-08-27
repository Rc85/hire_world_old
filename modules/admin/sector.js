const app = require('express').Router();
const db = require('../db');

app.post('/api/admin/add-sector', (req, resp) => {
    if (req.session.user && req.session.user.user_level > 6) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }
        
            let insert = await client.query(`INSERT INTO sectors (sectors, sector_created_by) VALUES ($1, $2)`, [req.body.sector, req.session.user.username])
            .then(result => {
                if (result !== undefined) {
                    return result;
                }
            })
            .catch(err => {
                console.log(err);
                done();
                resp.send({status: 'add sector error'});
            });

            if (insert.rowCount === 1) {
                await client.query(`SELECT * FROM sectors`)
                .then(result => {
                    done();
                    if (result !== undefined) {
                        resp.send({status: 'add sector success', sector: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    done();
                    resp.send({status: 'add sector error'});
                });
            } else {
                done();
                resp.send({status: 'add sector fail'});
            }
        })
    }
});

module.exports = app;