const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const cryptoJs = require('crypto-js');

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

app.post('/api/jobs/fetch', async(req, resp) => {
    if (req.session.user) {
        let statusParam;

        if (req.body.stage === 'opened') {
            statusParam = `job_status IN ('New', 'Open', 'Pending', 'Confirmed')`;
        } else if (req.body.stage === 'active') {
            statusParam = `job_status IN ('Active', 'Requesting Payment')`;
        } else if (req.body.stage === 'complete') {
            statusParam = `job_status IN ('Complete')`;
        } else if (req.body.stage === 'abandoned') {
            statusParam = `job_status IN ('Abandoned')`;
        }

        await db.query(`SELECT * FROM jobs
        LEFT JOIN (
            SELECT COUNT(job_message_id) AS new_message, job_message_parent_id FROM job_messages
            WHERE job_message_creator != $1 AND job_message_status = 'New'
            GROUP BY job_message_parent_id
        ) AS unread
        ON jobs.job_id = unread.job_message_parent_id
        LEFT JOIN review_tokens
        ON review_tokens.token_job_id = jobs.job_id
        WHERE (job_user = $1 OR job_client = $1) AND ${statusParam}
        ORDER BY job_created_date DESC NULLS LAST`, [req.session.user.username])
        .then(result => {
            if (result) {
                resp.send({status: 'success', jobs: result.rows});
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

app.post('/api/get/job/details', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            if (req.body.stage === 'opened') {
                statusParam = `job_status IN ('New', 'Open', 'Pending', 'Confirmed')`;
            } else if (req.body.stage === 'active') {
                statusParam = `job_status IN ('Active', 'Requesting Payment')`;
            } else if (req.body.stage === 'complete') {
                statusParam = `job_status IN ('Complete')`;
            } else if (req.body.stage === 'abandoned') {
                statusParam = `job_status IN ('Abandoned')`;
            }

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_user, job_client, job_accept_key_expire_date, users.connected_id, job_created_date FROM jobs LEFT JOIN users ON users.username = jobs.job_user WHERE job_id = $1`, [req.body.id]);

                    if (authorized.rows[0].job_user === req.session.user.username) {
                        await client.query(`UPDATE jobs SET job_status = 'Open' WHERE job_id = $1 AND job_status NOT IN ('Requesting Payment', 'Confirmed', 'Declined', 'Pending', 'Active', 'Complete', 'Abandoned')`, [req.body.id]);
                    }

                    if (authorized.rows[0].job_user === req.session.user.username || authorized.rows[0].job_client === req.session.user.username) {
                        let milestones = await client.query(`WITH 
                            milestones AS (
                                SELECT jm.*, JSON_AGG(mc.*)
                                FROM job_milestones AS jm
                                LEFT JOIN milestone_conditions AS mc
                                ON jm.milestone_id = mc.condition_parent_id
                                GROUP BY jm.milestone_id
                            ),
                            files AS (
                                SELECT jm.*, JSON_AGG(f.*)
                                FROM job_milestones AS jm
                                LEFT JOIN milestone_files AS f
                                ON jm.milestone_id = f.file_milestone_id
                                GROUP BY jm.milestone_id
                            )
                        SELECT jms.*, JSON_AGG(ms.*) AS conditions, JSON_AGG(ft.*) AS files
                        FROM job_milestones AS jms
                        LEFT JOIN milestones AS ms
                        ON jms.milestone_id = ms.milestone_id
                        LEFT JOIN files AS ft
                        ON jms.milestone_id = ft.milestone_id
                        WHERE jms.milestone_job_id = $1
                        ORDER BY jms.milestone_id`, [req.body.id]);
            
                        let messages = await client.query(`SELECT job_messages.*, user_profiles.avatar_url FROM job_messages LEFT JOIN users ON users.username = job_messages.job_message_creator LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE job_message_parent_id = $1 ORDER BY job_message_date DESC`, [req.body.id]);
                        
                        await client.query(`UPDATE job_messages SET job_message_status = 'Viewed' WHERE job_message_parent_id = $1 AND job_message_creator != $2 AND job_message_status = 'New'`, [req.body.id, req.session.user.username]);
                        
                        let jobDetails = await client.query(`SELECT * FROM jobs WHERE job_id = $1 AND ${statusParam}`, [req.body.id]);
                        
                        let balanceIds = [];
                        let balances = [];
                        
                        for (let milestone of milestones.rows) {
                            if (milestone.milestone_status === 'Complete' && milestone.payout_id) {
                                balanceIds.push({type: 'payout', id: milestone.payout_id});
                            } else if ((milestone.milestone_status === 'In Progress' || milestone.milestone_status === 'Requesting Payment') && milestone.balance_txn_id) {
                                balanceIds.push({type: 'balance', id: milestone.balance_txn_id});
                            }
                            
                            for (let i in milestone.files) {
                                if (milestone.files[i] === null) {
                                    milestone.files.splice(i, 1);
                                }
                            }

                            milestone.files.sort((a, b) => {
                                return a.filename > b.filename;
                            });
                        }
                        
                        for (let obj of balanceIds) {
                            let balance;

                            if (obj.type === 'balance') {
                                balance = await stripe.balance.retrieveTransaction(obj.id, {expand: ['source.transfer.destination_payment.balance_transaction']})
                                .catch(err => console.log(err));
                            } else if (obj.type === 'payout') {
                                balance = await stripe.payouts.retrieve(obj.id, {stripe_account: authorized.rows[0].connected_id});
                            }

                            balances.push(balance);
                        }

                        for (let milestone of milestones.rows) {
                            for (let balance of balances) {
                                if (milestone.balance_txn_id === balance.id) {
                                    milestone['balance'] = balance.source.transfer.destination_payment.balance_transaction;
                                } else if (milestone.payout_id === balance.id) {
                                    balance['net'] = balance.amount;
                                    milestone['balance'] = balance;
                                }
                            }
                        }

                        let review = await client.query(`SELECT user_reviews.*, review_tokens.* FROM user_reviews
                        LEFT JOIN jobs
                        ON jobs.job_client = user_reviews.reviewer
                        AND jobs.job_user = user_reviews.reviewing
                        LEFT JOIN review_tokens
                        ON jobs.job_id = review_tokens.token_job_id
                        WHERE reviewer = $1 AND reviewing = $2 AND jobs.job_id = $3`, [authorized.rows[0].job_client, authorized.rows[0].job_user, req.body.id]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', job: jobDetails.rows[0], messages: messages.rows, milestones: milestones.rows, review: review ? review.rows[0] : null}));
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