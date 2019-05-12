require('dotenv').config({path: __dirname + '/.env'});
const db = require('../modules/db');
const error = require('../modules/utils/error-handler');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const moneyFormatter = require('../modules/utils/money-formatter');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

db.query(`SELECT system_events.*, users.user_email, u.user_email AS client_email, user_settings.email_notifications AS user_email_setting, u.email_notifications AS client_email_setting, jobs.job_id, jobs.job_user, jobs.job_client, job_milestones.milestone_id, job_milestones.milestone_fund_due_date, job_milestones.milestone_payment_amount, job_milestones.charge_id FROM system_events
LEFT JOIN job_milestones ON job_milestones.charge_id = system_events.event_reference
LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
LEFT JOIN users ON users.username = jobs.job_user
LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
LEFT JOIN (
    SELECT username, user_email, email_notifications FROM users
    LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
) AS u ON u.username = jobs.job_client
WHERE system_events.event_name = 'refund_milestone_funds'
AND system_events.event_status = 'Queued'
AND CAST(event_execute_date AS date) - current_date BETWEEN 0 AND 1`)
.then(result => {
    if (result && result.rows.length > 0) {
        for (let row of result.rows) {
            stripe.refunds.create(row.charge_id, {
                reason: 'requested_by_customer',
                refund_application_fee: true,
                reverse_transfer: true,
                metadata: {
                    job_id: row.job_id,
                    milestone_id: row.milestone_id
                }
            })
            .then(refund => {
                let messages = [];

                if (row.user_email_setting) {
                    let message = {
                        to: row.user_email,
                        from: {
                            name: 'Hire World',
                            email: 'admin@hireworld.ca'
                        },
                        subject: 'Milestone was incomplete',
                        content: `It is our regret to inform you that milestone ID: ${row.milestone_id} in job ID: ${row.job_id} did not complete on time. As a result, we refunded the amount of $${moneyFormatter(row.milestone_payment_amount)} ${refund.currency.toUpperCase()} back to the client and the job has been flagged as "Abandoned". Abandoned jobs will slightly impact your completion rate and a low completion rate is not a good indicator on your profile. We hope that in the future, you can set milestones with conditions that are achievable because we sincerely want our customers to build and grow their business on Hire World.
                        
                        <p>For more information on "Abandoned" jobs, refer to our <a href='https://hireworld.ca/faq'>FAQ</a>.
                        
                        <p>
                            <div><small style='color: darkgrey;'>Refund ID: ${refund.id}</small></div>
                            <div><small style='color: darkgrey;'>Charge ID: ${refund.charge}</small></div>
                        </p>`,
                        templateId: 'd-9459cc1fde43454ca77670ea97ee2d5a',
                        trackingSettings: {
                            clickTracking: {
                                enable: false
                            }
                        }
                    }

                    messages.push(message);
                }

                if (row.client_email_setting) {
                    let message = {
                        to: row.user_email,
                        from: {
                            name: 'Hire World',
                            email: 'admin@hireworld.ca'
                        },
                        subject: 'We refunded you!',
                        content: `This email is to inform you that milestone ID: ${row.milestone_id} in job ID: ${row.job_id} did not complete on time. As a result, we refunded the amount of $${moneyFormatter(row.milestone_payment_amount)} ${refund.currency.toUpperCase()} back to the account that was originally charged and the job has been flagged as "Abandoned".

                        <p>For tips and options on what to do and how you can prevent a job from being abandoned, refer to our <a href='https://hireworld.ca/faq'>FAQ</a>.
                        
                        <p>
                            <div><small style='color: darkgrey;'>Refund ID: ${refund.id}</small></div>
                            <div><small style='color: darkgrey;'>Charge ID: ${refund.charge}</small></div>
                        </p>`,
                        templateId: 'd-9459cc1fde43454ca77670ea97ee2d5a',
                        trackingSettings: {
                            clickTracking: {
                                enable: false
                            }
                        }
                    }

                    messages.push(message);
                }

                sgMail.send(messages)
                .then(() => {
                    db.query(`UPDATE system_events SET event_status = 'Processed' WHERE event_id = ANY($1)`, [row.event_id])
                    .catch(err => {
                        return error.log(err, false, false, 'refund_milestone_funds');
                    });
                })
                .catch(err => {
                    return error.log(err, false, false, 'refund_milestone_funds');
                });

                db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [row.job_user, `Unfortunately, milestone ID: ${row.milestone_id} in job ID: ${row.job_id} did not complete on time and the client was refunded`, 'Update']);
                db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [row.job_client, `We've refunded the amount of $${moneyFormatter(row.milestone_payment_amount)} to you for milestone ID: ${row.milestone_id} in job ID: ${row.job_id} as it was not completed on time`, 'Update']);
            })
            .catch(err => {
                return error.log(err, false, false, 'refund_milestone_funds');
            });
        }
    }
})