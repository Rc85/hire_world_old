const app = require('express').Router();
const db = require('../../pg_conf');
const error = require('../utils/error-handler');
const authenticate = require('../../middlewares/auth');

app.post('/api/get/posted/jobs', authenticate, async(req, resp) => {
    let totalPosts = await db.query(`SELECT COUNT(job_post_id) AS total_posts FROM job_postings WHERE job_post_user = $1`, [req.session.user.username])
    .catch(err => {
        return error.log(err, req, resp);
    });

    await db.query(`SELECT * FROM job_postings WHERE job_post_user = $1 ORDER BY job_post_id DESC OFFSET $2 LIMIT 25`, [req.session.user.username, req.body.offset])
    .then(result => {
        if (result) {
            resp.send({status: 'success', jobs: result.rows, totalPosts: totalPosts.rows[0].total_posts || 0});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/get/posted/job/details', authenticate, async(req, resp) => {
    let authorized = await db.query(`SELECT * FROM job_postings WHERE job_post_id = $1`, [req.body.id]);

    if (authorized.rows.length === 1) {
        if (authorized.rows[0].job_post_user === req.session.user.username) {
            // get applicants as well

            resp.send({status: 'success', job: authorized.rows[0]});
        } else {
            resp.send({status: 'authorized', statusMessage: `You're not authorized`});
        }
    } else {
        resp.send({status: 'error'});
    }
});

app.post('/api/get/posted/job', async(req, resp) => {
    let application, saved, reported, friend;

    if (req.session.user) {
        application = await db.query(`SELECT * FROM job_post_applications WHERE applicant = $1 AND applied_job_post_id = $2`, [req.session.user.username, req.body.id])
        .catch(err => error.log(err, req));
        saved = await db.query(`SELECT saved_id FROM saved_job_posts WHERE saved_by = $1 AND saved_job_post_id = $2`, [req.session.user.username, req.body.id]);
        reported = await db.query(`SELECT report_id FROM reports WHERE reported_content_link = $1 AND reporter = $2 AND report_type = 'Job Posting' AND report_status = 'Pending'`, [req.body.url, req.session.user.username]);
    }

    await db.query(`SELECT job_postings.*, user_profiles.avatar_url, user_profiles.user_facebook, user_profiles.user_github, user_profiles.user_twitter, user_profiles.user_instagram, user_profiles.user_website, user_profiles.user_linkedin, users.user_email, user_settings.hide_email FROM job_postings
    LEFT JOIN users ON users.username = job_postings.job_post_user
    LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
    LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
    WHERE job_post_id = $1`, [req.body.id])
    .then(async result => {
        if (result.rows[0].hide_email) {
            delete result.rows[0].user_email;
        }

        delete result.rows[0].hide_email;

        if (req.session.user) {
            friend = await db.query(`SELECT friend_id FROM friends WHERE friend_user_1 = $1 AND friend_user_2 = $2`, [req.session.user.username, result.rows[0].job_post_user]);
        }

        if (result) {
            resp.send({status: 'success', job: result.rows[0], application: application && application.rows.length > 0 ? application.rows[0] : null, isFriend: friend && friend.rows.length === 1, saved: saved && saved.rows.length === 1, reported: reported && reported.rows.length === 1});
        } else {
            resp.send({status: 'error'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/get/posted/job/applicants', authenticate, async(req, resp) => {
        let authorized = await db.query(`SELECT job_post_applications.*, job_postings.job_post_user, user_profiles.avatar_url, user_profiles.user_city, user_profiles.user_region, user_profiles.user_country FROM job_post_applications
        LEFT JOIN job_postings ON job_postings.job_post_id = job_post_applications.applied_job_post_id
        LEFT JOIN users ON users.username = job_post_applications.applicant
        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
        WHERE applied_job_post_id = $1 AND application_status != 'Rejected'`, [req.body.id]);

        if (authorized.rows.length > 0 && authorized.rows[0].job_post_user === req.session.user.username) {
            resp.send({status: 'success', applicants: authorized.rows});
        } else if (authorized.rows.length === 0) {
            resp.send({status: 'success', applicants: []});
        } else {
            resp.send({status: 'error', statusMessage: `You're not authorized`});
        }
});

app.post('/api/get/applied/jobs', authenticate, async(req, resp) => {
    await db.query(`SELECT * FROM job_postings
    LEFT JOIN job_post_applications
    ON job_postings.job_post_id = job_post_applications.applied_job_post_id
    WHERE applicant = $1
    AND job_post_expiration_date > current_timestamp`, [req.session.user.username])
    .then(result => {
        if (result) {
            resp.send({status: 'success', jobs: result.rows})
        } else {
            resp.send({status: 'error'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/get/saved/jobs', authenticate, async(req, resp) => {
    let savedJobs = await db.query(`SELECT saved_job_post_id FROM saved_job_posts WHERE saved_by = $1`, [req.session.user.username])
    .catch(err => {
        return error.log(err, req, resp);
    });

    let savedIds = [];

    for (let row of savedJobs.rows) {
        savedIds.push(row.saved_job_post_id);
    }

    let totalPosts = await db.query(`SELECT COUNT(job_post_id) AS total_posts FROM job_postings WHERE job_post_id = ANY ($1)`, [savedIds])
    .catch(err => {
        return error.log(err, req, resp);
    })

    await db.query(`SELECT * FROM job_postings WHERE job_post_id = ANY($1) OFFSET $2 LIMIT 25`, [savedIds, req.body.offset])
    .then(result => {
        if (result) {
            resp.send({status: 'success', jobs: result.rows, totalPosts: totalPosts.rows[0].total_posts || 0});
        } else {
            resp.send({status: 'error'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

module.exports = app;