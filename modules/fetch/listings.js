const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const validate = require('../utils/validate');
const authenticate = require('../utils/auth');

app.post('/api/get/listing', authenticate, async(req, resp) => {
        await db.query(`SELECT user_listings.*, users.link_work_acct_status FROM user_listings
        LEFT JOIN users ON users.username = user_listings.listing_user
        WHERE listing_user = $1 AND listing_status != 'Delete'`, [req.session.user.username])
        .then(result => {
            let listing;

            if (result && result.rows.length > 0) {
                listing = result.rows[0];
            }

            resp.send({status: 'success', listing: listing});
        })
        .catch(err => error.log(err, req, resp));
});

app.post('/api/get/listings', async(req, resp) => {
    let orderBy = '';
    let limit = '';
    let offset = '';

    if (req.body.type === 'profiles') {
        // Never build/concatenate query string from req.body
        let whereArray = [];
        let params = [];
        let havingArray = [];

        if (req.body.recent) {
            orderBy = `listing_created_date DESC`;
            limit = `LIMIT 5`;
        } else {
            whereArray = [`listing_sector = $1`];
            params = [req.body.sector];
            orderBy = `listing_renewed_date DESC`;
            limit = 'LIMIT 25';
        
            if (req.body.filter) {
                if (req.body.filter.title && validate.searchUserTitleCheck.test(req.body.filter.title)) {
                    params.push(`%${req.body.filter.title}%`);
                    whereArray.push(`user_title ILIKE $${params.length}`);
                }

                if (req.body.filter.rating !== 'Any') {
                    params.push(req.body.filter.rating);
                    whereArray.push(`rating = $${params.length}`);
                }

                if (req.body.filter.price) {
                    params.push(req.body.filter.price);

                    let priceOperator, priceType;

                    let priceTypeOperator = '=';

                    // Building operators to prevent SQL injection
                    if (req.body.filter.priceOperator === '=') {
                        priceOperator = '=';
                    } else if (req.body.filter.priceOperator === '>') {
                        priceOperator = '>';
                    } else if (req.body.filter.priceOperator === '<') {
                        priceOperator = '<';
                    }

                    // Building operators to prevent SQL injection
                    if (req.body.filter.priceType === 'Hour') {
                        priceType = 'Hourly';
                    } else if (req.body.filter.priceType === 'Bi-weekly') {
                        priceType = 'Bi-weekly';
                    } else if (req.body.filter.priceType === 'Monthly') {
                        priceType = 'Monthly';
                    } else if (req.body.filter.priceType === 'Per Delivery') {
                        priceType = 'Per Delivery';
                    } else if (req.body.filter.priceType === 'One Time Payment') {
                        priceType = 'One Time Payment';
                    } else if (!req.body.filter.priceType) {
                        priceTypeOperator = 'SIMILAR TO';
                        priceType = '(Hourly|Bi-weekly|Monthly|Per Delivery|One Time Payment)';
                    }

                    whereArray.push(`listing_price ${priceOperator} $${params.length}`);
                    whereArray.push(`listing_price_type ${priceTypeOperator} '${priceType}'`);
                }

                if (req.body.filter.completedJobs) {
                    let operator;

                    // Building operators to prevent SQL injection
                    if (req.body.filter.completedJobsOp === '=') {
                        operator = '=';
                    } else if (req.body.filter.completedJobsOp === '>=') {
                        operator = '>=';
                    } else if (req.body.filter.completedJobsOp === '>') {
                        operator = '>';
                    } else if (req.body.filter.completedJobsOp === '<=') {
                        operator = '<=';
                    } else if (req.body.filter.completedJobsOp === '<') {
                        operator = '<';
                    }

                    params.push(req.body.filter.completedJobs);

                    whereArray.push(`job_complete ${operator} $${params.length}`);
                }

                if (req.body.filter.noAbandonedJobs) {
                    params.push('0');
                    whereArray.push(`(job_abandoned = $${params.length} OR job_abandoned IS NULL)`);
                }

                if (req.body.filter.country) {
                    params.push(req.body.filter.country);
                    whereArray.push(`user_country = $${params.length}`);
                }

                if (req.body.filter.region) {
                    params.push(req.body.filter.region);
                    whereArray.push(`user_region = $${params.length}`);
                }

                if (req.body.filter.city) {
                    params.push(req.body.filter.city);
                    whereArray.push(`user_city = $${params.length}`);
                }

                if (req.body.filter.isLinked) {
                    params.push(null);
                    whereArray.push(`link_work_id IS NOT $${params.length} AND subscriptions.subscription_end_date >= current_timestamp`);
                }

                if (req.body.filter.haveReviews) {
                    havingArray.push(`COUNT(user_reviews.reviewing) > 0`);
                }
            }
        }

        if (req.body.offset) {
            params.push(req.body.offset);    
            offset = `OFFSET $${params.length}`;
        }

        let totalListings = await db.query(`SELECT COUNT(listing_id) AS count FROM user_listings WHERE listing_sector = $1`, [req.body.sector]);

        let query = `SELECT
            user_listings.*, 
            user_profiles.user_title, 
            user_reviews.rating, 
            user_reviews.review_count, 
            jobs.job_complete,
            jobs.job_abandoned,
            user_profiles.avatar_url, 
            users.link_work_acct_status,
            subscriptions.subscription_end_date
        FROM user_listings
        LEFT JOIN users ON users.username = user_listings.listing_user
        LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
        LEFT JOIN subscriptions ON users.username = subscriptions.subscriber
        LEFT JOIN (
            SELECT reviewing, SUM(review_rating) / COUNT(review_id) AS rating, COUNT(review_id) AS review_count
            FROM user_reviews
            WHERE review_rating IS NOT NULL
            GROUP BY reviewing
        ) AS user_reviews
        ON user_reviews.reviewing = user_listings.listing_user
        LEFT JOIN (
            SELECT job_user, (
                SELECT COUNT(job_id) AS job_complete FROM jobs
                WHERE job_status = 'Complete'
                GROUP BY job_user LIMIT 1
            ), (
                SELECT COUNT(job_id) AS job_abandoned FROM jobs
                WHERE job_status = 'Abandoned'
                GROUP BY job_user LIMIT 1
            )
            FROM jobs LIMIT 1
        ) AS jobs
        ON jobs.job_user = user_listings.listing_user
        WHERE ${whereArray.join(' AND ')}${whereArray.length > 0 ? ` AND ` : ' '}listing_status = 'Active'
        ${havingArray.length > 0 ? `GROUP BY 
            user_listings.listing_id, 
            user_profiles.user_title, 
            user_reviews.rating, 
            user_reviews.review_count, 
            jobs.job_complete, 
            jobs.job_abandoned,
            user_profiles.avatar_url,
            users.link_work_acct_status` : ''}
        ${havingArray.length > 0 ? `HAVING ${havingArray.join(' AND ')}` : ''}
        ORDER BY ${orderBy}, listing_id
        ${limit} ${offset}`;
        
        await db.query(query, params)
        .then(result => {
            if (result) {
                for (let row of result.rows) {
                    if (!row.job_complete) {
                        row.job_complete = 0;
                    }
                }

                resp.send({status: 'success', listings: result.rows, totalListings: totalListings.rows[0].count});
            }
        })
        .catch(err => error.log(err, req, resp));
    } else if (req.body.type === 'jobs') {
        let whereArray = [`job_post_sector = $1`];
        let orderBy = 'ORDER BY job_post_date DESC';
        let limit = 'LIMIT 25';
        let offset = '';
        let params = [req.body.sector];

        if (req.body.recent) {
            orderBy = `job_post_created_date DESC`;
            limit = `LIMIT 25`;
        } else {
            params = [req.body.sector];

            if (req.body.filter) {
                if (req.body.filter.title) {
                    params.push(`%${ req.body.filter.title}%`)
                    whereArray.push(`job_post_title ILIKE $${params.length}`)
                }

                if (req.body.filter.local) {
                    params.push(req.body.filter.local);
                    whereArray.push(`job_is_local = $${params.length}`);
                }

                if (req.body.filter.remote) {
                    params.push(req.body.filter.remote);
                    whereArray.push(`job_is_remote = $${params.length}`);
                }

                if (req.body.filter.online) {
                    params.push(req.body.filter.online);
                    whereArray.push(`job_is_online = $${params.length}`);
                }

                if ( req.body.filter.type) {
                    params.push( req.body.filter.type);
                    whereArray.push(`job_post_type = $${params.length}`);
                }

                if ( req.body.filter.payment) {
                    params.push( req.body.filter.payment);
                    whereArray.push(`job_post_payment_type = $${params.length}`);
                }

                if ( req.body.filter.threshold) {
                    params.push( req.body.filter.threshold);
                    whereArray.push(`job_post_budget_threshold = $${params.length}`);
                }

                if ( req.body.filter.paymentStart) {
                    params.push( req.body.filter.paymentStart);
                    whereArray.push(`job_post_budget = $${params.length}`);
                }

                if ( req.body.filter.paymentEnd) {
                    params.push( req.body.filter.paymentEnd);
                    whereArray.push(`job_post_budget_end = $${params.length}`);
                }

                if ( req.body.filter.companyOnly) {
                    whereArray.push(`job_post_company IS NOT NULL`);

                    params.push(false);
                    whereArray.push(`job_post_as_user = $${params.length}`);
                }

                if ( req.body.filter.country) {
                    params.push( req.body.filter.country);
                    whereArray.push(`job_post_country = $${params.length}`);
                }

                if ( req.body.filter.region) {
                    params.push( req.body.filter.region);
                    whereArray.push(`job_post_region = $${params.length}`);
                }

                if ( req.body.filter.city) {
                    params.push( req.body.filter.city);
                    whereArray.push(`job_post_city = $${params.length}`);
                }
            }
        }

        if (req.body.offset) {
            params.push(req.body.offset);
    
            offset = `OFFSET $${params.length}`;
        }

        let totalListings = await db.query(`SELECT COUNT(job_post_id) AS count FROM job_postings WHERE job_post_sector = $1`, [req.body.sector]);
        
        let query = `SELECT * FROM job_postings
        LEFT JOIN (
            SELECT applied_job_post_id, COUNT(application_id) AS application_count FROM job_post_applications
            GROUP BY applied_job_post_id
        ) AS at ON at.applied_job_post_id = job_postings.job_post_id
        WHERE ${whereArray.join(' AND ')}
        AND job_post_status = 'Active'
        AND job_post_expiration_date > current_timestamp
        ${orderBy}
        ${limit}
        ${offset}`;

        await db.query(query, params)
        .then(result => {
            if (result) {
                for (let row of result.rows) {
                    if (!row.application_count) {
                        row.application_count = 0;
                    }
                }

                resp.send({status: 'success', listings: result.rows, totalListings: totalListings.rows[0].count});
            }
        })
        .catch(err => error.log(err, req, resp));
    }
});

