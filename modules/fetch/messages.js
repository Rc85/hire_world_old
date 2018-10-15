const app = require('express').Router();
const db = require('../db');

app.post('/api/get/messages', async(req, resp) => {
    if (req.session.user) {
        let queryString;

        let deleted = await db.query(`SELECT deleted_job FROM deleted_jobs WHERE deleted_by = $1`, [req.session.user.username]);
        let deletedArray = [];

        for (let row of deleted.rows) {
            deletedArray.push(row.deleted_job);
        }

        queryString = `SELECT * FROM messages
        LEFT JOIN jobs ON job_id = belongs_to_job
        LEFT JOIN (SELECT * FROM user_reviews WHERE reviewer = $1) rt ON review_job_id = job_id
        WHERE (message_recipient = $1 OR message_sender = $1) AND is_reply IS NOT TRUE ${req.body.stage === 'Abandoned' ? `AND job_stage IN ($2, 'Incomplete')` : `AND job_stage = $2`} AND NOT (job_id = ANY($3))
        ORDER BY message_status = 'New' DESC, message_date DESC`;

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
        console.log(req.body.stage)
        let authorized = await db.query(`SELECT job_client, job_user FROM jobs WHERE (job_client = $1 OR job_user = $1) AND job_id = $2`, [req.session.user.username, req.body.job_id]);

        if (authorized !== undefined && authorized.rows.length === 1) {
            await db.query(`UPDATE jobs SET job_is_new = false WHERE job_id = $1`, [req.body.job_id]);

            await db.query(`SELECT messages.*, user_profiles.avatar_url, jobs.job_stage FROM messages
            LEFT JOIN users ON username = message_sender
            LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
            LEFT JOIN jobs ON job_id = belongs_to_job
            WHERE belongs_to_job = $1
            ${req.body.stage === 'Abandoned' ? `AND job_stage IN ($2, 'Incomplete')` : `AND job_stage = $2`}
            AND message_status != 'Deleted'
            ORDER BY message_date DESC
            LIMIT 10 OFFSET $3`, [req.body.job_id, req.body.stage, req.body.offset])
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