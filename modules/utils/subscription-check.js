const db = require('../db');
const error = require('./error-handler');

module.exports = async(req, resp, next) => {
    await db.query(`SELECT account_type FROM users WHERE username = $1`, [req.session.user.username])
    .then(result => {
        if (result.rows.length > 0) {
            if (result.rows[0].account_type === 'User') {
                return resp.send({status: 'error', statusMessage: `You need to subscribe to a Link Work plan`});
            } else if (result.rows[0].account_type === 'Link Work') {
                next();
            }
        } else {
            return resp.send({status: 'error', statusMessage: `A login error occurred`});
        }
    })
    .catch(err => {
        return error.log(err, req, resp);
    });
}