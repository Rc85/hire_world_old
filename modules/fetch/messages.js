const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.post('/api/get/messages', async(req, resp) => {
    if (req.session.user) {
        let queryString;

        if (req.body.user === 'User') {
            queryString = `SELECT * FROM messages LEFT JOIN jobs ON job_id = belongs_to_job WHERE job_user = $1 AND message_parent IS NULL ORDER BY new_message_status = 'New', new_message_status = 'Unread', message_date DESC`;
        } else {
            queryString = `SELECT * FROM messages LEFT JOIN jobs ON job_id = belongs_to_job WHERE message_sender = $1 AND message_parent IS NULL ORDER BY new_message_status = 'New', new_message_status = 'Unread', message_date DESC`;
        }

        await db.query(queryString, [req.session.user.username])
        .then(result => {
            if (result !== undefined) {
                for (let i in result.rows) {
                    result.rows[i].message_date = moment(result.rows[i].message_date).fromNow();
                }
                
                resp.send({status: 'success', messages: result.rows});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred while trying to retrieve messages'});
        });
    }
});

app.post('/api/get/message', async(req, resp) => {
    if (req.session.user) {
        let authorized = await db.query(`SELECT message_id FROM messages WHERE (message_recipient = $1 OR message_sender = $1) AND message_id = $2`, [req.session.user.username, req.body.id]);

        if (authorized !== undefined && authorized.rows.length === 1) {
            await db.query(`SELECT jobs.*, messages.*, user_services.service_name, user_services.service_detail, users.avatar_url FROM messages
            LEFT JOIN jobs ON job_id = belongs_to_job
            LEFT JOIN user_services ON service_id = job_service_id
            LEFT JOIN users ON username = message_sender
            WHERE message_id = $1 OR message_parent = $1
            ORDER BY message_date DESC`, [req.body.id])
            .then(result => {
                console.log(result);
                if (result !== undefined && result.rows.length > 0) {
                    for (let i in result.rows) {
                        result.rows[i].message_date = moment(result.rows[i].message_date).fromNow();
                        result.rows[i].job_created_date = moment(result.rows[i].job_created_date).fromNow();
                    }

                    resp.send({status: 'success', messages: result.rows});
                } else {
                    resp.send({status: 'error', statusMessage: 'Cannot retrieve the conversation with the other user'});
                }
            })
            .catch(err => {
                console.log(err);
                resp.send({status: 'access error', statusMessage: 'An error occurred when trying to retrieve this message'});
            });

            /* if (originalMessage !== undefined && originalMessage.rows.length === 1) {
                originalMessage.rows[0].message_date = moment(originalMessage.rows[0].message_date).fromNow();
                originalMessage.rows[0].job_created_date = moment(originalMessage.rows[0].job_created_date).fromNow();

                await db.query(`SELECT messages.*, users.avatar_url FROM messages LEFT JOIN users ON username = message_sender WHERE message_parent = $1 ORDER BY message_date DESC`, [originalMessage.rows[0].message_id])
                .then(result => {
                    if (result !== undefined) {
                        if (result.rows.length > 0) {
                            for (let i in result.rows) {
                                result.rows[i].message_date = moment(result.rows[i].message_date).fromNow();
                            }
                        }

                        resp.send({status: 'success', message: originalMessage.rows[0], replies: result.rows});
                    }
                })
                .catch(err => {
                    console.log(err);
                    resp.send({status: 'error', statusMessage: 'Cannot get the message conversation'});
                });
            } else {
                resp.send({status: 'access error', statusMessage: 'The requested message does not exist'});
            } */
        } else {
            resp.send({status: 'access error', statusMessage: `You're not authorized to view this message`});
        }
    }
});

module.exports = app;