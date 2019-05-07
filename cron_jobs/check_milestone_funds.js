require('dotenv').config({path: __dirname + '/.env'});
const db = require('../modules/db');
const error = require('../modules/utils/error-handler');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

db.query(`SELECT system_events.*, users.user_email, jobs.job_id, job_milestones.milestone_id, job_milestones.milestone_fund_due_date, job_milestones.milestone_payment_amount FROM system_events
LEFT JOIN job_milestones ON job_milestones.charge_id = system_events.event_reference
LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
LEFT JOIN users ON jobs.job_user = users.username
WHERE event_name = 'check_milestone_funds'
AND CAST(event_execute_date AS date) - current_date BETWEEN 0 AND 1
AND job_milestones.payout_status = 'available'
AND event_status = 'Queued'`)
.then(result => {
    if (result && result.rows.length > 0) {
        let emails = [];

        for (let row of result.rows) {
            db.query(`UPDATE system_events SET event_modified_date = current_timestamp, event_status = 'Processed' WHERE event_id = $1`, [row.event_id])
            .then(result => {
                if (result && result.rowCount === 1) {
                    emails.push({
                        to: row.user_email,
                        from: 'admin@hireworld.ca',
                        subject: 'Milestone funds will be refunded soon!',
                        content: `This is a reminder that the funds equal to the amount of $${row.milestone_payment_amount} for milestone ID ${row.milestone_id} will be due on ${moment(row.milestone_fund_due_date).format('MM-DD-YYYY')} and will be refunded a day prior. If you are unable to complete the milestone by then, please communicate with the other party regarding partial delivery for partial payment. If you need more time to complete the milestone, we suggest you politely ask the other party to start another job to do so.`,
                        templateId: 'd-9459cc1fde43454ca77670ea97ee2d5a',
                        trackingSettings: {
                            clickTracking: {
                                enable: false
                            }
                        }
                    });
                }
            })
            .catch(err => error.log(err, false, false, 'check_milestone_funds'));
        }

        sgMail.send(emails);
    }
})
.catch(err => error.log(err, false, false, 'check_milestone_funds'));