const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/get/jobs', async(req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');
                    let jobs = [];
                    let jobCount = 0;
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);
                    
                    if (user && user.rows[0].user_status === 'Active') {
                        let jobsResults = await client.query(`SELECT jobs.*, unread.unread_messages, user_reviews.*, pinned.pinned_date,
                            (SELECT COUNT(job_id) AS job_count FROM jobs WHERE job_stage = $1)
                        FROM jobs
                        LEFT JOIN
                            (SELECT COUNT(message_id) AS unread_messages, belongs_to_job FROM messages
                            WHERE message_status = 'New'
                            GROUP BY belongs_to_job) AS unread ON jobs.job_id = unread.belongs_to_job
                        LEFT JOIN
                            (SELECT * FROM user_reviews WHERE reviewer = $2) AS user_reviews ON user_reviews.review_job_id = jobs.job_id
                        LEFT JOIN
                            (SELECT pinned_date, pinned_job FROM pinned_jobs WHERE pinned_by = $2) AS pinned ON pinned.pinned_job = jobs.job_id
                        WHERE job_stage = $1 AND (job_client = $2 OR job_user = $2)
                        ORDER BY pinned.pinned_date, jobs.job_created_date DESC
                        LIMIT 25 OFFSET $3`, [req.body.stage, req.session.user.username, req.body.offset]);

                        jobs = jobResults.rows;

                        if (jobsResult.rows.length > 0) {
                            jobCount = jobsResults.rows[0].job_count;
                        }
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', jobs: jobs, jobCount: jobCount}));
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log(err, {name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/get/offer', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_client, job_user FROM jobs WHERE (job_client = $1 OR job_user = $1) AND job_id = $2`, [req.session.user.username, req.body.job_id]);

                    if (authorized !== undefined && authorized.rows.length === 1) {
                        let job = await client.query(`SELECT * FROM jobs
                        LEFT JOIN user_listings ON listing_id = job_listing_id
                        WHERE job_id = $1 ${req.body.stage === 'Abandoned' ? `AND job_stage IN ($2, 'Incomplete')` : 'AND job_stage = $2'}
                        AND job_status != 'Closed'`, [req.body.job_id, req.body.stage]);

                        let offer = await client.query(`SELECT * FROM offers WHERE offer_for_job = $1 AND offer_status NOT IN ('Deleted', 'Declined')`, [req.body.job_id])

                        if (job && job.rows.length === 1) {
                            await client.query(`COMMIT`)
                            .then(() => {
                                resp.send({status: 'success', job: job.rows[0], offer: offer.rows[0]});
                            });
                        } else {
                            throw new Error(`The job does not exist`);
                        }
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
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                resp.send({status: 'access error', statusMessage: 'An error occurred'});
            });
        });
    }
});

module.exports = app;