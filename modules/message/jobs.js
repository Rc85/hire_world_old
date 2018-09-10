const app = require('express').Router();
const db = require('../db');

app.post('/api/jobs/delete', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let userList = await client.query(`SELECT job_user FROM jobs WHERE job_id = ANY($1)`, [req.body.ids]);
                    let authorized = true;

                    for (let user of userList.rows) {
                        if (user.job_user !== req.session.user.username) {
                            authorized = false;
                        }
                    }

                    if (authorized) {
                        for (let id of req.body.ids) {
                            await client.query(`INSERT INTO deleted_jobs (deleted_by, deleted_job) VALUES ($1, $2)`, [req.session.user.username, id]);
                        }

                        let deleted =  await client.query(`SELECT deleted_job FROM deleted_jobs WHERE deleted_by = $1`, [req.session.user.username])
                        let deletedArray = [];

                        for (let row of deleted.rows) {
                            deletedArray.push(row.deleted_job);
                        }

                        console.log(deletedArray)

                        let jobs = await client.query(`SELECT * FROM jobs WHERE job_stage = $1 AND NOT (job_id = ANY($2)) ORDER BY job_created_date DESC`, [req.body.stage, deletedArray]);
                        console.log(jobs);

                        await client.query('COMMIT')
                        .then(() => {
                            resp.send({status: 'success', jobs: jobs.rows});
                        });
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
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/complete', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_user, job_user_complete, job_client_complete FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (authorized.rows[0].job_user === req.session.user.username && !authorized.rows[0].job_user_complete) {
                        let job = await client.query(`UPDATE jobs SET job_user_complete = $1, job_client_complete = $2 WHERE job_id = $3 RETURNING *`, [true, null, req.body.job_id]);

                        let messageBody = `The other party has requested approval to complete this job.`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, message_recipient, is_reply) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (belongs_to_job, message_body, message_type) WHERE message_type = 'Confirmation' AND message_body = 'The other party has requested approval to complete this job.' DO UPDATE SET message_modified_date = current_timestamp RETURNING *`, [req.body.job_id, messageBody, 'Confirmation', req.body.recipient, true])
                        
                        await client.query('COMMIT')
                        .then(() => {
                            resp.send({status: 'success', statusMessage: 'Request sent', message: message.rows[0], job: job.rows[0]});
                        });
                    } else {
                        throw new Error(`You're not authorized`);
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
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/complete/:decision', (req, resp) => {
    if (req.session.user) {
        db.connect(async(err, client, done) => {
            if (err) console.log(err);

            if (req.params.decision === 'approve') {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let authorized = await client.query(`SELECT job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                        if (req.session.user.username === authorized.rows[0].job_client) {
                            await client.query(`UPDATE jobs SET job_client_complete = $1 WHERE job_id = $2`, [true, req.body.job_id]);
                            await client.query(`UPDATE jobs SET job_stage = 'Complete' WHERE job_id = $1`, [req.body.job_id]);

                            let messageBody = `Your request has been approved. Please take the time to review the other party.`;

                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply) VALUES ($1, $2, $3, $4, $5)`, [req.body.job_id, messageBody, req.body.recipient, 'Update', true]);

                            await client.query('COMMIT')
                            .then(() => {
                                resp.send({status: 'job complete'});
                            })
                        } else {
                            throw new Error(`You're not authorized`);
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
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                });
            } else if (req.params.decision === 'decline') {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let authorized = await client.query(`SELECT job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                        if (req.session.user.username === authorized.rows[0].job_client) {
                            let job = await client.query(`UPDATE jobs SET job_user_complete = $1, job_client_complete = $1 WHERE job_id = $2 RETURNING *`, [false, req.body.job_id]);

                            let messageBody = `Your request for completion has been declined.
                            
                            REASON: ${req.body.message}`;

                            let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.body.job_id, messageBody, req.body.recipient, 'Warning', true])

                            await client.query('COMMIT')
                            .then(() => {
                                resp.send({status: 'success', message: message.rows[0], job: job.rows[0]});
                            })
                        } else {
                            throw new Error(`You're not authorized`);
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
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                });
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;