app.post('/api/get/listing/detail', async(req, resp) => {
    await db.query(`SELECT users.user_email, user_listings.*, user_settings.*, user_profiles.* FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    WHERE listing_id = $1 AND listing_status = 'Active'`, [req.body.id])
    .then(async(result) => {
        if (result !== undefined && result.rows.length === 1) {
            let saved = false;
            let reported = false;

            let savedListing, reportedListing;

            if (result.rows[0].hide_email) {
                delete result.rows[0].user_email;
            }

            if (result.rows[0].hide_phone) {
                delete result.rows[0].user_phone;
            }
            
            if (req.session.user) {
                savedListing = await db.query(`SELECT saved_listing_id FROM saved_listings WHERE saved_listing_id = $1 AND saved_by = $2`, [req.body.id, req.session.user.username]);
                reportedListing = await db.query(`SELECT report_id FROM reports WHERE reporter = $1 AND report_type = $2 AND reported_id = $3`, [req.session.user.username, 'Listing', req.body.id]);
            }

            let userRating = await db.query(`SELECT 
                CASE WHEN
                    SUM(review_rating) / COUNT(review_id) IS NULL THEN 0 ELSE SUM(review_rating) / COUNT(review_id) END
                AS rating
            FROM user_reviews LEFT JOIN user_listings ON user_listings.listing_user = user_reviews.reviewing WHERE user_listings.listing_id = $1`, [req.body.id]);

            if (savedListing && savedListing.rows.length === 1)  saved = true;

            if (reportedListing && reportedListing.rows.length === 1) reported = true;

            resp.send({status: 'success', listing: result.rows[0], saved: saved, reported: reported, rating: userRating.rows[0].rating});
        } else {
            resp.send({status: 'access error', statusMessage: 'That listing does not exist'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/get/saved_listings', async(req, resp) => {
    await db.query(`SELECT user_listings.*, user_profiles.user_title, user_reviews.rating, saved_listings.saved_id FROM user_listings
    LEFT JOIN users ON users.username = user_listings.listing_user
    LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
    LEFT JOIN
        (SELECT (SUM(review_rating) / COUNT(review_id)) AS rating, reviewing FROM user_reviews GROUP BY reviewing) AS user_reviews
    ON user_reviews.reviewing = user_listings.listing_user
    LEFT JOIN saved_listings ON saved_listings.saved_listing_id = user_listings.listing_id
    WHERE listing_status = 'Active' AND saved_listings.saved_by = $1
    ORDER BY saved_listings.saved_date DESC, listing_id`, [req.session.user.username])
    .then(result => {
        if (result) {
            resp.send({status: 'success', listings: result.rows});
        }
    })
    .catch(err => error.log(err, req, resp));
});

module.exports = app;