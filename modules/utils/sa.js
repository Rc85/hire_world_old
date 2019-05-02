const db = require('../db');

module.exports = {
    /**
     * @param {String} source The source of the suspicious activity. Usually is a feature related, such as Subscription, Payment, etc.
     * @param {String} details Any details that describes the suspicious activity
     * @param {String} user User of the suspicious activity
     * @param {Number} severity The severity level between 1 - 5. Use your best judgment
     * @param {String|Number} ref An identifier to narrow down the source
     */
    create: (source, details, user, severity, ref) => {
        db.query(`INSERT INTO suspicious_activities (sa_source, sa_details, suspicious_user, sa_severity, sa_reference) VALUES ($1, $2, $3, $4, $5)`, [source, details, user, severity, ref]);
    },
    /**
     * @param {Number|String} userOrId The id or user
     * @param {String} source The source
     * @param {Number} severity The severity level from 1 - 5
     */
    retrieve: async(obj) => {
        let {id, user, source, severity} = obj;
        let params = [];
        let queryString = `SELECT * FROM suspicious_activities`;

        if (id || user || source || severity) {
            queryString += 'WHERE';
        }
        
        if (id) {
            params.push(id);
            queryString += `sa_id = $${params.length}`
        }

        if (id) {
            params.push(user);
            queryString += `suspicious_user = $${params.length}`
        }

        if (source) {
            params.push(source);
            queryString += `sa_source = $${params.length}`
        }

        if (severity) {
            params.push(severity);
            queryString += `sa_severity = $${params.length}`
        }

        queryString += 'ORDER BY sa_id';

        return await db.query(queryString, params);
    }
}