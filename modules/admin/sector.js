const app = require('express').Router();
const db = require('../db');

app.post('/api/admin/sector/add', (req, resp) => {
    //if (req.session.user && req.session.user.userLevel > 90) {
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
    //}
});

app.post('/api/admin/sector/change-status', async(req, resp) => {
    //if (req.session.user && req.session.user.userLevel > 90) {
        await db.query(`UPDATE sectors SET sector_status = $1 WHERE sector_id = $2 RETURNING *`, [req.body.status, req.body.id])
        .then(result => {
            if (result && result.rowCount === 1) {
                let sector = result.rows[0];

                if (req.body.status === 'Delete') {
                    sector = null;
                }

                resp.send({status: 'success', sector: sector});
            } else {
                resp.send({status: 'error', statusMessage: 'Fail to change status'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    /* } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    } */
});

app.get('/api/admin/sectors/fetch', async(req, resp) => {
    //if (req.session.user && req.session.user.userLevel > 90) {
        await db.query(`SELECT * FROM sectors WHERE sector_status != 'Delete' ORDER BY sector`)
        .then(result => {
            if (result) {
                resp.send({status: 'success', sectors: result.rows});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    /* } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    } */
});

module.exports = app;