const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.post('/api/message/submit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) { console.log(err); }
            let blankCheck = /^\s*$/;

            if (blankCheck.test(req.body.subject) || blankCheck.test(req.body.message)) {
                resp.send({status: 'send error', statusMessage: 'Subject or message cannot be blank'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let job = await client.query(`INSERT INTO jobs (job_client, job_service_id, job_user, job_subject) VALUES ($1, $2, $3, $4) RETURNING job_id`, [req.session.user.username, req.body.listing.listing_id, req.body.listing.listing_user, req.body.subject]);
                        await client.query(`INSERT INTO messages (belongs_to_job, message_sender, message_recipient, message_body) VALUES ($1, $2, $3, $4)`,
                        [job.rows[0].job_id, req.session.user.username, req.body.listing.listing_user, req.body.message]);
                        await client.query('COMMIT')
                        .then(() => {
                            resp.send({status: 'send success', statusMessage: 'Message sent'});
                        })
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    console.log(err);
                    if (err.code === '23505') {
                        resp.send({status: 'send error', statusMessage: 'You already have an active inquiry'});
                    } else {
                        resp.send({status: 'send error', statusMessage: 'Fail to send message'});
                    }
                })
            }
        });
    }
});

app.post('/api/message/reply', async(req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) console.log(err);

            let blankCheck = /^\s*$/;

            if (blankCheck.test(req.body.reply)) {
                resp.send({status: 'send error', statusMessage: 'Message cannot be blank'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');
                        let stage = await client.query(`SELECT job_status FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                        console.log(stage);

                        if (stage && (stage.rows[0].job_status !== 'Close' && stage.rows[0].job_status !== 'Decline')) {
                            let newMessage = await client.query(`INSERT INTO messages (belongs_to_job, message_sender, message_recipient, message_body, is_reply) VALUES ($1, $2, $3, $4, $5) RETURNING message_id`,
                            [req.body.job_id, req.session.user.username, req.body.recipient, req.body.message, true])
                            
                            let reply = await client.query(`SELECT messages.*, user_profiles.avatar_url FROM messages LEFT JOIN users ON username = message_sender LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE message_id = $1`, [newMessage.rows[0].message_id]);

                            await client.query('COMMIT')
                            .then(() => {
                                resp.send({status: 'send success', statusMessage: 'Message sent', reply: reply.rows[0]});
                            })
                        } else {
                            resp.send({status: 'error', statusMessage: 'Job is closed'});
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
                    resp.send({status: 'send error', statusMessage: 'Fail to send reply'});
                });
            }
        });
    }
});

app.post('/api/message/delete', async(req, resp) => {
    if (req.session.user) {
        let authorized = await db.query(`SELECT message_sender FROM messages WHERE message_id = $1`, [req.body.message_id]);

        if (req.session.user.username === authorized.rows[0].message_sender) {
            await db.query(`UPDATE messages SET message_status = 'Deleted' WHERE message_id = $1`, [req.body.message_id])
            .then(result => {
                if (result && result.rowCount === 1) {
                    resp.send({status: 'success', statusMessage: 'Message deleted'});
                } else {
                    resp.send({status: 'error', statusMessage: 'The message does not exist'});
                }
            })
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        } else {
            resp.send({status: 'error', statusMessage: `You're not authorized`});
        }
    }
});

app.post('/api/message/edit', (req, resp) => {
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
                        resp.send({status: 'error', statusMessage: `You're not authorized`});
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
                resp.send({status: 'error', statusMessage: `An error occurred`});
            });
        });
    }   
});

module.exports = app;