const app = require('express').Router();
const db = require('../db');

app.post('/api/admin/add-category', (req, resp) => {
    if (req.session.user && req.session.user.user_level > 6) {
        db.connect(async(err, client, done) => {
            if (err) { console.log(err); }
        
            let insert = await client.query(`INSERT INTO categories (category, category_created_by) VALUES ($1, $2)`, [req.body.category, req.session.user.username])
            .then(result => {
                if (result !== undefined) {
                    return result;
                }
            })
            .catch(err => {
                console.log(err);
                done();
                resp.send({status: 'add category error'});
            });

            if (insert.rowCount === 1) {
                await client.query(`SELECT * FROM categories`)
                .then(result => {
                    done();
                    if (result !== undefined) {
                        resp.send({status: 'add category success', categories: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    done();
                    resp.send({status: 'add category error'});
                });
            } else {
                done();
                resp.send({status: 'add category fail'});
            }
        })
    }
});

module.exports = app;