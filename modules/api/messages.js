const app = require('express').Router();
const db = require('../db');
const moment = require('moment');
const error = require('../utils/error-handler');
const controller = require('../utils/controller');

app.post('/api/conversation/submit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);
            let blankCheck = /^\s*$/;

            if (blankCheck.test(req.body.subject) || blankCheck.test(req.body.message)) {
                resp.send({status: 'send error', statusMessage: 'Subject or message cannot be blank'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (user && user.rows[0].user_status === 'Active') {
                            let allowMessaging = true;
                            
                            if (!req.body.messageId) {
                                await client.query(`SELECT allow_messaging FROM user_settings LEFT JOIN users ON users.user_id = user_settings.user_setting_id WHERE users.username = $1`, [req.body.user])
                                .then(result => {
                                    allowMessaging = result.rows[0].allow_messaging;
                                });
                            }

                            if (allowMessaging) {
                                let convoId = await client.query(`INSERT INTO conversations (conversation_starter, conversation_recipient, conversation_subject) VALUES ($1, $2, $3) RETURNING conversation_id`, [req.session.user.username, req.body.user, req.body.subject]);

                                await client.query(`INSERT INTO messages (message_creator, message_conversation_id, message_body) VALUES ($1, $2, $3)`, [req.session.user.username, convoId.rows[0].conversation_id, req.body.message]);

                                await client.query('COMMIT')
                                .then(() => {
                                    resp.send({status: 'success', statusMessage: 'Message sent'});
                                })
                            } else {
                                let error = new Error(`The user is not accepting new messages`);
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                throw errObj;
                            }
                        } else {
                            let error = new Error(`You're temporarily banned`);
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
            }
        });
    }
});

app.post('/api/conversation/reply', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            let blankCheck = /^\s*$/;

            if (!req.body.message) {
                resp.send({status: 'error', statusMessage: 'Message cannot be blank'});
            } else if (req.body.message && blankCheck.test(req.body.message)) {
                resp.send({status: 'error', statusMessage: 'Message cannot be blank'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (user && user.rows[0].user_status === 'Active') {
                            let authorized = await client.query(`SELECT conversation_starter, conversation_recipient FROM conversations WHERE conversation_id = $1`, [req.body.id]);

                            if (authorized.rows.length === 1 && (authorized.rows[0].conversation_starter === req.session.user.username || authorized.rows[0].conversation_recipient === req.session.user.username)) {
                                let message = await client.query(`INSERT INTO messages (message_body, message_creator, message_conversation_id) VALUES ($1, $2, $3) RETURNING *`, [req.body.message, req.session.user.username, req.body.id]);
                                let messageRow = await client.query(`SELECT messages.*, user_profiles.avatar_url FROM messages
                                LEFT JOIN users ON users.username = messages.message_creator
                                LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                                WHERE messages.message_id = $1`, [message.rows[0].message_id]);

                                await client.query('COMMIT')
                                .then(() => resp.send({status: 'success', message: messageRow.rows[0]}));
                            } else {
                                let error = new Error(`You're not authorized`);
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                throw errObj;
                            }
                        } else {
                            let error = new Error(`You're temporarily banned`);
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
            }
        });
    }
});

app.post('/api/conversation/delete', async(req, resp) => {
    if (req.session.user) {
        controller.conversations.delete(req.body.id, req, (status, statusMessage) => {
            resp.send({status: status, statusMessage: statusMessage});
        });
    }
});

/* app.post('/api/message/edit', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');
                    let authorized = await client.query(`SELECT message_sender FROM messages WHERE message_id = $1`, [req.body.message_id])

                    if (req.session.user.username === authorized.rows[0].message_sender) {
                        await client.query(`UPDATE messages SET message_body = $1, message_modified_date = current_timestamp WHERE message_id = $2`, [req.body.message, req.body.message_id]);
                        
                        let message = await client.query(`SELECT messages.*, user_profiles.avatar_url FROM messages LEFT JOIN users ON users.username = messages.message_sender LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id WHERE message_id = $1`, [req.body.message_id]);

                        await client.query('COMMIT')
                        .then(() => {
                            resp.send({status: 'success', message: message.rows[0]});
                        })
                    } else {
                        let error = new Error(`You're not authorized`);
                        error.type = 'user_defined';
                        throw error;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                console.log(err);

                let message = 'An error occurred';

                if (err.type === 'user_defined') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    }   
}); */

module.exports = app;