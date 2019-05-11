const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const controller = require('../utils/controller');
const authenticate = require('../utils/auth');

app.post('/api/get/user', async(req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        (async() => {
            try {
                await client.query('BEGIN');

                let user = await client.query(`SELECT
                    users.username,
                    users.user_email,
                    users.user_last_login,
                    users.link_work_acct_status,
                    user_profiles.*,
                    user_settings.hide_email,
                    user_settings.display_fullname,
                    user_settings.allow_messaging,
                    user_settings.display_business_hours,
                    user_listings.*,
                    subscriptions.subscription_end_date
                FROM users
                LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
                LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
                LEFT JOIN user_listings ON users.username = user_listings.listing_user
                LEFT JOIN subscriptions ON users.username = subscriptions.subscriber
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
                    
                    let reportedUser;
                    let userIsReported = false;
                    let businessHours = {};
                    let isFriend = false;
                    let isBlocked = false;
                    
                    if (user.rows[0].display_business_hours) {
                        businessHoursQuery = await client.query(`SELECT * FROM business_hours WHERE for_listing = $1`, [user.rows[0].listing_id]);
                        
                        if (businessHoursQuery.rows.length === 1) {
                            delete businessHoursQuery.rows[0].business_hour_id;
                            delete businessHoursQuery.rows[0].for_listing;
                            
                            businessHours = businessHoursQuery.rows[0];
                        }
                    }
                    
                    if (req.session.user) {
                        reportedUser = await client.query(`SELECT report_id FROM reports WHERE reporter = $1 AND report_type = $2 AND report_status = 'Pending' AND reported_content_link = $3`, [req.session.user.username, 'User Profile', req.body.url]);
                        isFriend = await client.query(`SELECT * FROM friends WHERE friend_user_1 = $1 AND friend_user_2 = $2`, [req.session.user.username, req.body.username]);
                        isBlocked = await client.query(`SELECT * FROM blocked_users WHERE blocking_user = $1 AND blocked_user = $2`, [req.session.user.username, req.body.username]);
                        
                        if (reportedUser && reportedUser.rows.length === 1) {
                            userIsReported = true;
                        }
                    }

                    let stats = await client.query(`SELECT
                        (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_status = 'Complete' AND (job_user = $1 OR job_client = $1)),
                        (SELECT COUNT(job_id) AS job_abandon FROM jobs WHERE job_status = 'Abandoned' AND job_user = $1),
                        (SELECT ROUND((CAST(SUM(review_rating) AS decimal) / COUNT(review_id))) AS rating FROM user_reviews WHERE reviewing = $1 AND review_rating IS NOT NULL),
                        (SELECT COUNT(review_id) AS job_count FROM user_reviews WHERE review IS NOT NULL AND reviewing = $1 AND review_status = 'Active'),
                        user_view_count.view_count,
                        users.user_last_login FROM users
                    LEFT JOIN user_reviews ON users.username = user_reviews.reviewing
                    LEFT JOIN user_view_count ON user_view_count.viewing_user = users.username
                    LEFT JOIN jobs ON jobs.job_id = user_reviews.review_job_id
                    WHERE username = $1
                    LIMIT 1;`, [req.body.username]);

                    let jobs = await client.query(`SELECT * FROM jobs WHERE job_user = $1 AND job_end_date IS NOT NULL AND job_status IN ('Completed', 'Abandoned') ORDER BY job_end_date DESC LIMIT 5`, [req.body.username]);

                    await client.query(`INSERT INTO user_view_count (viewing_user, view_count) VALUES ($1, $2) ON CONFLICT (viewing_user) DO UPDATE SET view_count = user_view_count.view_count + 1`, [req.body.username, 1]);

                    await client.query('COMMIT')
                    .then(() =>  resp.send({status: 'success', user: user.rows[0], stats: stats.rows[0], hours: businessHours, userReported: userIsReported, isFriend: isFriend && isFriend.rows.length === 1, jobs: jobs.rows, isBlocked: isBlocked && isBlocked.rows.length === 1}));
                }  else {
                    let error = new Error(`That listing does not exist`);
                    let errObj = {error: error, type: 'CUSTOM', status: 'access error', stack: error.stack}
                    throw errObj;
                }
            } catch (e) {
                await client.query('ROLLBACK');
                throw e
            } finally {
                done();
            }
        })()
        .catch(err => {
            error.log(err, req, resp);
        });
    });
});

app.post('/api/get/business_hours', authenticate, async(req, resp) => {
        await db.query(`SELECT monday, tuesday, wednesday, thursday, friday, saturday, sunday FROM business_hours WHERE for_listing = $1`, [req.body.id])
        .then(result => {
            if (result) resp.send({status: 'success', hours: result.rows[0]});
        })
        .catch(err => error.log(err, req, resp));
});

app.get('/api/get/user/notification-message-job-count', authenticate, async(req, resp) => {
        let deletedConversationsArray = [];
        let deletedConversations = await db.query(`SELECT deleted_convo FROM deleted_conversations WHERE convo_deleted_by = $1`, [req.session.user.username]);

        for (let conversation of deletedConversations.rows) {
            deletedConversationsArray.push(conversation.deleted_convo);
        }
        
        let notifications = await db.query(`SELECT COUNT(notification_id) AS notification_count FROM notifications WHERE notification_recipient = $1 AND notification_status = 'New'`, [req.session.user.username]);

        let messages = await db.query(`SELECT COUNT(message_id) AS message_count FROM messages 
        LEFT JOIN conversations ON conversation_id = message_conversation_id
        WHERE message_status = 'New'
        AND message_creator != $1
        AND (conversation_recipient = $1 OR conversation_starter = $1)
        AND NOT conversation_id = ANY($2)`, [req.session.user.username, deletedConversationsArray]);

        let proposalCount = await db.query(`SELECT COUNT(job_id) AS proposal_count FROM jobs WHERE job_user = $1 AND job_status = 'New'`, [req.session.user.username]);
        let jobMessageCount = await db.query(`SELECT 
            (
                SELECT COUNT(job_message_id) AS opened_job_message_count FROM job_messages
                LEFT JOIN jobs ON jobs.job_id = job_messages.job_message_parent_id
                WHERE job_message_status = 'New' AND job_status IN ('New', 'Open', 'Pending') AND job_message_creator != $1
            ),
            (
                SELECT COUNT(job_message_id) AS active_job_message_count FROM job_messages
                LEFT JOIN jobs ON jobs.job_id = job_messages.job_message_parent_id
                WHERE job_message_status = 'New' AND job_status IN ('Active', 'Requesting Payment') AND job_message_creator != $1
            )
        FROM job_messages`, [req.session.user.username]);

        if (jobMessageCount.rows.length === 0) {
            jobMessageCount.rows[0] = {
                opened_job_message_count: '0',
                active_job_message_count: '0',
            }
        }

        if (notifications && messages) {
            resp.send({status: 'success', notifications: notifications.rows[0].notification_count, messages: messages.rows[0].message_count, proposalCount: proposalCount.rows[0].proposal_count, jobMessageCount: jobMessageCount.rows[0]});
        } else {
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        }
});

app.post('/api/get/user/notifications', authenticate, async(req, resp) => {
        let queryString;

        if (req.body.new) {
            queryString = `SELECT * FROM notifications WHERE notification_recipient = $1 AND notification_status = 'New' ORDER BY notification_date DESC OFFSET $2`;
        } else {
            queryString = `SELECT * FROM notifications WHERE notification_recipient = $1 ORDER BY notification_date DESC OFFSET $2 LIMIT 20`;
        }

        await db.query(queryString, [req.session.user.username, req.body.offset])
        .then(async result => {
            if (result) {
                resp.send({status: 'success', notifications: result.rows});
            }
        })
        .catch(err => error.log(err, req, resp));
});

app.post('/api/get/user/payments', authenticate, async(req, resp) => {
    let user = await db.query(`SELECT stripe_id FROM users WHERE username = $1`, [req.session.user.username])

    if (user && user.rows[0].stripe_id) {
        await stripe.customers.retrieve(user.rows[0].stripe_id)
        .then(customer => {
            resp.send({status: 'success', defaultSource: customer.default_source, payments: customer.sources.data});
        })
        .catch(err => error.log(err, req, resp));
    } else {
        resp.send({status: 'success', payments: []});
    }
});

app.post('/api/get/user/subscription', authenticate, async(req, resp) => {
    let user = await db.query(`SELECT subscription_id FROM subscriptions WHERE subscriber = $1`, [req.session.user.username]);
    let plans = await stripe.plans.list();

    if (user && user.rows.length === 1) {
        if (user && user.rows[0].subscription_id) {
            subscription = await stripe.subscriptions.retrieve(user.rows[0].subscription_id)
            .then(subscription => {
                if (subscription) {
                    resp.send({status: 'success', plans: plans, subscription: subscription});
                }
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'success', plans: plans});
        }
    } else {
        resp.send({status: 'success', subscription: {}, plans: plans});
    }
});

app.post('/api/get/user/activities', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let notifications = [];
                    let activities = [];

                    let notificationCount = await client.query(`SELECT COUNT(notification_id) AS notification_count FROM notifications WHERE notification_recipient = $1`, [req.session.user.username]);
                    let activityCount = await client.query(`SELECT COUNT(activity_id) AS activity_count FROM activities WHERE activity_user = $1`, [req.session.user.username]);

                    if (req.body.request.type === 'all' || req.body.request.type === 'notifications') {
                        notifications = await client.query(`SELECT * FROM notifications WHERE notification_recipient = $1 ORDER BY notification_date DESC LIMIT 5 OFFSET $2`, [req.session.user.username, req.body.request.offset]);
                    }

                    if (req.body.request.type === 'all' || req.body.request.type === 'activities') {
                        activities = await client.query(`SELECT * FROM activities WHERE activity_user = $1 ORDER BY activity_date DESC LIMIT 5 OFFSET $2`, [req.session.user.username, req.body.request.offset]);
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', notifications: notifications.rows, activities: activities.rows, activityCount: activityCount.rows[0].activity_count, notificationCount: notificationCount.rows[0].notification_count}));
                    
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

app.post('/api/get/user/friends', authenticate, async(req, resp) => {
        let filterValue = '';
        let filterString = '';

        if (req.body.letter !== 'All') {
            if (req.body.letter === '#') {
                filterValue = '0-9';
            } else if (req.body.letter === '_') {
                filterValue = '_';
            } else if (req.body.letter === '-') {
                filterValue = '-';
            } else if (/[a-zA-Z]/.test(req.body.letter)) {
                filterValue = req.body.letter;
            }

            filterString = `AND friends.friend_user_2 ~ '^[${filterValue}${filterValue.toLowerCase()}]'`;
        }

        let totalFriends = await db.query(`SELECT COUNT(friend_id) AS friend_count FROM friends
        WHERE friend_user_1 = $1
        ${filterString}
        OFFSET $2
        LIMIT 30`, [req.session.user.username, req.body.offset]);

        await db.query(`SELECT friends.*, users.user_email, users.user_last_login, user_profiles.*, user_settings.hide_email, user_listings.listing_status, users.link_work_acct_status FROM friends
        LEFT JOIN users ON friends.friend_user_2 = users.username
        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
        LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
        LEFT JOIN user_listings ON friends.friend_user_2 = user_listings.listing_user
        WHERE friend_user_1 = $1
        ${filterString}
        ORDER BY friends.friend_user_2
        OFFSET $2
        LIMIT 30`, [req.session.user.username, req.body.offset])
        .then(result => {
            if (result) {
                for (let friend of result.rows) {
                    if (friend.hide_email) {
                        delete friend.user_email;
                    }

                    delete friend.hide_email;
                }

                resp.send({status: 'success', friends: result.rows, totalFriends: totalFriends.rows[0].friend_count});
            } else {
                resp.send({status: 'error', statusMessage: 'Failed to retrieve friends list'});
            }
        })
        .catch(err => error.log(err, req, resp));
});

app.post('/api/get/user/minimal', async(req, resp) => {
    await db.query(`SELECT users.username, users.user_email, us.hide_email, up.avatar_url, up.user_business_name, up.user_title, ul.listing_status,
        (SELECT COUNT(job_id) AS job_complete FROM jobs WHERE job_status = 'Complete' AND (job_user = $1 OR job_client = $1)),
        (SELECT COUNT(job_id) AS job_abandoned FROM jobs WHERE job_status = 'Abandoned' AND job_user = $1),
        (SELECT COUNT(friend_id) AS is_friend FROM friends WHERE friend_user_1 = $2 AND friend_user_2 = $1),
        (SELECT COUNT(blocked_user_id) AS is_blocked FROM blocked_users WHERE blocking_user = $2 AND blocked_user = $1)
    FROM users
    LEFT JOIN user_profiles AS up ON users.user_id = up.user_profile_id
    LEFT JOIN user_listings AS ul ON users.username = ul.listing_user
    LEFT JOIN user_settings AS us ON users.user_id = us.user_setting_id
    WHERE users.username = $1`, [req.body.user, req.session.user ? req.session.user.username : null])
    .then(result => {
        if (result && result.rows.length === 1) {
            if (result.rows[0].hide_email) {
                delete result.rows[0].user_email;
            }

            delete result.rows[0].hide_email;

            resp.send({status: 'success', user: result.rows[0]});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/get/user/blocked', authenticate, async(req, resp) => {
        await controller.blockedUsers.retrieve(req, (result) => {
            if (result.status === 'success') {
                resp.send({status: result.status, statusMessage: result.statusMessage, users: result.users, totalBlockedUsers: result.totalBlockedUsers});
            } else if (result.status === 'error') {
                error.log(result.error, req, resp);
            }
        });
});

app.post('/api/get/reviews', async(req, resp) => {
    let reviews = await db.query(`SELECT COUNT(review_id) AS count FROM user_reviews WHERE reviewing = $1`, [req.body.user]);

    let reports, reviewed, reviewSubmitted;

    if (req.session.user) {
        reviewed = await db.query(`SELECT review_id FROM user_reviews WHERE reviewing = $1`, [req.body.user]);
        
        let reviewIds = [];

        for (let row of reviewed.rows) {
            reviewIds.push(row.review_id);
        }

        reports = await db.query(`SELECT reported_content_link FROM reports WHERE reporter = $1 AND report_type = 'Review' AND report_status = 'Pending' AND reported_content_link = ANY($2)`, [req.session.user.username, reviewIds]);
    }
    
    let reportedReviews = [];
    
    if (reports && reviewed) {
        reviewSubmitted = reviewed.rows.length === 1;

        for (let report of reports.rows) {
            reportedReviews.push(report.reported_content_link);
        }
    }

    await db.query(`SELECT DISTINCT user_reviews.*, user_profiles.avatar_url, review_tokens.token_review_id FROM user_reviews
    LEFT JOIN users ON users.username = user_reviews.reviewer
    LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
    LEFT JOIN review_tokens ON review_tokens.token_review_id = user_reviews.review_id
    WHERE user_reviews.reviewing = $1 AND user_reviews.review IS NOT NULL AND user_reviews.review_status = 'Active'
    ORDER BY user_reviews.review_date DESC
    LIMIT 25
    OFFSET $2`, [req.body.user, req.body.offset])
    .then(result => {
        if (result) {
            resp.send({status: 'success', reviews: result.rows, totalReviews: reviews.rows[0].count, reportedReviews: reportedReviews, reviewSubmitted: reviewSubmitted});
        } else {
            resp.send({status: 'error', statusMessage: 'Fail to retrieve reviews'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/get/user/work', authenticate, async(req, resp) => {
    let jobs = await db.query(`SELECT COUNT(job_id) AS total_jobs FROM jobs WHERE job_user = $1`, [req.body.user]);

    await db.query(`SELECT * FROM jobs
    WHERE job_status IN ('Complete', 'Abandoned')
    AND job_user = $1
    ORDER BY job_created_date DESC
    LIMIT 5 OFFSET $2`, [req.body.user, req.body.offset])
    .then(result => {
        if (result) {
            resp.send({status: 'success', history: result.rows, total: jobs.rows[0].total_jobs});
        } else {
            resp.send({status: 'error'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

module.exports = app;