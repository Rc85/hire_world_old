const db = require('../db');

module.exports = {
    log: async (obj, callback) => {
        console.log(obj)
        await db.query(`INSERT INTO error_log (error_name, error_message, error_origin, error_url) VALUES ($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT unique_error DO UPDATE SET error_occurrence = error_log.error_occurrence + 1`, [obj.name, obj.message, obj.origin, obj.url])
        .then(result => {
            if (result && result.rowCount === 1 && callback) {
                callback('success');
            } else if (result && result.rowCount === 0 && callback) {
                callback('error');
            }
        })
        .catch(err => {
            if (callback) {
                callback('error');
            }
            
            console.log(err);
        });
    }
}