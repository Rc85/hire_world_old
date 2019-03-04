const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

stripe.setApiVersion('2019-02-19');

app.post('/api/job/accounts/fetch', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query('SELECT connected_id, connected_acct_status FROM users WHERE username = $1', [req.session.user.username]);

        if (user && user.rows[0].connected_id) {
            await stripe.accounts.retrieve(user.rows[0].connected_id)
            .then(account => {
                resp.send({status: 'success', account: account, user: user.rows[0]});
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'success', account: {}, user: {}});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/jobs/fetch/:stage', async(req, resp) => {
    if (req.session.user) {
        let statusParam;

        if (req.params.stage === 'opened') {
            statusParam = `job_status IN ('New', 'Viewed', 'Estimated')`;
        } else if (req.params.stage === 'active') {
            statusParam = `job_status = 'Active'`;
        } else if (req.params.stage === 'completed') {
            statusParam = `job_status = 'Completed'`;
        } else if (req.paramsstage === 'abandoned') {
            statusParam = `job_status = 'Abandoned'`;
        }

        let jobMessageCount = await db.query(`SELECT COUNT(job_message_id) AS job_message_count FROM job_messages LEFT JOIN jobs ON jobs.job_id = job_messages.job_message_parent_id WHERE ${statusParam} AND job_message_status = 'New'`);

        await db.query(`SELECT * FROM jobs WHERE (job_user = $1 OR job_client = $1) AND ${statusParam}`, [req.session.user.username])
        .then(result => {
            if (result) {
                resp.send({status: 'success', jobs: result.rows, messageCount: jobMessageCount.rows[0].job_message_count});
            } else {
                resp.send({status: 'error', statusMessage: 'Fail to retrieve jobs'});
            }
        })
        .catch(err => {
            error.log(err, req, resp);
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/details', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.id]);

                    if (authorized.rows[0].job_user === req.session.user.username || authorized.rows[0].job_client === req.session.user.username) {
                        let jobDetails = await client.query(`SELECT * FROM jobs WHERE job_id = $1`, [req.body.id]);
                        let milestones = await client.query(`SELECT * FROM job_milestones LEFT JOIN milestone_conditions ON job_milestones.milestone_id = milestone_conditions.condition_parent_id WHERE milestone_job_id = $1`, [req.body.id]);
                        let messages = await client.query(`SELECT job_messages.*, user_profiles.avatar_url FROM job_messages LEFT JOIN users ON users.username = job_messages.job_message_creator LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE job_message_parent_id = $1 ORDER BY job_message_date DESC`, [req.body.id]);

                        await client.query(`UPDATE job_messages SET job_message_status = 'Read' WHERE job_message_parent_id = $1 AND job_message_creator != $2`, [req.body.id, req.session.user.username]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', job: jobDetails.rows[0], messages: messages.rows}));
                    } else {
                        let error = new Error(`You're not authorized`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log(err, req, resp);
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;