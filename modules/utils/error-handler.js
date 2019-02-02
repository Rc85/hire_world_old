const db = require('../db');

module.exports = {
    log: async (err, req, resp, url) => {
        console.log(err);
        
        let message = 'An error occurred';

        if (err.type === 'CUSTOM') {
            message = err.error.message;
        }

        await db.query(`INSERT INTO error_log (error, error_url) VALUES ($1, $2) ON CONFLICT (error) DO UPDATE SET error_occurrence = error_log.error_occurrence + 1`, [err.stack, url ? url : req.url]);

        resp.send({status: 'error', statusMessage: message});
    }
}