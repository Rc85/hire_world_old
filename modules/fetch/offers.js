const app = require('express').Router();
const db = require('../db');

app.post('/api/get/offer', async(req, resp) => {
    let authorized = await db.query(`SELECT job_client, job_user FROM jobs WHERE (job_client = $1 OR job_user = $1) AND job_id = $2`, [req.session.user.username, req.body.id]);

    if (authorized !== undefined && authorized.rows.length === 1) {
        let job = await db.query(`SELECT jobs.*, user_services.service_name, user_services.service_detail FROM jobs
        LEFT JOIN user_services ON service_id = job_service_id
        WHERE job_id = $1 AND job_stage = $2 AND job_status != 'Deleted'`, [req.body.id, req.body.stage])
        .then(result => {
            if (result) {
                return result.rows;
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'access error', statusMessage: 'An error occurred when trying to retrieve the job.'});
        });

        let offer = await db.query(`SELECT * FROM offers WHERE offer_for_job = $1 AND offer_status != 'Deleted'`, [req.body.id])
        .then(result => {
            if (result) {
                return result.rows[0];
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred while trying to retrieve the offer.'});
        });

        if (job.length === 1) {
            resp.send({status: 'success', job: job[0], offer: offer});
        } else {
            resp.send({status: 'access error', statusMessage: `The job you are trying to retrieve does not exist.`})
        }
    } else {
        resp.send({status: 'access error', statusMessage: `You're not authorized to view this message.`});
    }
});

module.exports = app;