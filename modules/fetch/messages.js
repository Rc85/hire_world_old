const app = require('express').Router();
const db = require('../db');

app.post('/api/get/messages/:type', async(req, resp) => {
    if (req.session.user) {
        let pinnedMessageQuery;
        let messageQueryType = '(message_sender = $1 OR message_recipient = $1)';
        let deletedQuery = 'AND NOT';
        
        let deleted = await db.query(`SELECT deleted_job FROM deleted_jobs WHERE deleted_by = $1`, [req.session.user.username]);
        let deletedArray = [];
        let pinned = await db.query(`SELECT pinned_job FROM pinned_jobs WHERE pinned_by = $1`, [req.session.user.username]);
        let pinnedArray = [];
        
        for (let row of deleted.rows) {
            deletedArray.push(row.deleted_job);
        }

        for (let row of pinned.rows) {
            pinnedArray.push(row.pinned_job);
        }

        let params = [req.session.user.username, req.body.stage, deletedArray, req.body.offset];
        
        if (req.params.type === 'received') {
            messageQueryType = `message_recipient = $1`;
        } else if (req.params.type === 'sent') {
            messageQueryType = `message_sender = $1`;
        } else if (req.params.type === 'pinned') {
            params.push(pinnedArray);
            pinnedMessageQuery = `AND jobs.job_id = ANY($5)`
        } else if (req.params.type === 'deleted') {
            deletedQuery = 'AND';
        }

        let queryString = `SELECT jobs.*, orig.*, unread.unread_messages, (
            SELECT COUNT(job_id) AS message_count FROM jobs
            LEFT JOIN messages ON jobs.job_id = messages.belongs_to_job
            WHERE ${messageQueryType} AND is_reply IS NOT TRUE
            ${req.body.stage === 'Abandoned' ? `AND jobs.job_stage IN ($2, 'Incomplete')` : `AND jobs.job_stage = $2`}
            AND NOT jobs.job_id = ANY($3)
            AND message_status NOT IN ('Deleted', 'Closed')
        ) FROM messages AS orig
        LEFT JOIN jobs ON jobs.job_id = orig.belongs_to_job
        LEFT JOIN (SELECT * FROM user_reviews WHERE reviewer = $1) rt ON rt.review_job_id = jobs.job_id
        LEFT JOIN (
            SELECT belongs_to_job, COUNT(message_id) AS unread_messages FROM messages
            WHERE message_status = 'New'
            AND message_recipient = $1
            GROUP BY belongs_to_job
        ) AS unread ON unread.belongs_to_job = orig.belongs_to_job
        WHERE ${messageQueryType}
        AND is_reply IS NOT TRUE ${req.body.stage === 'Abandoned' ? `AND jobs.job_stage IN ($2, 'Incomplete')` : `AND jobs.job_stage = $2`}
        ${deletedQuery} jobs.job_id = ANY($3)
        ${pinnedMessageQuery ? pinnedMessageQuery : ''}
        AND job_status != 'Closed'
        ORDER BY jobs.job_status, orig.message_status, orig.message_date DESC
        OFFSET $4 LIMIT 25`;

        await db.query(queryString, params)
        .then(result => {
            if (result) {
                if (req.params.type === 'pinned') {
                    result.rows[0].message_count = pinnedArray.length;
                }
                
                resp.send({status: 'success', messages: result.rows, message_count: result.rows[0].message_count, pinned: pinnedArray});
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
        let authorized = await db.query(`SELECT job_client, job_user FROM jobs WHERE (job_client = $1 OR job_user = $1) AND job_id = $2`, [req.session.user.username, req.body.job_id]);

        if (authorized !== undefined && authorized.rows.length === 1) {
            let messages = await db.query(`SELECT messages.*, user_profiles.avatar_url, jobs.job_stage FROM messages
            LEFT JOIN users ON username = message_sender
            LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
            LEFT JOIN jobs ON job_id = belongs_to_job
            WHERE belongs_to_job = $1
            ${req.body.stage === 'Abandoned' ? `AND job_stage IN ($2, 'Incomplete')` : `AND job_stage = $2`}
            AND message_status != 'Deleted'
            AND NOT (message_sender = 'System' AND message_recipient != $4)
            ORDER BY message_date DESC
            LIMIT 10 OFFSET $3`, [req.body.job_id, req.body.stage, req.body.offset, req.session.user.username]);

            if (authorized.rows[0].job_user === req.session.user.username) {
                await db.query(`UPDATE jobs SET job_status = 'Viewed' WHERE job_id = $1 AND job_status = 'New'`, [req.body.job_id]);
            }

            let deleted = await db.query(`SELECT pinned_job FROM pinned_jobs WHERE pinned_job = $1 AND pinned_by = $2`, [req.body.job_id, req.session.user.username])
            .then(result => {
                if (result && result.rows.length === 1) {
                    return true;
                } else if (result && result.rows.length === 0) {
                    return false
                }
            })
            .catch(err => console.log(err));

            await db.query(`UPDATE messages SET message_status = 'Read' WHERE belongs_to_job = $1 AND message_recipient = $2 AND message_status NOT IN ('Deleted', 'Closed')`, [req.body.job_id, req.session.user.username])
            .then(() => {
                if (messages && messages.rows.length > 0) {
                    resp.send({status: 'success', messages: messages.rows, deleted: deleted});
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