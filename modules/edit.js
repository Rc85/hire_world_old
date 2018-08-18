const db = require('./db');
const app = require('express').Router();

app.post('/api/edit/user', async(req, resp) => {
    if (req.session.user) {
        let type = req.body.type;
        let value = req.body.value;

        await db.query(`UPDATE users SET ${type} = $1 WHERE username = $2 RETURNING *`, [value, req.session.user.username])
        .then(result => {
            if (result !== undefined && result.rowCount === 1) {
                req.session.user = result.rows[0];
                resp.send({status: `edit ${type} success`, user: result.rows[0]});
            } else {
                resp.send({status: `edit ${type} fail`});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: `edit ${type} error`});
        });
    }
});

module.exports = app;