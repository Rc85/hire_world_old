const app = require('express').Router();
const db = require('../db');

app.post('/api/get/messages', async(req, resp) => {
    if (req.session.user) {

        console.log(req.body)
        let queryString;

        let deleted = await db.query(`SELECT deleted_job FROM deleted_jobs WHERE deleted_by = $1`, [req.session.user.username]);
        let deletedArray = [];

        for (let row of deleted.rows) {
            deletedArray.push(row.deleted_job);
        }

        if (req.body.user === 'User') {
            queryString = `SELECT * FROM messages
            LEFT JOIN jobs ON job_id = belongs_to_job
            WHERE job_user = $1 AND is_reply IS NOT TRUE AND job_stage = $2 AND NOT (job_id = ANY($3))
            ORDER BY message_status = 'New', message_status = 'Unread', message_date DESC`;
        } else {
            queryString = `SELECT * FROM messages
            LEFT JOIN jobs ON job_id = belongs_to_job
            WHERE job_client = $1 AND is_reply IS NOT TRUE AND job_stage = $2 AND NOT (job_id = ANY($3))
            ORDER BY message_status = 'New', message_status = 'Unread', message_date DESC`;
        }

        await db.query(queryString, [req.session.user.username, req.body.stage, deletedArray])
        .then(result => {
            if (result !== undefined) {
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
        let authorized = await db.query(`SELECT job_client, job_user FROM jobs WHERE (job_client = $1 OR job_user = $1) AND job_id = $2`, [req.session.user.username, req.body.id]);

        if (authorized !== undefined && authorized.rows.length === 1) {
            await db.query(`UPDATE jobs SET job_status = '' WHERE job_id = $1`, [req.body.id]);

            await db.query(`SELECT messages.*, users.avatar_url, jobs.job_stage FROM messages
            LEFT JOIN users ON username = message_sender
            LEFT JOIN jobs ON job_id = belongs_to_job
            WHERE belongs_to_job = $1
            AND job_stage = $2
            AND message_status != 'Deleted'
            ORDER BY message_date DESC
            LIMIT 10 OFFSET $3`, [req.body.id, req.body.stage, req.body.offset])
            .then(result => {
                if (result && result.rows.length > 0) {
                    resp.send({status: 'success', messages: result.rows});
                } else {
                    resp.send({status: 'fetch error', statusMessage: 'No more message to fetch'});
                }
            })
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        } else {
            resp.send({status: 'access error', statusMessage: `You're not authorized to view this message`});
        }
    }
});

module.exports = app;