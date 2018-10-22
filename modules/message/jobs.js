const app = require('express').Router();
const db = require('../db');
const cryptojs = require('crypto-js');

app.post('/api/jobs/delete', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
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

                        let jobs = await client.query(`SELECT * FROM jobs WHERE job_stage = $1 AND NOT (job_id = ANY($2)) ORDER BY job_created_date DESC`, [req.body.stage, deletedArray]);

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
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_user, job_user_complete, job_client_complete FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (authorized.rows[0].job_user === req.session.user.username && !authorized.rows[0].job_user_complete) { 
                        let job = await client.query(`UPDATE jobs SET job_user_complete = $1, job_client_complete = $2 WHERE job_id = $3 RETURNING *`, [true, null, req.body.job_id]);

                        let messageBody = `The other party has requested approval to complete this job.`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, message_recipient, is_reply) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (belongs_to_job, message_body, message_type) WHERE message_type = 'Confirmation' AND message_body = 'The other party has requested approval to complete this job.' DO UPDATE SET message_modified_date = current_timestamp RETURNING *`, [req.body.job_id, messageBody, 'Confirmation', req.body.recipient, true]);
                        
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
        db.connect((err, client, done) => {
            if (err) console.log(err);
            console.log(req.body)

            if (req.params.decision === 'approve') {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                        if (req.session.user.username === authorized.rows[0].job_client) {
                            await client.query(`UPDATE jobs SET job_client_complete = $1, job_stage = 'Complete', job_status = 'Complete' WHERE job_id = $2`, [true, req.body.job_id]);

                            let encryptUserToken = cryptojs.AES.encrypt(authorized.rows[0].job_user, 'authorize authentic review');
                            let encryptClientToken = cryptojs.AES.encrypt(authorized.rows[0].job_client, 'authorize authentic review');
                            let userToken = encodeURIComponent(encryptUserToken.toString());
                            let clientToken = encodeURIComponent(encryptClientToken.toString());

                            await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review_token, review_job_id) VALUES ($1, $2, $3, $4)`, [authorized.rows[0].job_user, authorized.rows[0].job_client, userToken, req.body.job_id]);
                            await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review_token, review_job_id) VALUES ($1, $2, $3, $4)`, [authorized.rows[0].job_client, authorized.rows[0].job_user, clientToken, req.body.job_id]);

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

app.post('/api/job/close', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);

                    let authorized = await client.query(`SELECT job_id FROM jobs WHERE job_id = $1 AND (job_user = $2 OR job_client = $2)`, [req.body.job_id, req.session.user.username]);

                    if (authorized && authorized.rows.length === 1) {
                        await client.query(`UPDATE jobs SET job_status = 'Closed' WHERE job_id = $1`, [req.body.job_id])
                        await client.query(`UPDATE messages SET message_status = '' WHERE belongs_to_job = $1`, [req.body.job_id]);

                        let job = await client.query(`SELECT * FROM jobs
                        LEFT JOIN user_services ON service_id = job_listing_id
                        WHERE job_id = $1`, [req.body.job_id]);

                        await client.query(`COMMIT`)
                        .then(() => {
                            resp.send({status: 'success', statusMessage: 'Inquiry closed', job: job.rows[0]});
                        });
                    } else {
                        throw new Error(`You're not authorized`);
                    }
                } catch (e) {
                    await client.query(`ROLLBACK`);
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
    }
});

app.post('/api/job/abandon', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            console.log(req.body);
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);

                    let authorized = await client.query(`SELECT job_user FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (req.session.user.username === authorized.rows[0].job_user) {
                        let job = await client.query(`UPDATE jobs SET job_status = $1, job_abandoned_date = current_timestamp, abandon_reason = $3 WHERE job_id = $2 RETURNING *`, ['Abandoning', req.body.job_id, req.body.reason]);

                        let messageBody = `The other party has decided to abandon this job.
                        
                        REASON: ${req.body.reason}
                        
                        <small>Should you agree to abandon this job, it will not negatively impact the other party's reputation. If you do not decide within 3 weeks, the job will automatically be deemed as abandoned and will negatively impact the other party's reputation.</small>`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (belongs_to_job, message_type) WHERE message_type = $4 DO NOTHING RETURNING *`, [req.body.job_id, messageBody, req.body.recipient, 'Abandonment', true])

                        await client.query(`COMMIT`)
                        .then(() => {
                            resp.send({status: 'success', message: message.rows[0], job: job.rows[0]});
                        });
                    } else {
                        throw new Error(`You're not authorized`);
                    }
                } catch (e) {
                    await client.query(`ROLLBACK`);
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

app.post('/api/job/abandon/:decision', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    let job;

                    await client.query('BEGIN');
                    
                    if (req.params.decision === 'approve') {
                        job = await client.query(`UPDATE jobs SET job_stage = 'Incomplete', job_status = 'Incomplete' WHERE job_id = $1 RETURNING *`, [req.body.job_id]);
                    } else if (req.params.decision === 'decline') {
                        job = await client.query(`UPDATE jobs SET job_stage = 'Abandoned', job_status = 'Abandoned' WHERE job_id = $1 RETURNING *`, [req.body.job_id]);
                    }

                    await client.query(`COMMIT`)
                    .then(() => {
                        resp.send({status: 'success', job: job.rows[0]});
                    });
                } catch (e) {
                    await client.query(`ROLLBACK`);
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

module.exports = app;