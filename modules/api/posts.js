const app = require('express').Router();
const db = require('../db');
const validate = require('../utils/validate');
const request = require('request');
const error = require('../utils/error-handler');
const sgMail = require('@sendgrid/mail');
const authenticate = require('../utils/auth');
const moment = require('moment');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/post/job', authenticate, (req, resp) => {
        if (!validate.titleCheck.test(req.body.title)) {
            resp.send({status: 'error', statusMessage: `Invalid title`});
        } else if (req.body.type !== 'Temporary' && req.body.type !== 'Part-time' && req.body.type !== 'Full-time' && req.body.type !== 'Contract' && req.body.type !== 'Project') {
            resp.send({status: 'error', statusMessage: 'Invalid job type'});
        } else if (req.body.paymentType !== 'Salary' && req.body.paymentType !== 'Budget' && req.body.paymentType !== 'Hourly Wage') {
            resp.send({status: 'error', statusMessage: 'Invalid payment'});
        } else if (req.body.paymentType === 'Budget' && req.body.budgetThreshold !== 'Approximately' && req.body.budgetThreshold !== 'Less than' && req.body.budgetThreshold !== 'Exactly') {
            resp.send({status: 'error', statusMessage: 'Invalid payment input'});
        } else if ((req.body.paymentType === 'Salary' || req.body.paymentType === 'Hourly Wage') && req.body.budgetThreshold !== 'Between' && req.body.budgetThreshold !== 'To Be Discussed' && req.body.budgetThreshold !== 'Approximately' && req.body.budgetThreshold !== 'Exactly') {
            resp.send({status: 'error', statusMessage: 'Invalid payment input'});
        } else if ((req.body.budgetThreshold === 'Between' && validate.blankCheck.test(req.body.budgetEnd))) {
            resp.send({status: 'error', statusMessage: 'Payment range required'});
        } else if (req.body.budgetThreshold === 'Between' && parseFloat(req.body.budget) >= parseFloat(req.body.budgetEnd)) {
            resp.send({status: 'error', statusMessage: 'Invalid payment range'});
        } else if (req.body.budgetThreshold !== 'To Be Discussed' && isNaN(parseFloat(req.body.budget))) {
            resp.send({status: 'error', statusMessage: 'Payment must be numbers'});
        } else if (req.body.budgetThreshold === 'Between' && req.body.budgetEnd && isNaN(parseFloat(req.body.budgetEnd))) {
            resp.send({status: 'error', statusMessage: 'Payment must be numbers'});
        } else if (parseFloat(req.body.budget) <= 0) {
            resp.send({status: 'error', statusMessage: 'Payment cannot be less than 0'});
        } else if (!req.body.local && !req.body.remote && !req.body.online) {
            resp.send({status: 'error', statusMessage: 'At least one work area is required'});
        } else if (parseInt(req.body.positions) <= 0) {
            resp.send({status: 'error', statusMessage: 'Positions cannot be less than 1'});
        } else if (!validate.integerCheck.test(req.body.positions)) {
            resp.send({status: 'error', statusMessage: 'Positions must be an integer'});
        } else if (!req.body.postAsUser && (validate.blankCheck.test(req.body.company) || !req.body.company)) {
            resp.send({status: 'error', statusMessage: 'Company name is required'});
        } else if (!req.body.postAsUser && req.body.website && !validate.urlCheck.test(req.body.website)) {
            resp.send({status: 'error', statusMessage: 'Invalid website URL'});
        } else if (!validate.locationCheck.test(req.body.country)) {
            resp.send({status: 'error', statusMessage: 'Invalid country'});
        } else if (!validate.locationCheck.test(req.body.region)) {
            resp.send({status: 'error', statusMessage: 'Invalid region'});
        } else if (!validate.locationCheck.test(req.body.city)) {
            resp.send({status: 'error', statusMessage: 'Invalid city'});
        } else if (validate.blankCheck.test(req.body.details)) {
            resp.send({status: 'error', statusMessage: 'Details is required'});
        } else if (typeof req.body.notification !== 'boolean') {
            resp.send({status: 'error', statusMessage: 'Enable or disable notification'});
        } else if (!moment(req.body.expire).isValid()) {
            resp.send({status: 'error', statusMessage: 'Expiration date is invalid'});
        } else if (moment(req.body.expire).diff(moment(), 'month') > 6) {
            resp.send({status: 'error', statusMessage: 'Expiration date be longer than 6 months from now'});
        } else {
            request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
                if (err) error.log(err, req, resp);

                let response = JSON.parse(res.body);

                if (response.success) {
                    db.connect((err, client, done) => {
                        if (err) error.log(err, req, resp);

                        (async() => {
                            try {
                                await client.query('BEGIN');

                                await client.query(`INSERT INTO job_postings (job_post_title, job_post_user, job_post_sector, job_post_details, job_post_budget, job_post_as_user, job_is_local, job_is_remote, job_is_online, job_post_company, job_post_company_website, job_post_country, job_post_region, job_post_city, job_post_budget_threshold, job_post_notification, job_post_position_num, job_post_payment_type, job_post_budget_end, job_post_type, job_post_expiration_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`, [req.body.title, req.session.user.username, req.body.sector, req.body.details, req.body.budget, req.body.postAsUser, req.body.local, req.body.remote, req.body.online, req.body.company, req.body.website, req.body.country, req.body.region, req.body.city, req.body.budgetThreshold, req.body.notification, req.body.positions, req.body.paymentType, req.body.budgetEnd, req.body.type, req.body.expire]);

                                await client.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [req.session.user.username, `You posted a job`, 'Post']);

                                await client.query('COMMIT')
                                .then(() => resp.send({status: 'success', statusMessage: 'Job posted'}));
                            } catch (e) {
                                await client.query(`ROLLBACK`);
                                throw e;
                            } finally {
                                done();
                            }
                        })()
                        .catch(err => error.log(err, req, resp));
                    });
                } else {
                    resp.send({status: 'error', statusMessage: `You're not human`});
                }
            });
        }
});

