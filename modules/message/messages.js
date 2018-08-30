const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.post('/api/message/submit', async(req, resp) => {
    if (req.session.user) {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(req.body.subject) || blankCheck.test(req.body.message)) {
            resp.send({status: 'error', statusMessage: 'Subject or message cannot be blank'});
        } else {
            let job = await db.query(`INSERT INTO jobs (job_client, job_service_id, job_user) VALUES ($1, $2, $3) RETURNING job_id`, [req.session.user.username, req.body.service.service_id, req.body.service.service_provided_by])
            .then(result => {
                return result;
            })
            .catch(err => {
                console.log(err);
                if (err.code === '23505') {
                    resp.send({status: 'error', statusMessage: 'You already have an active inquiry'});
                } else {
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                }
            });

            if (job !== undefined) {
                if (job.rowCount === 1) {
                    db.query(`INSERT INTO messages (belongs_to_job, message_subject, message_sender, message_recipient, message_body) VALUES ($1, $2, $3, $4, $5)`,
                    [job.rows[0].job_id, req.body.subject, req.session.user.username, req.body.service.service_provided_by, req.body.message])
                    .then(result => {
                        if (result !== undefined && result.rowCount === 1) {
                            resp.send({status: 'success', statusMessage: 'Messsge sent'});
                        } else {
                            resp.send({status: 'error', statusMessage: 'Message failed to send'});
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        resp.send({status: 'error', statusMessage: 'An error occurred'});
                    });
                } else {
                    resp.send({status: 'error', statusMessage: 'Fatal error: Please contact admin'});
                }
            }
        }
    }
});

app.post('/api/message/reply', async(req, resp) => {
    if (req.session.user) {
        let blankCheck = /^\s*$/;

        if (blankCheck.test(req.body.reply)) {
            resp.send({status: 'send error', statusMessage: 'Message cannot be blank'});
        } else {
            await db.query(`INSERT INTO messages (belongs_to_job, message_subject, message_sender, message_recipient, message_body, message_parent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING message_id`,
            [req.body.belongs_to, req.body.subject, req.session.user.username, req.body.recipient, req.body.reply, req.body.message])
            .then(async result => {
                if (result !== undefined && result.rowCount === 1) {
                    let reply = await db.query(`SELECT messages.*, users.avatar_url FROM messages LEFT JOIN users ON username = message_sender WHERE message_id = $1`, [result.rows[0].message_id]);
                    reply.rows[0].message_date = moment(reply.rows[0].message_date).fromNow();

                    resp.send({status: 'send success', statusMessage: 'Message sent', reply: reply.rows[0]});
                } else {
                    resp.send({status: 'send error', statusMessage: 'Message failed to send'});
                }
            })
            .catch(err => {
                console.log(err);
                resp.send({status: 'send error', statusMessage: 'An error occurred'});
            });
        }
    }
});

module.exports = app;