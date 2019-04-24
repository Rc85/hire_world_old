const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const cryptoJs = require('crypto-js');
const util = require('util');
const authenticate = require('../utils/auth');

stripe.setApiVersion('2019-02-19');

app.post('/api/job/accounts/fetch', authenticate, async(req, resp) => {

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
});

app.post('/api/jobs/fetch', authenticate, async(req, resp) => {
        let statusParam;

        if (req.body.stage === 'opened') {
            // 'New' are jobs that was sent from a user's profile
            // 'Open' are jobs that have been opened by the user
            // 'Pending' are jobs that have milestone sent to the client
            statusParam = `job_status IN ('New', 'Open', 'Pending')`;
        } else if (req.body.stage === 'active') {
            // 'Active' are jobs that have been started and the first milestone payment transferred
            // 'Requesting Payment' is when the user submitted a request for payment to the client
            statusParam = `job_status IN ('Active', 'Requesting Payment', 'Requesting Close')`;
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
});

app.post('/api/get/job/details', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            if (req.body.stage === 'opened') {
                // 'New' are jobs that was sent from a user's profile
                // 'Open' are jobs that have been opened by the user
                // 'Pending' are jobs that have milestone sent to the client
                statusParam = `job_status IN ('New', 'Open', 'Pending')`;
            } else if (req.body.stage === 'active') {
                // 'Active' are jobs that have been started and the first milestone payment transferred
                // 'Requesting Payment' is when the user submitted a request for payment to the client
                statusParam = `job_status IN ('Active', 'Requesting Payment', 'Requesting Close')`;
            } else if (req.body.stage === 'complete') {
                statusParam = `job_status IN ('Complete')`;
            } else if (req.body.stage === 'abandoned') {
                statusParam = `job_status IN ('Abandoned')`;
            }

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_user, job_client, users.connected_id, job_created_date FROM jobs LEFT JOIN users ON users.username = jobs.job_user WHERE job_id = $1`, [req.body.id]);

                    if (authorized.rows[0].job_user === req.session.user.username) {
                        await client.query(`UPDATE jobs SET job_status = 'Open' WHERE job_id = $1 AND job_status NOT IN ('Requesting Payment', 'Requesting Close', 'Declined', 'Pending', 'Active', 'Complete', 'Abandoned')`, [req.body.id]);
                    }

                    if (authorized.rows[0].job_user === req.session.user.username || authorized.rows[0].job_client === req.session.user.username) {
                        // Join milestones with the associated conditions and associated files
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
            
                        // Get job messages
                        let messages = await client.query(`SELECT job_messages.*, user_profiles.avatar_url FROM job_messages LEFT JOIN users ON users.username = job_messages.job_message_creator LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE job_message_parent_id = $1 ORDER BY job_message_date DESC`, [req.body.id]);
                        
                        // Update all job messages from 'New' to 'Viewed'
                        await client.query(`UPDATE job_messages SET job_message_status = 'Viewed' WHERE job_message_parent_id = $1 AND job_message_creator != $2 AND job_message_status = 'New'`, [req.body.id, req.session.user.username]);
                        
                        let jobDetails = await client.query(`SELECT * FROM jobs WHERE job_id = $1 AND ${statusParam}`, [req.body.id]);
                        
                        let balanceIds = [];
                        let balances = [];
                        
                        // Insert into balanceIds with objects in the form of {id: '1', type: 'balance' || 'payout'}
                        for (let milestone of milestones.rows) {
                            if (milestone.milestone_status === 'Complete' && milestone.payout_id) {
                                balanceIds.push({type: 'payout', id: milestone.payout_id});            
                            } else if ((milestone.milestone_status === 'In Progress' || milestone.milestone_status === 'Requesting Payment') && milestone.balance_txn_id) {
                                balanceIds.push({type: 'balance', id: milestone.balance_txn_id});
                            }
                            
                            // If there are no files for the milestone, the row returns null and it needs to be removed
                            for (let i in milestone.files) {
                                if (milestone.files[i] === null) {
                                    milestone.files.splice(i, 1);
                                }
                            }
                            
                            // Sort files by filename
                            milestone.files.sort((a, b) => {
                                return a.filename > b.filename;
                            });
                        }
                        
                        // Get the balance or payout object from Stripe and push it to balance
                        for (let obj of balanceIds) {
                            let balance;

                            if (obj.type === 'balance') {
                                balance = await stripe.balance.retrieveTransaction(obj.id, {expand: ['source.transfer.destination_payment.balance_transaction']})
                                .catch(err => error.log(err, req, resp));
                            } else if (obj.type === 'payout') {
                                balance = await stripe.payouts.retrieve(obj.id, {stripe_account: authorized.rows[0].connected_id});
                            }

                            balances.push(balance);
                        }

                        /* await stripe.accounts.retrieve('acct_1EPh8eH8F9F7RoKQ')
                        .then(account => 
                        .then(err => error.log(err, req, resp)); */

                        /* await stripe.transfers.create({
                            amount: 357,
                            currency: 'aud',
                            destination: 'acct_1EPuqnLoWtSpj474',
                        })
                        .then(transfer => 
                        .catch(err => error.log(err, req, resp)); */
                        
                        /* await stripe.payouts.create({
                            amount: 255,
                            currency: 'aud'
                        }, {stripe_account: 'acct_1ER9NgJwYtxNRzbE'}) */

                        //

                        // Loop through balance and our milestone query to match the id and balance_txn_id field, and create a new balance key with the balance object
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

                        // Get the review associate with the job only when jobs are complete, otherwise this is .rows[0] is null
                        let review = await client.query(`SELECT user_reviews.*, review_tokens.* FROM user_reviews
                        LEFT JOIN jobs
                        ON jobs.job_client = user_reviews.reviewer
                        AND jobs.job_user = user_reviews.reviewing
                        LEFT JOIN review_tokens
                        ON jobs.job_id = review_tokens.token_job_id
                        WHERE reviewer = $1 AND reviewing = $2 AND token IS NOT NULL AND jobs.job_id = $3`, [authorized.rows[0].job_client, authorized.rows[0].job_user, req.body.id]);

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
});

app.post('/api/jobs/summary', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let jobStats, balanceAvailable, balancePending, totalPayment, payoutReceived, clientAppFee, userAppFee;

                    if (req.body.type === 'all') {
                        jobStats = await client.query(`SELECT (
                            SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_status = 'Complete' AND (job_user = $1 OR job_client = $1)
                        ), (
                            SELECT COUNT(job_id) AS job_abandoned FROM jobs WHERE job_status = 'Abandoned' AND (job_user = $1 OR job_client = $1)
                        ), (
                            SELECT COUNT(job_id) AS total_jobs FROM jobs WHERE (job_user = $1 OR job_client = $1)
                        ), (
                            SELECT COUNT(job_id) AS job_declined FROM jobs WHERE job_status = 'Declined' AND (job_user = $1 OR job_client = $1)
                        ) FROM jobs
                        LIMIT 1`, [req.session.user.username]);

                        balanceAvailable = await client.query(`SELECT SUM(milestone_payment_after_fees) AS balance_available FROM job_milestones
                        LEFT JOIN jobs
                        ON jobs.job_id = job_milestones.milestone_job_id
                        WHERE job_user = $1 AND payout_status = 'available'`, [req.session.user.username]);

                        balancePending = await client.query(`SELECT SUM(milestone_payment_after_fees) AS balance_pending FROM job_milestones
                        LEFT JOIN jobs
                        ON jobs.job_id = job_milestones.milestone_job_id
                        WHERE job_user = $1 AND payout_status = 'pending'`, [req.session.user.username]);
                        
                        payoutReceived = await client.query(`SELECT SUM(payout_amount) AS total_payout FROM job_milestones
                        LEFT JOIN jobs
                        ON jobs.job_id = job_milestones.milestone_job_id
                        WHERE job_user = $1`, [req.session.user.username]);

                        totalPayment = await client.query(`SELECT SUM(milestone_payment_after_fees) AS total_payment, job_price_currency FROM job_milestones
                        LEFT JOIN jobs
                        ON jobs.job_id = job_milestones.milestone_job_id
                        WHERE job_client = $1
                        GROUP BY job_price_currency`, [req.session.user.username]);

                        clientAppFee = await client.query(`SELECT SUM(client_app_fee) AS total_client_fee FROM job_milestones
                        LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                        WHERE job_client = $1`, [req.session.user.username]);

                        userAppFee = await client.query(`SELECT SUM(user_app_fee) as total_user_fee FROM job_milestones
                        LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                        WHERE job_user = $1`, [req.session.user.username]);

                        let jobYears = await client.query(`SELECT DISTINCT DATE_PART('year', job_created_date) AS year FROM jobs WHERE (job_client = $1 OR job_user = $1) ORDER BY year`, [req.session.user.username]);

                        await client.query('COMMIT')
                        .then(() => resp.send({
                            status: 'success',
                            stats: jobStats.rows.length > 0 ? jobStats.rows[0] : {},
                            balance_available: balanceAvailable.rows[0].balance_available,
                            balance_pending: balancePending.rows[0].balance_pending,
                            total_payment: totalPayment.rows.length > 0 ? totalPayment.rows[0] : {}, 
                            payout_received: payoutReceived.rows[0].total_payout, 
                            client_app_fee: clientAppFee.rows[0].total_client_fee, 
                            user_app_fee: userAppFee.rows[0].total_user_fee, 
                            job_years: jobYears.rows
                        }));
                    } else if (req.body.type === 'jobs') {
                        let year = new Date(req.body.year);
                        let thisYear = year.getUTCFullYear();
                        let beginning = new Date(thisYear, 0, 1);
                        let end = new Date(thisYear, 11, 31);
                        let jobs = await client.query(`SELECT
                        jobs.*, 
                            CASE WHEN user_fee.total_user_fee IS NULL THEN 0 ELSE user_fee.total_user_fee END, 
                            CASE WHEN client_fee.total_client_fee IS NULL THEN 0 ELSE client_fee.total_client_fee END, 
                            CASE WHEN total_payment.total_payment IS NULL THEN 0 ELSE total_payment.total_payment END,
                        ms.milestone_count,
                        r.review_job_id
                        FROM jobs
                        LEFT JOIN (
                            SELECT milestone_job_id, SUM(user_app_fee) AS total_user_fee FROM job_milestones
                            LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                            WHERE job_user = $1
                            GROUP BY milestone_job_id
                        ) AS user_fee ON jobs.job_id = user_fee.milestone_job_id
                        LEFT JOIN (
                            SELECT milestone_job_id, SUM(client_app_fee) AS total_client_fee FROM job_milestones
                            LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                            WHERE job_client = $1
                            GROUP BY milestone_job_id
                        ) AS client_fee ON jobs.job_id = client_fee.milestone_job_id
                        LEFT JOIN (
                            SELECT milestone_job_id, SUM(milestone_payment_after_fees) AS total_payment FROM job_milestones
                            LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                            WHERE (job_client = $1 OR job_user = $1)
                            GROUP BY milestone_job_id
                        ) AS total_payment ON jobs.job_id = total_payment.milestone_job_id
                        LEFT JOIN (
                            SELECT milestone_job_id, COUNT(milestone_id) AS milestone_count FROM job_milestones
                            LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                            WHERE (job_client = $1 OR job_user = $1)
                            GROUP BY milestone_job_id
                        ) AS ms ON ms.milestone_job_id = jobs.job_id
                        LEFT JOIN (
                            SELECT review_job_id FROM user_reviews
                            WHERE reviewing = $1 OR reviewer = $1
                        ) AS r ON r.review_job_id = jobs.job_id
                        WHERE (job_client = $1 OR job_user = $1)
                        AND job_created_date >= $2 AND job_created_date <= $3
                        AND job_status = 'Complete'`, [req.session.user.username, beginning, end]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', jobs: jobs.rows}));
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

module.exports = app;