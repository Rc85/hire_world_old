const db = require('../db');

module.exports = {
    create: async(c, name, date, owner, type, reference, message) => {
        let client = db;

        if (c) client = c;

        return await client.query(`INSERT INTO user_events (event_name, event_date, event_owner, event_type, event_reference_id, event_message) VALUES ($1, $2, $3, $4, $5, $6)`, [name, date, owner, type, reference, message]);
    }
}