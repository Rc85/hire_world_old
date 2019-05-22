const db = require('../pg_conf');
const error = require('../modules/utils/error-handler');

module.exports = {
    conversations: {
        delete: async(id, req, callback) => {
            let authorized = await db.query(`SELECT conversation_starter, conversation_recipient FROM conversations WHERE conversation_id = $1`, [id]);

            if (req.session.user.username === authorized.rows[0].conversation_recipient || req.session.user.username === authorized.rows[0].conversation_starter) {
                await db.query(`INSERT INTO deleted_conversations (deleted_convo, convo_deleted_by) VALUES ($1, $2)`, [id, req.session.user.username])
                .then(result => {
                    if (result && result.rowCount === 1) {
                        callback('success', 'Message deleted');
                    }
                })
                .catch(err => {
                    error.log(err, req);
                    callback('error', 'An error occurred');
                });
            } else {
                callback('error', `You're not authorized`);
            }
        }
    },
}