app.post('/api/posted/job/toggle', authenticate, async(req, resp) => {
        let authorized = await db.query(`SELECT job_post_user FROM job_postings WHERE job_post_id = $1`, [req.body.id]);

        if (authorized.rows[0].job_post_user === req.body.user && req.body.user === req.session.user.username) {
            await db.query(`UPDATE job_postings SET job_post_status = $1 WHERE job_post_id = $2`, [req.body.status, req.body.id])
            .then(result => {
                if (result && result.rowCount === 1) {
                    resp.send({status: 'success', statusMessage: req.body.status === 'Active' ? 'Post activated' : 'Post deactivated'});
                } else {
                    resp.send({status: 'error', statusMessage: 'Failed to update'});
                }
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: `You're not authorized`});
        }
});

app.post('/api/posted/job/update', authenticate, async(req, resp) => {
        if (!validate.titleCheck.test(req.body.title)) {
            resp.send({status: 'error', statusMessage: `Invalid title`});
        } else if (req.body.type !== 'Temporary' && req.body.type !== 'Part-time' && req.body.type !== 'Full-time' && req.body.type !== 'Contract' && req.body.type !== 'Project') {
            resp.send({status: 'error', statusMessage: 'Invalid job type'});
        } else if (req.body.paymentType !== 'Salary' && req.body.paymentType !== 'Budget' && req.body.paymentType !== 'Hourly Wage') {
            resp.send({status: 'error', statusMessage: 'Invalid payment'});
        } else if (req.body.paymentType === 'Budget' && req.body.budgetThreshold !== 'Approximately' && req.body.budgetThreshold !== 'Less than' && req.body.budgetThreshold !== 'Exactly') {
            resp.send({status: 'error', statusMessage: 'Invalid payment input'});
        } else if ((req.body.paymentType === 'Salary' || req.body.paymentType === 'Hourly Wage') && req.body.budgetThreshold !== 'Between' && req.body.budgetThreshold !== 'To Be Discussed' && req.body.budgetThreshold !== 'Approximately' && req.body.budgetThreshold !== 'Exactly') {
            resp.send({status: 'error', statusMessage: 'Invalid payment input'});
        } else if ((req.body.budgetThreshold === 'Between' && validate.blankCheck.test(req.body.budgetEnd))) {
            resp.send({status: 'error', statusMessage: 'Payment range required'});
        } else if (req.body.budgetThreshold === 'Between' && parseFloat(req.body.budget) >= parseFloat(req.body.budgetEnd)) {
            resp.send({status: 'error', statusMessage: 'Invalid payment range'});
        } else if (req.body.budgetThreshold !== 'To Be Discussed' && isNaN(parseFloat(req.body.budget))) {
            resp.send({status: 'error', statusMessage: 'Payment must be numbers'});
        } else if (req.body.budgetThreshold === 'Between' && req.body.budgetEnd && isNaN(parseFloat(req.body.budgetEnd))) {
            resp.send({status: 'error', statusMessage: 'Payment must be numbers'});
        } else if (parseFloat(req.body.budget) <= 0) {
            resp.send({status: 'error', statusMessage: 'Payment cannot be less than 0'});
        } else if (!req.body.local && !req.body.remote && !req.body.online) {
            resp.send({status: 'error', statusMessage: 'At least one work area is required'});
        } else if (parseInt(req.body.positions) <= 0) {
            resp.send({status: 'error', statusMessage: 'Positions cannot be less than 1'});
        } else if (!validate.integerCheck.test(req.body.positions)) {
            resp.send({status: 'error', statusMessage: 'Positions must be an integer'});
        } else if (!req.body.postAsUser && (validate.blankCheck.test(req.body.company) || !req.body.company)) {
            resp.send({status: 'error', statusMessage: 'Company name is required'});
        } else if (!req.body.postAsUser && req.body.website && !validate.urlCheck.test(req.body.website)) {
            resp.send({status: 'error', statusMessage: 'Invalid website URL'});
        } else if (!validate.locationCheck.test(req.body.country)) {
            resp.send({status: 'error', statusMessage: 'Invalid country'});
        } else if (!validate.locationCheck.test(req.body.region)) {
            resp.send({status: 'error', statusMessage: 'Invalid region'});
        } else if (!validate.locationCheck.test(req.body.city)) {
            resp.send({status: 'error', statusMessage: 'Invalid city'});
        } else if (validate.blankCheck.test(req.body.details)) {
            resp.send({status: 'error', statusMessage: 'Details is required'});
        } else if (typeof req.body.notification !== 'boolean') {
            resp.send({status: 'error', statusMessage: 'Enable or disable notification'});
        } else if (!moment(req.body.expire).isValid()) {
            resp.send({status: 'error', statusMessage: 'Expiration date is invalid'});
        } else if (moment(req.body.expire).diff(moment(), 'month') > 6) {
            resp.send({status: 'error', statusMessage: 'Expiration date be longer than 6 months from now'});
        } else {
            let authorized = await db.query(`SELECT * FROM job_postings WHERE job_post_id = $1`, [req.body.id]);

            if (authorized.rows[0].job_post_user === req.body.user && req.body.user === req.session.user.username) {
                await db.query(`UPDATE job_postings SET job_post_title = $1, job_post_modified_date = current_timestamp, job_post_sector = $2, job_post_details = $3, job_post_budget = $4, job_post_as_user = $5, job_is_local = $6, job_is_remote = $7, job_is_online = $8, job_post_company = $9, job_post_company_website = $10, job_post_country = $11, job_post_region = $12, job_post_city = $13, job_post_budget_threshold = $14, job_post_notification = $15, job_post_position_num = $17, job_post_payment_type = $18, job_post_budget_end = $19, job_post_type = $20, job_post_expiration_date = $21 WHERE job_post_id = $16 RETURNING *`, [req.body.title, req.body.sector, req.body.details, req.body.budget, req.body.postAsUser, req.body.local, req.body.remote, req.body.online, req.body.company, req.body.website, req.body.country, req.body.region, req.body.city, req.body.budgetThreshold, req.body.notification, req.body.id, req.body.positions, req.body.paymentType, req.body.budgetEnd, req.body.type, req.body.expire])
                .then(result => {
                    if (result && result.rowCount === 1) {
                        resp.send({status: 'success', statusMessage: 'Job post updated', job: result.rows[0]});
                    } else {
                        resp.send({status: 'error', statusMessage: `Fail to update`});
                    }
                })
                .catch(err => error.log(err, req, resp));
            } else {
                resp.send({status: 'error', statusMessage: `You're not authorized`});
            }
        }
});

