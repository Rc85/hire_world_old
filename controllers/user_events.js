const db = require('../pg_conf');

module.exports = {
    create: async(dbClient, name, date, owner, type, reference, message) => {
        if (!dbClient) dbClient = db;

        let event = await dbClient.query(`INSERT INTO user_events (event_name, event_date, event_owner, event_type, event_reference_id, event_message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [name, date, owner, type, reference, message])
        .then(result => {
            if (result && result.rowCount === 1) {
                return result.rows[0];
            } else {
                return false;
            }
        })
        .catch(err => {
            return err;
        });

        return event;
    }
}