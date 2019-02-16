const db = require('../db');

module.exports = {
    log: async (err, req, resp, url) => {
        console.log(err);
        
        let message = 'An error occurred';
        let status = 'error';

        if (err.type === 'CUSTOM') {
            message = err.error.message;
        }

        if (err.status) {
            status = err.status;
        }

        await db.query(`INSERT INTO error_log (error, error_url) VALUES ($1, $2) ON CONFLICT (error) DO UPDATE SET error_occurrence = error_log.error_occurrence + 1`, [err.stack, url ? url : req.url]);

        resp.send({status: status, statusMessage: message});
    }
}