app.post('/api/posted/job/apply', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            

            if (req.body.user === req.session.user.username) {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        let applied = await client.query(`SELECT applicant FROM job_post_applications WHERE applicant = $1 AND applied_job_post_id = $2`, [req.session.user.username, req.body.id]);
                        let job = await client.query(`SELECT job_post_title, job_post_notification, job_post_user FROM job_postings WHERE job_post_id = $1`, [req.body.id]);

                        if (applied.rows.length === 0) {
                            let application = await client.query(`INSERT INTO job_post_applications (applicant, applied_job_post_id, application_details, application_notification) VALUES ($1, $2, $3, $4) RETURNING *`, [req.session.user.username, req.body.id, req.body.details, req.body.notification]);

                            let user = await client.query(`SELECT user_email FROM users WHERE username = $1`, [job.rows[0].job_post_user]);

                            await client.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [req.session.user.username, `You applied to a job`, 'Job']);

                            if (job.rows[0].job_post_notification) {
                                let message = {
                                    to: user.rows[0].user_email,
                                    from: 'admin@hireworld.ca',
                                    subject: 'You Have an Applicant at Hire World!',
                                    templateId: 'd-c6d7c9b6779f4268a673f103d50bfa81',
                                    dynamicTemplateData: {
                                        user: application.rows[0].applicant,
                                        title: job.rows[0].job_post_title,
                                        editPostedJob: `${process.env.SITE_URL}/dashboard/posted/job/details/${req.body.id}`,
                                        postedJob: `${process.env.SITE_URL}/job/${req.body.id}`
                                    },
                                    trackingSettings: {
                                        clickTracking: {
                                            enable: false
                                        }
                                    }
                                }

                                sgMail.send(message)
                                .catch(err => error.log(err, req, resp));
                            }

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Application successful', application: application.rows[0]}));
                        } else {
                            let error = new Error(`You cannot apply again`);
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
                .catch(err => error.log(err, req, resp));
            } else {
                // log suspcious activity here
                resp.send({status: 'error', statusMessage: 'Incorrect login'});
            }
        });
});

