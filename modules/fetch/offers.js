const app = require('express').Router();
const db = require('../db');

app.post('/api/get/offer', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_client, job_user FROM jobs WHERE (job_client = $1 OR job_user = $1) AND job_id = $2`, [req.session.user.username, req.body.job_id]);

                    if (authorized !== undefined && authorized.rows.length === 1) {
                        let job = await client.query(`SELECT * FROM jobs
                        LEFT JOIN user_listings ON listing_id = job_listing_id
                        WHERE job_id = $1 ${req.body.stage === 'Abandoned' ? `AND job_stage IN ($2, 'Incomplete')` : 'AND job_stage = $2'}`, [req.body.job_id, req.body.stage]);

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
                    ;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                console.log(err);
                resp.send({status: 'access error', statusMessage: 'An error occurred'});
            });
        });
    }
});

module.exports = app;