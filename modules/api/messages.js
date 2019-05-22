const app = require('express').Router();
const db = require('../../pg_conf');
const moment = require('moment');
const error = require('../utils/error-handler');
const conversations = require('../../controllers/conversations');
const sgMail = require('@sendgrid/mail');
const request = require('request');
const authenticate = require('../../middlewares/auth');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/conversation/submit', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);
            let blankCheck = /^\s*$/;

            if (blankCheck.test(req.body.subject) || blankCheck.test(req.body.message)) {
                resp.send({status: 'send error', statusMessage: 'Subject or message cannot be blank'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        let sender = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (sender && sender.rows[0].user_status === 'Active') {
                            let receiver = await client.query(`SELECT user_email, allow_messaging, email_notifications FROM user_settings LEFT JOIN users ON users.user_id = user_settings.user_setting_id WHERE users.username = $1`, [req.body.user]);

                            let blocked = await client.query(`SELECT * FROM blocked_users WHERE blocked_user = $1 AND blocking_user = $2`, [req.session.user.username, req.body.user]);

                            if (receiver.rows[0].allow_messaging && blocked.rows.length === 0) {
                                let convoId = await client.query(`INSERT INTO conversations (conversation_starter, conversation_recipient, conversation_subject) VALUES ($1, $2, $3) RETURNING conversation_id`, [req.session.user.username, req.body.user, req.body.subject]);

                                await client.query(`INSERT INTO messages (message_creator, message_conversation_id, message_body) VALUES ($1, $2, $3)`, [req.session.user.username, convoId.rows[0].conversation_id, req.body.message]);

                                await client.query('COMMIT')
                                .then(() => {
                                    resp.send({status: 'success', statusMessage: 'Message sent'});
                                })
                            } else if (!receiver.rows[0].allow_messaging) {
                                let error = new Error(`The user is not accepting new messages`);
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                throw errObj;
                            } else if (blocked.rows.length > 0) {
                                let error = new Error(`You have been blocked by this user`);
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
});

app.post('/api/conversation/reply', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

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
                                .then(() => resp.send({status: 'success', statusMessage: 'Message sent', message: messageRow.rows[0]}));
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
});

app.post('/api/conversation/delete', authenticate, async(req, resp) => {
    conversations.delete(req.body.id, req, (status, statusMessage) => {
        resp.send({status: status, statusMessage: statusMessage});
    });
});

module.exports = app;