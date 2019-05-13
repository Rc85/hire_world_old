const db = require('../db');
const error = require('./error-handler');

module.exports = async(req, resp, next) => {
    await db.query(`SELECT subscription_name FROM subscriptions WHERE subscriber = $1 AND subscription_end_date >= current_timestamp`, [req.session.user.username])
    .then(result => {
        if (result.rows.length === 0) {
            return resp.send({status: 'error', statusMessage: `You need to subscribe to a Link Work plan`});
        } else if (result.rows.length === 1 && result.rows[0].subscription_name === 'Link Work') {
            next();
        }
    })
    .catch(err => {
        return error.log(err, req, resp);
    });
}