app.post('/api/posted/job/notification', authenticate, async(req, resp) => {
    let authorized = await db.query(`SELECT applicant, application_status FROM job_post_applications WHERE application_id = $1`, [req.body.id]);

    if (authorized.rows[0].applicant === req.session.user.username && req.body.user === req.session.user.username && req.body.user === authorized.rows[0].applicant) {
        if (authorized.rows[0].application_status !== 'Rejected') {
            await db.query(`UPDATE job_post_applications SET application_notification = $2 WHERE application_id = $1 RETURNING *`, [req.body.id, req.body.status])
            .then(result => {
                if (result && result.rowCount === 1) {
                    resp.send({status: 'success', statusMessage: req.body.status ? 'Notification enabled' : 'Notification disabled', application: result.rows[0]});
                } else {
                    resp.send({status: 'error', statusMessage: 'Cannot withdraw'});
                }
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: 'There is no reason for notification'});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    }
});

app.post('/api/applied/job/remove', authenticate, async(req, resp) => {
    let authorized = await db.query(`SELECT applicant FROM job_post_applications WHERE application_id = $1`, [req.body.id]);

    if (authorized.rows[0].applicant === req.session.user.username && req.session.user.username === req.body.user && req.body.user === authorized.rows[0].applicant) {
        await db.query(`INSERT INTO removed_applications (removed_application_id, removed_by) VALUES ($1, $2, $3)`, [req.body.id, req.session.user.username])
        .then(result => {
            if (result && result.rowCount === 1) {
                resp.send({status: 'success', statusMessage: 'Application removed'});
            } else {
                resp.send({status: 'error', statusMessage: 'Failed to remove'});
            }
        })
        .catch(err => error.log(err, req, resp));
    }
});

app.post('/api/posted/job/save', authenticate, async(req, resp) => {
    let job = await db.query(`SELECT job_post_user FROM job_postings WHERE job_post_id = $1`, [req.body.id]);

    if (req.session.user.username === job.rows[0].job_post_user) {
        resp.send({status: 'error', statusMessage: `You cannot save your own job post`});
    } else {
        let query;

        if (req.body.action) {
            query = `INSERT INTO saved_job_posts (saved_job_post_id, saved_by) VALUES ($1, $2)`;
        } else {
            query = `DELETE FROM saved_job_posts WHERE saved_job_post_id = $1 AND saved_by = $2`;
        }

        await db.query(query, [req.body.id, req.session.user.username])
        .then(result => {
            if (result && result.rowCount === 1) {
                resp.send({status: 'success', statusMessage: req.body.action ? 'Post saved' : 'Post removed'});
            } else {
                resp.send({statsu: 'error', statusMessage: 'Operation failed'});
            }
        })
        .catch(err => error.log(err, req, resp));
    }
});

app.post('/api/saved/job/remove', authenticate, async(req, resp) => {
    let savedJob = await db.query(`SELECT * FROM saved_job_posts WHERE saved_job_post_id = $1 AND saved_by = $2`, [req.body.id, req.session.user.username]);

    if (savedJob.rows[0].saved_by === req.body.user) {
        await db.query(`DELETE FROM saved_job_posts WHERE saved_id = $1`, [savedJob.rows[0].saved_id])
        .then(result => {
            if (result && result.rowCount === 1) {
                resp.send({status: 'success', statusMessage: 'Saved job removed'});
            } else {
                resp.send({status: 'error', statusMessage: 'Fail to remove saved job'});
            }
        })
        .catch(err => error.log(err, req, resp));
    }
});

module.exports = app;