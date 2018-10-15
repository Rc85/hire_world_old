const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.post('/api/get/user', async(req, resp) => {
    let user = await db.query(`SELECT users.username, users.user_email, users.user_last_login, user_profiles.*, user_settings.*, user_listings.listing_id, user_listings.listing_status FROM users
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
    LEFT JOIN user_listings ON users.username = user_listings.listing_user
    WHERE users.username = $1 AND users.user_status = 'Active'`, [req.body.username])
    .then(result => {
        return result;
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });

    if (user !== undefined) {
        if (user.rows.length === 1) {
            if (user.rows[0].hide_email === true) {
                delete user.rows[0].user_email;
            }

            if (!user.rows[0].display_business_name) {
                delete user.rows[0].business_name;
            }

            if (!user.rows[0].display_fullname) {
                delete user.rows[0].user_firstname;
                delete user.rows[0].user_lastname;
            }

            if (!user.rows[0].display_contacts) {
                delete user.rows[0].user_phone;
                delete user.rows[0].user_address;
            }

            delete user.rows[0].hide_email;
            delete user.rows[0].display_business_name;
            delete user.rows[0].display_fullname;
            delete user.rows[0].display_contacts;

            let reviews = await db.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews
            LEFT JOIN users ON users.username = user_reviews.reviewer
            LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
            WHERE user_reviews.reviewing = $1 AND user_reviews.review IS NOT NULL
            ORDER BY user_reviews.reviewer = $2 DESC, user_reviews.review_date DESC`, [req.body.username, req.session.user.username]);

            let stats = await db.query(`SELECT
                (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_stage = 'Complete'),
                (SELECT COUNT(job_id) AS job_abandon FROM jobs WHERE job_stage = 'Abandoned'),
                (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating FROM user_reviews WHERE reviewing = $1),
                (SELECT COUNT(review_id) AS job_count FROM user_reviews WHERE review IS NOT NULL AND reviewing = $1),
                user_view_count.view_count,
                users.user_last_login FROM users
            LEFT JOIN user_reviews ON users.username = user_reviews.reviewing
            LEFT JOIN user_view_count ON user_view_count.viewing_user = users.username
            LEFT JOIN jobs ON jobs.job_id = user_reviews.review_job_id
            WHERE username = $1
            LIMIT 1;`, [req.body.username]);

            await db.query(`INSERT INTO user_view_count (viewing_user, view_count) VALUES ($1, $2) ON CONFLICT (viewing_user) DO UPDATE SET view_count = user_view_count.view_count + 1`, [req.body.username, 1]);

            resp.send({status: 'success', user: user.rows[0], reviews: reviews.rows, stats: stats.rows[0]});
        } else {
            resp.send({status: 'error page', statusMessage: `The requested user's profile does not exist`});
        }
    }
});

module.exports = app;