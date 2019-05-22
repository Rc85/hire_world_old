const app = require('express').Router();
const db = require('../../pg_conf');
const error = require('../utils/error-handler');
const authenticate = require('../../middlewares/auth');

app.post('/api/get/messages/:type', authenticate, async(req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        (async() => {
            try {
                await client.query('BEGIN');

                let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                if (user && user.rows[0].user_status === 'Active') {
                    let pinnedMessageQuery = '';
                    let messageQueryType = `(conversation_starter = $1 OR conversation_recipient = $1)`;

                    let pinned = await client.query(`SELECT pinned_message FROM pinned_messages WHERE message_pinned_by = $1`, [req.session.user.username]);
                    let pinnedIds = [];
                    let deleted = await client.query(`SELECT deleted_convo FROM deleted_conversations WHERE convo_deleted_by = $1`, [req.session.user.username]);
                    let deletedIds = [];

                    for (let row of deleted.rows) {
                        deletedIds.push(row.deleted_convo);
                    }

                    for (let row of pinned.rows) {
                        pinnedIds.push(row.pinned_message);
                    }

                    let params = [req.session.user.username, req.body.offset, deletedIds];

                    if (req.params.type === 'received') {
                        messageQueryType = `conversation_recipient = $1`;
                    } else if (req.params.type === 'sent') {
                        messageQueryType = `conversation_starter = $1`;
                    } else if (req.params.type === 'pinned') {
                        params.push(pinnedIds);
                        pinnedMessageQuery = `AND conversations.conversation_id = ANY($${params.length})`;
                    }

                    let queryString = `SELECT *,
                        (SELECT COUNT(conversation_id) AS conversation_count FROM conversations
                        WHERE ${messageQueryType}
                        ${pinnedMessageQuery}
                        AND NOT conversation_id = ANY($3))
                    FROM conversations
                    LEFT JOIN
                        (SELECT message_conversation_id, COUNT(message_id) AS unread_messages FROM messages
                        WHERE message_status = 'New'
                        AND message_creator != $1
                        GROUP BY message_conversation_id) AS unread ON unread.message_conversation_id = conversations.conversation_id
                    WHERE ${messageQueryType}
                    ${pinnedMessageQuery}
                    AND NOT conversation_id = ANY($3)
                    AND conversation_status != 'Deleted'
                    ORDER BY conversation_status = 'New' DESC, conversation_date DESC
                    LIMIT 10 OFFSET $2`;
                    
                    let messages = await client.query(queryString, params);
                    let messageCount = 0;
                    
                    if (messages.rows.length > 0) {
                        messageCount = messages.rows[0].conversation_count;
                    }

                    if (req.params.type === 'pinned') {
                        messageCount = pinnedIds.length;
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', messages: messages.rows, messageCount: messageCount, pinned: pinnedIds}));
                } else if (user && user.rows[0].user_status === 'Suspend') {
                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'suspended', messages: [], messageCount: 0, pinned: []}));
                }
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                done();
            }
        })()
        .catch(err => error.log(err, req, resp));
    });
});

app.post('/api/get/message', authenticate, async(req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    let authorized = await client.query(`SELECT conversation_starter, conversation_recipient FROM conversations WHERE (conversation_starter = $1 OR conversation_recipient = $1) AND conversation_id = $2`, [req.session.user.username, req.body.message_id]);

                    if (authorized !== undefined && authorized.rows.length === 1) {
                        if (authorized.rows[0].conversation_recipient === req.session.user.username) {
                            await client.query(`UPDATE conversations SET conversation_status = 'Read' WHERE conversation_id = $1 AND conversation_status = 'New'`, [req.body.message_id]);
                        }

                        let conversation = await client.query(`SELECT * FROM conversations WHERE conversation_id = $1`, [req.body.message_id]);

                        let messages = await client.query(`SELECT (
                            SELECT COUNT(message_id) AS message_count FROM messages
                            WHERE message_conversation_id = $1
                        ),
                        messages.*, user_profiles.avatar_url FROM messages
                        LEFT JOIN users ON users.username = messages.message_creator
                        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                        WHERE messages.message_conversation_id = $1
                        ORDER BY messages.message_date DESC
                        LIMIT 25 OFFSET $2`, [req.body.message_id, req.body.offset]);

                        await client.query(`UPDATE messages SET message_status = 'Read' WHERE message_conversation_id = $1 AND message_status = 'New' AND message_creator != $2`, [req.body.message_id, req.session.user.username]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', conversation: conversation.rows[0], messages: messages.rows}));
                    } else {
                        let error = new Error(`You're not authorized`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log(err, req, resp);
            });
        });
});

module.exports = app;