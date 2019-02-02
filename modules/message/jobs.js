const app = require('express').Router();
const db = require('../db');
const cryptojs = require('crypto-js');
const error = require('../utils/error-handler');

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
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                    if (authorized.rows[0].job_user === req.session.user.username && !authorized.rows[0].job_user_complete) {
                        if (user && user.rows[0].user_status === 'Active') {
                            let job = await client.query(`UPDATE jobs SET job_user_complete = $1, job_client_complete = $2 WHERE job_id = $3 RETURNING *`, [true, null, req.body.job_id]);

                            let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, message_recipient, is_reply, message_sender, message_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [req.body.job_id, `An approval to complete this job has been sent.`, 'Update', req.session.user.username, true, 'System', 'Read']);
                            
                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_type, message_recipient, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (belongs_to_job, message_body, message_type) WHERE message_type = 'Confirmation' AND message_body = 'The other party has requested approval to complete this job.' DO UPDATE SET message_modified_date = current_timestamp`, [req.body.job_id, `The other party is requesting approval to complete this job.`, 'Confirmation', authorized.rows[0].job_client, true, 'System']);

                            await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, `You received a request to complete job ID ${req.body.job_id}`, 'Update']);
                            
                            await client.query('COMMIT')
                            .then(() => {
                                resp.send({status: 'success', statusMessage: 'Request sent', message: message.rows[0], job: job.rows[0]});
                            });
                        } else if (user && user.rows[0].user_status === 'Suspend') {
                            let error = new Error(`You're temporarily banned`);
                            error.type = 'CUSTOM';
                            throw error;
                        }
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

                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
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

            if (req.params.decision === 'approve') {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);
                        let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (req.session.user.username === authorized.rows[0].job_client) {
                            if (user && user.rows[0].user_status === 'Active') {
                                await client.query(`UPDATE jobs SET job_client_complete = $1, job_stage = 'Completed', job_status = 'Completed', job_modified_date = current_timestamp WHERE job_id = $2`, [true, req.body.job_id]);

                                //let encryptUserToken = cryptojs.AES.encrypt(authorized.rows[0].job_user, 'authorize authentic review');
                                let encryptClientToken = cryptojs.AES.encrypt(req.session.user.username, 'authorize authentic review');
                                //let userToken = encodeURIComponent(encryptUserToken.toString());
                                let clientToken = encodeURIComponent(encryptClientToken.toString());

                                /* await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review_token, review_job_id) VALUES ($1, $2, $3, $4)`, [authorized.rows[0].job_user, authorized.rows[0].job_client, userToken, req.body.job_id]); */
                                // Removed token for user to review client as only client should review users
                                await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review_token, review_job_id) VALUES ($1, $2, $3, $4)`, [req.session.user.username, authorized.rows[0].job_user, clientToken, req.body.job_id]);

                                await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `Congratulations! You have successfully completed this job. If you enjoyed working with the other party, be sure to give them a like.`, authorized.rows[0].job_user, 'Update', true, 'System']);

                                await client.query(`UPDATE messages SET message_body = 'Congratulations! You completed this job. If you enjoy working with the other party, be sure to submit a verified review to help build their business.', message_type = 'Update' WHERE message_body = 'The other party is requesting approval to complete this job.' AND belongs_to_job = $1 AND message_sender = 'System' AND message_recipient = $2`, [req.body.job_id, authorized.rows[0].job_client]);

                                await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['You completed a job!', req.session.user.username, 'Job']);
                                await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['You completed a job!', authorized.rows[0].job_user, 'Job']);

                                await client.query('COMMIT')
                                .then(() => {
                                    resp.send({status: 'job complete'});
                                });
                            } else if (user && user.rows[0].user_status === 'Suspend') {
                                let error = new Error(`You're temporarily banned`);
                                error.type = 'CUSTOM';
                                throw error;
                            }
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
                    
                    let message = 'An error occurred';

                    if (err.type === 'CUSTOM') {
                        message = err.message;
                    }

                    resp.send({status: 'error', statusMessage: message});
                });
            } else if (req.params.decision === 'decline') {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let authorized = await client.query(`SELECT job_client, job_user FROM jobs WHERE job_id = $1`, [req.body.job_id]);
                        let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                        if (req.session.user.username === authorized.rows[0].job_client) {
                            if (user && user.rows[0].user_status === 'Active') {
                                let job = await client.query(`UPDATE jobs SET job_user_complete = $1, job_client_complete = $1 WHERE job_id = $2 RETURNING *`, [false, req.body.job_id]);

                                let messageBody = `Your request for completion has been declined.
                                
                                REASON: ${req.body.message}`;
                                
                                await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, messageBody, authorized.rows[0].job_user, 'Warning', true, 'System']);

                                await client.query('COMMIT')
                                .then(() => {
                                    resp.send({status: 'success', job: job.rows[0]});
                                });
                            } else if (user && user.rows[0].user_status === 'Suspend') {
                                let error = new Error(`You're temporarily banned`);
                                error.type = 'CUSTOM';
                                throw error;
                            }  
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
                    
                    let message = 'An error occurred';

                    if (err.type === 'CUSTOM') {
                        message = err.message;
                    }

                    resp.send({status: 'error', statusMessage: message});
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
                        await client.query(`UPDATE jobs SET job_stage = 'Closed', job_status = 'Closed', job_modified_date = current_timestamp WHERE job_id = $1`, [req.body.job_id])
                        await client.query(`UPDATE messages SET message_status = '' WHERE belongs_to_job = $1`, [req.body.job_id]);

                        let job = await client.query(`SELECT * FROM jobs LEFT JOIN user_listings ON listing_id = job_listing_id WHERE job_id = $1`, [req.body.job_id]);

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
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);

                    let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (req.session.user.username === authorized.rows[0].job_user) {
                        let job = await client.query(`UPDATE jobs SET job_status = $1, abandon_reason = $3 WHERE job_id = $2 RETURNING *`, ['Abandoning', req.body.job_id, req.body.reason]);

                        let messageBody = `The other party has decided to abandon this job.
                        
                        Reason: ${req.body.reason}
                        
                        Should you agree to abandon this job, it will not impact the other party's reputation. If you do not decide within 3 weeks, the system will automatically approve this request.`;

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender, message_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [req.body.job_id, `A request to abandon this job has been sent.`, req.session.user.username, 'Update', true, 'System', 'Read']);
                        
                        await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (belongs_to_job, message_type) WHERE message_type = $4 DO UPDATE SET message_body = $2, message_modified_date = current_timestamp`, [req.body.job_id, messageBody, authorized.rows[0].job_client, 'Abandonment', true, 'System']);

                        await client.query(`COMMIT`)
                        .then(() => {
                            resp.send({status: 'success', statusMessage: 'Abandon request sent', message: message.rows[0], job: job.rows[0]});
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

app.post('/api/job/cancel-abandon', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_client, job_user FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (authorized && authorized.rows[0].job_user === req.session.user.username) {
                        await client.query(`UPDATE messages SET message_body = $1, message_type = $2 WHERE message_type = $3 AND belongs_to_job = $4 AND message_recipient = $5`, [`The other party cancelled the abandon request.`, 'Update', 'Abandonment', req.body.job_id, req.body.recipient]);

                        let message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender, message_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [req.body.job_id, `Your request to abandon this job has been cancelled.`, req.session.user.username, 'Update', true, 'System', 'Read']);

                        let job = await client.query(`UPDATE jobs SET job_status = $1, abandon_reason = $2 WHERE job_id = $3 RETURNING *`, ['Viewed', null, req.body.job_id]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'Abandon request cancelled', message: message.rows[0], job: job.rows[0]}));
                    } else {
                        let error = new Error(`You're not authorized`);
                        error.type = 'user_defined';
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
                
                let message = 'An error occurred';

                if (err.type === 'user_defined') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
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
                            job = await client.query(`UPDATE jobs SET job_stage = 'Incomplete', job_status = 'Incomplete', job_modified_date = current_timestamp WHERE job_id = $1 RETURNING *`, [req.body.job_id]);
                            
                            message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.body.job_id, `You agreed to abandon this job. This job is now considered as "Incomplete".`, req.session.user.username, 'Update', true, 'System']);
                            
                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `The other party has agreed to abandon this job. This job is now considered as "Incomplete".`, authorized.rows[0].job_user, 'Update', true, 'System']);

                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Your request to abandon a job has been approved', authorized.rows[0].job_user, 'Job']);
                        } else if (req.params.decision === 'decline') {
                            job = await client.query(`UPDATE jobs SET job_stage = 'Abandoned', job_status = 'Abandoned', job_user_complete = false, job_client_complete = false, job_modified_date = current_timestamp WHERE job_id = $1 RETURNING *`, [req.body.job_id]);

                            message = await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `You declined to abandon this job. This job is now considered as "Abandoned".`, req.session.user.username, 'Update', true, 'System']);

                            await client.query(`INSERT INTO messages (belongs_to_job, message_body, message_recipient, message_type, is_reply, message_sender) VALUES ($1, $2, $3, $4, $5, $6)`, [req.body.job_id, `The other party has declined to abandon this job. This job is now considered as "Abandoned".`, authorized.rows[0].job_user, 'Warning', true, 'System']);

                            await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Your request to abandon a job has been declined', authorized.rows[0].job_user, 'Job']);
                        }

                        await client.query(`DELETE FROM messages WHERE message_type = 'Abandonment' AND belongs_to_job = $1`, [req.body.job_id]);

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
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let exist = await db.query(`SELECT * FROM pinned_jobs WHERE pinned_job = $1 AND pinned_by = $2`, [req.body.id, req.session.user.username]);
                    let queryString, action, date;

                    if (exist && exist.rows.length === 1) {
                        await client.query(`DELETE FROM pinned_jobs WHERE pinned_job = $1 AND pinned_by = $2`, [req.body.id, req.session.user.username]);
                        date = null;
                        action = 'delete';
                    } else if (exist && exist.rows.length === 0) {
                        date = await client.query(`INSERT INTO pinned_jobs (pinned_job, pinned_by) VALUES ($1, $2) RETURNING pinned_date`, [req.body.id, req.session.user.username])
                        .then(result => {
                            return result.rows[0].pinned_date;
                        });

                        action = 'pin';
                    }

                    await client.query('COMMIt')
                    .then(() => resp.send({status: 'success', pinnedDate: date, action: action}));
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
    }
});

app.post('/api/jobs/appeal-abandon', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');
                    await client.query(`INSERT INTO appeal_abandoned_jobs (appeal_abandoned_job_id, additional_info) VALUES ($1, $2)`, [req.body.job_id, req.body.additional_info]);
                    await client.query(`UPDATE jobs SET job_stage = 'Appealing', job_status = 'Appealing' WHERE job_id = $1`, [req.body.job_id]);
                    await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['You requested to appeal an abandoned job', req.session.user.username, 'Job']);
                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', statusMessage: 'Appeal sent'}));
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .then(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;