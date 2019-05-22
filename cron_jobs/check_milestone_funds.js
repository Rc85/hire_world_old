require('dotenv').config({path: __dirname + '/.env'});
const db = require('../pg_conf');
const error = require('../modules/utils/error-handler');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const moneyFormatter = require('../modules/utils/money-formatter');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

db.query(`SELECT system_events.*, users.username, users.user_email, user_settings.email_notifications, jobs.job_id, job_milestones.milestone_id, job_milestones.milestone_fund_due_date, job_milestones.milestone_payment_amount FROM system_events
LEFT JOIN job_milestones ON job_milestones.charge_id = system_events.event_reference
LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
LEFT JOIN users ON jobs.job_user = users.username
LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
WHERE event_name = 'check_milestone_funds'
AND CAST(event_execute_date AS date) - current_date BETWEEN 0 AND 1
AND job_milestones.milestone_status IN ('In Progress', 'Requesting Payment')
AND event_status = 'Queued'`)
.then(result => {
    if (result && result.rows.length > 0) {
        for (let row of result.rows) {
            if (row.email_notifications) {
                let message = {
                    to: row.user_email,
                    from: {
                        name: 'Hire World',
                        email: 'admin@hireworld.ca'
                    },
                    subject: 'Milestone funds will be refunded soon!',
                    dynamicTemplateData: {
                        content: `This is a reminder that the funds equal to the amount of $${moneyFormatter(row.milestone_payment_amount)} for milestone ID ${row.milestone_id} in job ID: ${row.job_id} will be refunded on ${moment(row.milestone_fund_due_date).format('MM-DD-YYYY')}. If you feel you will not complete the milestone by then, please communicate with the other party regarding partial payment for partial work completed. If you need more time to complete the milestone, we suggest you politely ask the other party to start another job to do so.`,
                        templateId: 'd-9459cc1fde43454ca77670ea97ee2d5a',
                        subject: 'Milestone funds will be refunded soon!'
                    },
                    trackingSettings: {
                        clickTracking: {
                            enable: false
                        }
                    }
                }

                sgMail.send(message)
                then(() => {
                    db.query(`UPDATE system_events SET event_modified_date = current_timestamp, event_status = 'Processed' WHERE event_id = ANY($1)`, [row.event_id]);
                })
                .catch(err => error.log(err, false, false, 'check_milestone_funds'));
            }

            db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [row.username, `You have 29 more days to complete milestone ID: ${row.milestone_id} in job ID: ${row.job_id}`, 'Warning']);
        }
    }
})
.catch(err => error.log(err, false, false, 'check_milestone_funds'));