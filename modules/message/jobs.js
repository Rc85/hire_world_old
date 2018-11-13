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

                        await client.query(`DELETE FROM pinned_jobs WHERE pinned_job = ANY($1) AND pinned_by = $2`, [req.body.ids, req.session.user.username]);

                        let messageQueryType = `(job_client = $3 OR job_user = $3)`;
                        let pinnedMessageQuery;

                        let deleted =  await client.query(`SELECT deleted_job FROM deleted_jobs WHERE deleted_by = $1`, [req.session.user.username])
                        let deletedArray = [];

                        let params = [req.body.stage, deletedArray, req.session.user.username];

                        let pinned = await client.query(`SELECT pinned_job FROM pinned_jobs WHERE pinned_by = $1`, [req.session.user.username]);
                        let pinnedArray = [];

                        for (let row of deleted.rows) {
                            deletedArray.push(row.deleted_job);
                        }

                        for (let row of pinned.rows) {
                            pinnedArray.push(row.pinned_job);
                        }

                        if (req.body.type === 'received') {
                            messageQueryType = `job_user = $3`;
                        } else if (req.body.type === 'sent') {
                            messageQueryType = `job_client = $3`;
                        } else if (req.body.type === 'pinned') {
                            params.push(pinnedArray);
                            pinnedMessageQuery = `AND jobs.job_id = ANY($4)`
                        }

                        let jobs = await client.query(`SELECT * FROM jobs
                        WHERE job_stage = $1
                        AND NOT job_id = ANY($2)
                        AND ${messageQueryType}
                        ${pinnedMessageQuery ? pinnedMessageQuery : ''}
                        ORDER BY job_created_date DESC`, params);

                        console.log(jobs.rows);

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

                    let authorized = await client.query(`SELECT job_user, job_client, job_user_complete, job_client_complete FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (authorized.rows[0].job_user === req.session.user.username && !authorized.rows[0].job_user_complete) { 
                        let job = await client.query(`UPDATE jobs SET job_user_complete = $1, job_client_complete = $2 WHERE job_id = $3 RETURNING *`, [true, null, req.body.job_id]);

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, message_recipient, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.body.job_id, `An approval to complete this job has been sent.`, 'Update', req.session.user.username, true, 'System']);
                        
                        await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, message_recipient, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (belongs_to_job, message_body, message_type) WHERE message_type = 'Confirmation' AND message_body = 'The other party has requested approval to complete this job.' DO UPDATE SET message_modified_date = current_timestamp`, [req.body.job_id, `The other party has requested approval to complete this job.`, 'Confirmation', authorized.rows[0].job_client, true, 'System']);
                        
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

                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `Congratulations! You have successfully completed this job. Please take the time to review the other party.`, authorized.rows[0].job_user, 'Update', true, 'System']);

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

                        let authorized = await client.query(`SELECT job_client, job_user FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                        if (req.session.user.username === authorized.rows[0].job_client) {
                            let job = await client.query(`UPDATE jobs SET job_user_complete = $1, job_client_complete = $1 WHERE job_id = $2 RETURNING *`, [false, req.body.job_id]);

                            let messageBody = `Your request for completion has been declined.
                            
                            REASON: ${req.body.message}`;
                            
                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, messageBody, authorized.rows[0].job_user, 'Warning', true, 'System']);

                            await client.query('COMMIT')
                            .then(() => {
                                resp.send({status: 'success', job: job.rows[0]});
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
                        LEFT JOIN user_listings ON listing_id = job_listing_id
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

                    let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (req.session.user.username === authorized.rows[0].job_user) {
                        let job = await client.query(`UPDATE jobs SET job_status = $1, job_abandoned_date = current_timestamp, abandon_reason = $3 WHERE job_id = $2 RETURNING *`, ['Abandoning', req.body.job_id, req.body.reason]);

                        let messageBody = `The other party has decided to abandon this job.
                        
                        REASON: ${req.body.reason}
                        
                        <small>Should you agree to abandon this job, it will not negatively impact the other party's reputation. If you do not decide within 3 weeks, the job will automatically be deemed as abandoned and will negatively impact the other party's reputation.</small>`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.body.job_id, `A request to abandon this job has been sent.`, req.session.user.username, 'Abandonment', true, 'System']);
                        
                        await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (belongs_to_job, message_type) WHERE message_type = $4 DO NOTHING`, [req.body.job_id, messageBody, authorized.rows[0].job_client, 'Abandonment', true, 'System']);

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
                    let job, message;

                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_client, job_user FROM jobs WHERE job_id = $1`, [req.body.job_id]);
                    
                    if (authorized && authorized.rows[0].job_client === req.session.user.username) {
                        if (req.params.decision === 'approve') {
                            job = await client.query(`UPDATE jobs SET job_stage = 'Incomplete', job_status = 'Incomplete' WHERE job_id = $1 RETURNING *`, [req.body.job_id]);

                            message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `You declined the request to abandon this job. This job is now considered as "Abandoned".`, req.session.user.username, 'Update', true, 'System']);

                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `The other party declined your request to abandon this job. This job is now considered as "Abandoned".`, authorized.rows[0].job_user, 'Warning', true, 'System']);
                        } else if (req.params.decision === 'decline') {
                            job = await client.query(`UPDATE jobs SET job_stage = 'Abandon', job_status = 'Abandon' WHERE job_id = $1 RETURNING *`, [req.body.job_id]);

                            message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.body.job_id, `You approved the request to abandon this job. This job is now considered as "Incomplete".`, req.session.user.username, 'Update', true, 'System']);

                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `The other party approved your request to abandon this job. This job is now considered as "Incomplete".`, authorized.rows[0].job_user, 'Update', true, 'System']);
                        }

                        await client.query(`COMMIT`)
                        .then(() => {
                            resp.send({status: 'success', job: job.rows[0], message: message.rows[0]});
                        });
                    } else {
                        let error = new Error(`You're not authorized`);
                        error.type = 'user_defined';
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
                let message = 'An error occurred';
                
                if (err.type === 'user_defined') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/pin', async(req, resp) => {
    if (req.session.user) {
        let exist = await db.query(`SELECT * FROM pinned_jobs WHERE pinned_job = $1 AND pinned_by = $2`, [req.body.id, req.session.user.username]);
        let queryString, action;

        if (exist && exist.rows.length === 1) {
            queryString = `DELETE FROM pinned_jobs WHERE pinned_job = $1 AND pinned_by = $2`;
            action = 'delete';
        } else if (exist && exist.rows.length === 0) {
            queryString = `INSERT INTO pinned_jobs (pinned_job, pinned_by) VALUES ($1, $2)`;
            action = 'pin';
        }

        await db.query(queryString, [req.body.id, req.session.user.username])
        .then(result => {
            if (result && result.rowCount === 1) {
                resp.send({status: 'success', action: action});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    }
});

module.exports = app;