const app = require('express').Router();
const db = require('../db');

app.post('/api/admin/sector/add', (req, resp) => {
    db.connect(async(err, client, done) => {
        if (err) console.log(err);
    
        (async() => {
            try {
                await client.query('BEGIN');
                let sector = await client.query(`INSERT INTO sectors (sector, sector_created_by) VALUES ($1, $2) ON CONFLICT (sector) DO UPDATE SET sector_status = 'Open' RETURNING *`, [req.body.sector, req.session.user.username])
                
                await client.query('COMMIT')
                .then(() => resp.send({status: 'success', sectors: sector.rows[0]}));
            } catch (e) {
                await client.query('ROLLBACK');
                ;
            } finally {
                done()
            }
        })()
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    });
});

app.post('/api/admin/sector/change-status', async(req, resp) => {
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
});

app.get('/api/admin/sectors/get', async(req, resp) => {
    await db.query(`SELECT * FROM sectors WHERE sector_status != 'Delete' ORDER BY sector`)
    .then(result => {
        if (result) resp.send({status: 'success', sectors: result.rows});
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/admin/sector/rename', async(req, resp) => {
    await db.query(`UPDATE sectors SET sector = $1 WHERE sector_id = $2 RETURNING *`, [req.body.name, req.body.id])
    .then(result => {
        if (result) resp.send({status: 'success', sector: result.rows[0]});
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;