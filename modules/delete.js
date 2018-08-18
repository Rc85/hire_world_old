const app = require('express').Router();
const db = require('./db');

app.post('/api/delete/profile_pic', (req, resp) => {
    if (req.session.user) {
        db.query('UPDATE users SET avatar_url = $1 WHERE user_id = $2 RETURNING *', ['../images/profile.png', req.session.user.user_id])
        .then(result => {
            if (result !== undefined && result.rowCount === 1) {
                resp.send({status: 'delete success', user: result.rows[0]});
            } else if (result.rowCount === 0) {
                resp.send({status: 'delete fail'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'delete error'});
        });
    }
});

module.exports = app;