const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const cryptoJs = require('crypto-js');
const util = require('util');
const authenticate = require('../utils/auth');

stripe.setApiVersion('2019-02-19');

app.post('/api/job/accounts/fetch', authenticate, async(req, resp) => {
    let user = await db.query('SELECT link_work_id, link_work_acct_status FROM users WHERE username = $1', [req.session.user.username]);

    if (user && user.rows[0].link_work_id) {
        await stripe.accounts.retrieve(user.rows[0].link_work_id)
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
        // 'New' is the same open except it shows a 'New' tag
            // 'Open' are jobs that have been opened by the user
            // 'Pending' are jobs that have milestone details sent to the client
        statusParam = `job_status IN ('New', 'Open', 'Pending', 'Declined')`;
    } else if (req.body.stage === 'active') {
        // 'Active' are jobs that have been started and the first milestone payment transferred
        // 'Requesting Payment' is when the user submitted a request for payment to the client
        statusParam = `job_status IN ('Active', 'Requesting Payment', 'Requesting Close')`;
    } else if (req.body.stage === 'complete') {
        statusParam = `job_status IN ('Complete')`;
    } else if (req.body.stage === 'abandoned') {
        statusParam = `job_status IN ('Abandoned')`;
    }

    let jobs = await db.query(`SELECT COUNT(job_id) AS total_jobs FROM jobs
    WHERE (job_user = $1 OR job_client = $1)
    AND ${statusParam}`, [req.session.user.username])
    .catch(err => {
        return error.log(err, req, resp);
    });;

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
    ORDER BY job_created_date DESC NULLS LAST
    LIMIT 25
    OFFSET $2`, [req.session.user.username, req.body.offset])
    .then(result => {
        if (result) {
            resp.send({status: 'success', jobs: result.rows, totalJobs: jobs.rows[0].total_jobs});
        } else {
            resp.send({status: 'error', statusMessage: 'Fail to retrieve jobs'});
        }
    })
    .catch(err => {
        return error.log(err, req, resp);
    });
});

app.post('/api/get/job/details', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        let statusParam;

        if (req.body.stage === 'opened') {
            // 'New' is the same open except it shows a 'New' tag
            // 'Open' are jobs that have been opened by the user
            // 'Pending' are jobs that have milestone details sent to the client
            statusParam = `job_status IN ('New', 'Open', 'Pending', 'Declined')`;
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

                let authorized = await client.query(`SELECT job_user, job_client, users.link_work_id, job_created_date FROM jobs LEFT JOIN users ON users.username = jobs.job_user WHERE job_id = $1`, [req.body.id]);

                if (authorized.rows.length > 0) {
                    if (authorized.rows[0].job_user === req.session.user.username) {
                        await client.query(`UPDATE jobs SET job_status = 'Open' WHERE job_id = $1 AND job_status NOT IN ('Requesting Payment', 'Requesting Close', 'Declined', 'Pending', 'Active', 'Complete', 'Abandoned')`, [req.body.id]);
                    }

                    if (authorized.rows[0].job_user === req.session.user.username || authorized.rows[0].job_client === req.session.user.username) {
                        // Join milestones with the associated conditions and associated files
                        let milestones = await client.query(`WITH 
                            milestones AS (
                                SELECT jm.*, JSON_AGG(mc.* ORDER BY mc.condition_id)
                                FROM job_milestones AS jm
                                LEFT JOIN milestone_conditions AS mc
                                ON jm.milestone_id = mc.condition_parent_id
                                GROUP BY jm.milestone_id
                            ),
                            files AS (
                                SELECT jm.*, JSON_AGG(f.* ORDER BY f.file_id)
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
                            /* if (milestone.milestone_status === 'Complete' && milestone.payout_id) {
                                balanceIds.push({type: 'payout', id: milestone.payout_id});            
                            } else  */if ((milestone.milestone_status === 'In Progress' || milestone.milestone_status === 'Requesting Payment') && milestone.balance_txn_id) {
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
                                balance = await stripe.payouts.retrieve(obj.id, {stripe_account: authorized.rows[0].link_work_id});
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
                } else {
                    let error = new Error(`Job does not exist`);
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

                balanceAvailable = await client.query(`SELECT SUM(milestone_payment_after_fees) AS balance_available
                FROM job_milestones
                LEFT JOIN jobs
                ON jobs.job_id = job_milestones.milestone_job_id
                WHERE job_user = $1 AND payout_status = 'available'`, [req.session.user.username]);

                balancePending = await client.query(`SELECT SUM(milestone_payment_after_fees) AS balance_pending
                FROM job_milestones
                LEFT JOIN jobs
                ON jobs.job_id = job_milestones.milestone_job_id
                WHERE job_user = $1 AND payout_status = 'pending'`, [req.session.user.username]);
                
                /* payoutReceived = await client.query(`SELECT SUM(payout_amount) AS total_payout
                FROM job_milestones
                LEFT JOIN jobs
                ON jobs.job_id = job_milestones.milestone_job_id
                WHERE job_user = $1`, [req.session.user.username]); */

                /* totalPayment = await client.query(`SELECT SUM(requested_payment_amount) + SUM(user_app_fee) AS total_payment, job_price_currency FROM job_milestones
                LEFT JOIN jobs
                ON jobs.job_id = job_milestones.milestone_job_id
                WHERE job_client = $1
                GROUP BY job_price_currency`, [req.session.user.username]);

                clientAppFee = await client.query(`SELECT SUM(client_app_fee) AS total_client_fee FROM job_milestones
                LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                WHERE job_client = $1`, [req.session.user.username]);

                userAppFee = await client.query(`SELECT SUM(user_app_fee) AS total_user_fee FROM job_milestones
                LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                WHERE job_user = $1`, [req.session.user.username]); */

                let jobYears = await client.query(`SELECT DISTINCT DATE_PART('year', job_created_date) AS year FROM jobs WHERE (job_client = $1 OR job_user = $1) ORDER BY year`, [req.session.user.username]);
                
                let finance = await client.query(`SELECT
                    currencies.currency,
                    jsonb_agg(ust.*) AS jobs,
                    uft.total_user_fee,
                    cft.total_client_fee,
                    et.total_earnings,
                    pt.total_payment,
                    pb.pending_balance,
                    ab.available_balance
                FROM currencies
                RIGHT JOIN (
                    SELECT jobs.job_price_currency FROM jobs
                    WHERE jobs.job_status = 'Complete'
                    AND (job_client = $1 OR job_user = $1)
                ) AS ust ON ust.job_price_currency = currencies.currency
                LEFT JOIN (
                    SELECT sum(user_app_fee) AS total_user_fee, jobs.job_price_currency FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    WHERE job_user = $1
                    AND job_status = 'Complete'
                    GROUP BY job_price_currency
                ) AS uft ON currencies.currency = uft.job_price_currency
                LEFT JOIN (
                    SELECT sum(client_app_fee) AS total_client_fee, jobs.job_price_currency FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    WHERE job_client = $1
                    AND job_status = 'Complete'
                    GROUP BY job_price_currency
                ) AS cft ON currencies.currency = cft.job_price_currency
                LEFT JOIN (
                    SELECT sum(payout_amount) AS total_earnings, jobs.job_price_currency FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    WHERE job_status = 'Complete'
                    AND payout_status = 'paid'
                    AND job_user = $1
                    GROUP BY job_price_currency
                ) AS et ON currencies.currency = et.job_price_currency
                LEFT JOIN (
                    SELECT sum(payout_amount) AS total_payment, jobs.job_price_currency FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    WHERE job_status = 'Complete'
                    AND job_client = $1
                    GROUP BY job_price_currency
                ) AS pt ON currencies.currency = pt.job_price_currency
                LEFT JOIN (
                    SELECT sum(milestone_payment_after_fees) AS pending_balance, jobs.job_price_currency FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    WHERE job_user = $1
                    AND payout_status = 'pending'
                    GROUP BY job_price_currency
                ) AS pb ON currencies.currency = pb.job_price_currency
                LEFT JOIN (
                    SELECT sum(milestone_payment_after_fees) AS available_balance, jobs.job_price_currency FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    WHERE job_user = $1
                    AND payout_status = 'available'
                    GROUP BY job_price_currency
                ) AS ab ON currencies.currency = ab.job_price_currency
                GROUP BY currencies.currency, uft.total_user_fee, cft.total_client_fee, et.total_earnings, pt.total_payment, pb.pending_balance, ab.available_balance`, [req.session.user.username]);

                await client.query('COMMIT')
                .then(() => resp.send({
                    status: 'success',
                    stats: jobStats.rows.length > 0 ? jobStats.rows[0] : {},
                    balance_available: balanceAvailable.rows[0].balance_available,
                    balance_pending: balancePending.rows[0].balance_pending,
                    job_years: jobYears.rows,
                    finance: finance.rows
                }));
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

app.post('/api/get/jobs/summary', authenticate, async(req, resp) => {
    let date = new Date(req.body.year);
    let thisYear = date.getUTCFullYear();
    let beginning = new Date(thisYear, 0, 1);
    let end = new Date(thisYear, 11, 31);

    await db.query(`SELECT
        currencies.currency,
        jsonb_agg(ust.*) AS jobs
    FROM currencies
    RIGHT JOIN (
        SELECT jobs.*, COUNT(job_milestones.milestone_id) AS milestone_count, SUM(job_milestones.user_app_fee) AS total_user_fee, SUM(job_milestones.client_app_fee) AS total_client_fee, SUM(requested_payment_amount) AS total_payment, r.token_status FROM jobs
        LEFT JOIN job_milestones ON jobs.job_id = job_milestones.milestone_job_id
        LEFT JOIN (
            SELECT token_status, token_job_id FROM review_tokens
        ) AS r ON r.token_job_id = jobs.job_id
        WHERE jobs.job_status = 'Complete'
        AND (job_client = $1 OR job_user = $1)
        AND jobs.job_created_date >= $2 AND jobs.job_created_date <= $3
        GROUP BY jobs.job_id, r.token_status
        ORDER BY jobs.job_end_date
    ) AS ust ON ust.job_price_currency = currencies.currency
    GROUP BY currencies.currency`, [req.session.user.username, beginning, end])
    .then(result => {
        if (result) {
            resp.send({status: 'success', jobs: result.rows});
        } else {
            resp.send({status: 'error', statusMessage: 'Fail to retrieve jobs'});
        }
    })
    .catch(err => {
        return error.log(err, req, resp);
    });
});

app.post('/api/get/milestone/details', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) return error.log(err, req, resp);

        (async() => {
            try {
                await client.query('BEGIN');

                let milestone = await client.query(`SELECT balance_txn_id FROM job_milestones WHERE milestone_id = $1`, [req.body.id]);
                let balance = await stripe.balance.retrieveTransaction(milestone.rows[0].balance_txn_id, {expand: ['source.transfer.destination_payment.balance_transaction']});
                let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1`, [req.body.id]);

                await client.query('COMMIT')
                .then(() => resp.send({status: 'success', balance: balance, files: files.rows}));
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                done();
            }
        })()
        .catch(err => {
            return error.log(err, req, resp);
        });
    });
});

module.exports = app;