require('dotenv').config({path: __dirname + '/.env'});
const db = require('../modules/db');
const error = require('../modules/utils/error-handler');

db.query(`SELECT subscription_end_date FROM subscriptions
WHERE CAST(subscription_end_date AS date) - current_timestamp < 0
AND subscription_status = 'Active'`)
.then(result => {
    if (result && result.rows.length > 0) {
        let ids = [];

        for (let row of result.rows) {
            ids.push(row.sub_id);
        }

        db.query(`UPDATE subscriptions SET subscription_status = 'Inactive' WHERE sub_id = ANY($1)`, [ids])
        .catch(err => error.log(err, false, false, 'check_subscriptions'));
    }
})
.catch(err => error.log(err, false, false, 'check_subscriptions'));