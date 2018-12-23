const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY)

app.post('/api/get/user', async(req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

        (async() => {
            try {
                await client.query('BEGIN');

                let listed = await client.query(`SELECT listing_user FROM user_listings WHERE listing_user = $1 AND listing_status = 'Active'`, [req.body.username]);

                if (listed && listed.rows.length === 1) {
                    let user = await client.query(`SELECT users.username, users.user_email, users.user_last_login, user_profiles.*, user_settings.hide_email, user_settings.display_fullname, user_settings.allow_messaging, user_listings.* FROM users
                    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                    LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                    LEFT JOIN user_listings ON users.username = user_listings.listing_user
                    WHERE users.username = $1 AND users.user_status = 'Active' AND user_listings.listing_status = 'Active'`, [req.body.username]);


                    if (user && user.rows.length === 1) {
                        delete user.rows[0].user_profile_id;

                        if (user.rows[0].hide_email === true) {
                            delete user.rows[0].user_email;
                        }

                        if (!user.rows[0].display_fullname) {
                            delete user.rows[0].user_firstname;
                            delete user.rows[0].user_lastname;
                        }

                        delete user.rows[0].hide_email;
                        delete user.rows[0].display_fullname;

                        let orderby = '';
                        let reviewsParam, reports, reportedUser;
                        let userIsReported = false;
                        let reportedReviews = [];
                        let businessHours = {};
                        
                        if (!user.rows[0].hide_business_hours) {
                            businessHoursQuery = await client.query(`SELECT * FROM business_hours WHERE business_owner = $1`, [req.body.username]);

                            if (businessHoursQuery.rows.length === 1) {
                                delete businessHoursQuery.rows[0].business_hour_id;
                                delete businessHoursQuery.rows[0].business_owner;

                                businessHours = businessHoursQuery.rows[0];
                            }
                        }

                        if (req.session.user) {
                            orderby = 'user_reviews.reviewer = $2 DESC, ';
                            reviewsParam = [req.body.username, req.session.user.username];
                            reports = await client.query(`SELECT reported_id FROM reports WHERE reporter = $1 AND report_type = $2 AND report_status = 'Pending'`, [req.session.user.username, 'Review']);
                            reportedUser = await client.query(`SELECT reported_id FROM reports WHERE reporter = $1 AND report_type = $2 AND reported_user = $3 AND report_status = 'Pending'`, [req.session.user.username, 'User', req.body.username]);


                            for (let report of reports.rows) {
                                reportedReviews.push(report.reported_id);
                            }

                            if (reportedUser && reportedUser.rows.length === 1) {
                                userIsReported = true;
                            }
                        } else {
                            reviewsParam = [req.body.username];
                        }

                        let reviews = await client.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews
                        LEFT JOIN users ON users.username = user_reviews.reviewer
                        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                        WHERE user_reviews.reviewing = $1 AND user_reviews.review IS NOT NULL AND user_reviews.review_status = 'Active'
                        ORDER BY ${orderby}user_reviews.review_date DESC`, reviewsParam);

                        let stats = await client.query(`SELECT
                            (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_stage = 'Completed'),
                            (SELECT COUNT(job_id) AS job_abandon FROM jobs WHERE job_stage = 'Abandoned'),
                            (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating FROM user_reviews WHERE reviewing = $1 AND review_rating IS NOT NULL),
                            (SELECT COUNT(review_id) AS job_count FROM user_reviews WHERE review IS NOT NULL AND reviewing = $1 AND review_status = 'Active'),
                            user_view_count.view_count,
                            users.user_last_login FROM users
                        LEFT JOIN user_reviews ON users.username = user_reviews.reviewing
                        LEFT JOIN user_view_count ON user_view_count.viewing_user = users.username
                        LEFT JOIN jobs ON jobs.job_id = user_reviews.review_job_id
                        WHERE username = $1
                        LIMIT 1;`, [req.body.username]);

                        await client.query(`INSERT INTO user_view_count (viewing_user, view_count) VALUES ($1, $2) ON CONFLICT (viewing_user) DO UPDATE SET view_count = user_view_count.view_count + 1`, [req.body.username, 1]);

                        await client.query('COMMIT')
                        .then(() =>  resp.send({status: 'success', user: user.rows[0], reviews: reviews.rows, stats: stats.rows[0], hours: businessHours, reports: reportedReviews, userReported: userIsReported}));
                    }
                } else {
                    let error = new Error(`That user is not listed`);
                    error.type = 'CUSTOM';
                    error.status = 'access error';
                    throw error;
                }
            } catch (e) {
                await client.query('ROLLBACK');
                throw e
            } finally {
                done();
            }
        })()
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});

            let message = 'An error occurred';
            let errorStatus = 'error';
            
            if (err.type === 'CUSTOM') {
                message = err.message;
                errorStatus = err.status;
            }

            resp.send({status: errorStatus, statusMessage: message});
        });
    });
    /* let listed = await db.query(`SELECT listing_user FROM user_listings WHERE listing_user = $1 AND listing_status = 'Active'`, [req.body.username]);

    if (listed && listed.rows.length === 1) {
        let user = await db.query(`SELECT users.username, users.user_email, users.user_last_login, user_profiles.*, user_settings.allow_messaging, user_listings.listing_id, user_listings.listing_status, user_listings.listing_sector FROM users
        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
        LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
        LEFT JOIN user_listings ON users.username = user_listings.listing_user
        WHERE users.username = $1 AND users.user_status = 'Active' AND user_listings.listing_status = 'Active'`, [req.body.username])
        .then(result => {
            return result;
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });

        if (user && user.rows.length === 1) {
            delete user.rows[0].user_profile_id;

            if (user.rows[0].hide_email === true) {
                delete user.rows[0].user_email;
            }

            if (!user.rows[0].display_fullname) {
                delete user.rows[0].user_firstname;
                delete user.rows[0].user_lastname;
            }

            delete user.rows[0].hide_email;
            delete user.rows[0].display_fullname;

            let orderby = '';
            let reviewsParam, reports, reportedUser;
            let userIsReported = false;
            let reportedReviews = [];
            let businessHours = {};
            
            if (!user.rows[0].hide_business_hours) {
                businessHoursQuery = await db.query(`SELECT * FROM business_hours WHERE business_owner = $1`, [req.body.username]);

                if (businessHoursQuery.rows.length === 1) {
                    delete businessHoursQuery.rows[0].business_hour_id;
                    delete businessHoursQuery.rows[0].business_owner;

                    businessHours = businessHoursQuery.rows[0];
                }
            }

            if (req.session.user) {
                orderby = 'user_reviews.reviewer = $2 DESC, ';
                reviewsParam = [req.body.username, req.session.user.username];
                reports = await db.query(`SELECT reported_id FROM reports WHERE reporter = $1 AND report_type = $2`, [req.session.user.username, 'Review']);
                reportedUser = await db.query(`SELECT reported_id FROM reports WHERE reporter = $1 AND report_type = $2 AND reported_user = $3`, [req.session.user.username, 'User', req.body.username]);


                for (let report of reports.rows) {
                    reportedReviews.push(report.reported_id);
                }

                if (reportedUser && reportedUser.rows.length === 1) {
                    userIsReported = true;
                }
            } else {
                reviewsParam = [req.body.username];
            }

            let reviews = await db.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews
            LEFT JOIN users ON users.username = user_reviews.reviewer
            LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
            WHERE user_reviews.reviewing = $1 AND user_reviews.review IS NOT NULL AND user_reviews.review_status = 'Active'
            ORDER BY ${orderby}user_reviews.review_date DESC`, reviewsParam);

            let stats = await db.query(`SELECT
                (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_stage = 'Completed'),
                (SELECT COUNT(job_id) AS job_abandon FROM jobs WHERE job_stage = 'Abandoned'),
                (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating FROM user_reviews WHERE reviewing = $1 AND review_rating IS NOT NULL),
                (SELECT COUNT(review_id) AS job_count FROM user_reviews WHERE review IS NOT NULL AND reviewing = $1 AND review_status = 'Active'),
                user_view_count.view_count,
                users.user_last_login FROM users
            LEFT JOIN user_reviews ON users.username = user_reviews.reviewing
            LEFT JOIN user_view_count ON user_view_count.viewing_user = users.username
            LEFT JOIN jobs ON jobs.job_id = user_reviews.review_job_id
            WHERE username = $1
            LIMIT 1;`, [req.body.username]);

            await db.query(`INSERT INTO user_view_count (viewing_user, view_count) VALUES ($1, $2) ON CONFLICT (viewing_user) DO UPDATE SET view_count = user_view_count.view_count + 1`, [req.body.username, 1]);

            resp.send({status: 'success', user: user.rows[0], reviews: reviews.rows, stats: stats.rows[0], hours: businessHours, reports: reportedReviews, userReported: userIsReported});
        } else {
            resp.send({status: 'error page', statusMessage: `The requested user's profile does not exist`});
        }
    } else {
        resp.send({status: 'error page', statusMessage: `The user does not have an active listing`});
    } */
});

app.get('/api/get/business_hours', async(req, resp) => {
    if (req.session.user) {
        await db.query(`SELECT monday, tuesday, wednesday, thursday, friday, saturday, sunday FROM business_hours WHERE business_owner = $1`, [req.session.user.username])
        .then(result => {
            if (result) resp.send({status: 'success', hours: result.rows[0]});
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.get('/api/get/user/notification-and-message-count', async(req, resp) => {
    if (req.session.user) {
        let notifications = await db.query(`SELECT COUNT(notification_id) AS notification_count FROM notifications WHERE notification_recipient = $1 AND notification_status = 'New'`, [req.session.user.username]);

        let messages = await db.query(`SELECT COUNT(message_id) AS message_count FROM messages WHERE message_recipient = $1 AND message_status = 'New'`, [req.session.user.username]);

        if (notifications && messages) {
            resp.send({status: 'success', notifications: notifications.rows[0].notification_count, messages: messages.rows[0].message_count});
        } else {
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        }
    } else {
        resp.send('done');
    }
});

app.get('/api/get/user/notifications', async(req, resp) => {
    if (req.session.user) {
        await db.query(`SELECT * FROM notifications WHERE notification_recipient = $1 AND notification_status = 'New' ORDER BY notification_date DESC`, [req.session.user.username])
        .then(async result => {
            if (result) {
                await db.query(`UPDATE notifications SET notification_status = 'Viewed' WHERE notification_recipient = $1`, [req.session.user.username]);

                resp.send({status: 'success', notifications: result.rows});
            }
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: '/api/get/user/notifications'});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    } else {
        resp.send('done');
    }
});

app.post('/api/get/payments', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query(`SELECT stripe_cust_id FROM users WHERE username = $1`, [req.session.user.username])

        stripe.customers.retrieve(user.rows[0].stripe_cust_id, (err, customer) => {
            if (err) {
                error.log({name: err.name, message: err.message, origin: 'Updating Stripe customer', url: req.url});
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            }

            resp.send({status: 'success', defaultSource: customer.default_source, payments: customer.sources.data});
        });
    }
})

module.exports = app;