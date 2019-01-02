const app = require('express').Router();
const db = require('../db');

app.post('/api/admin/get/overview', async(req, resp) => {
    let userCount = await db.query(`SELECT COUNT(user_id) AS user_count FROM users WHERE user_level = 0`);
    let pendingUsers = await db.query(`SELECT COUNT(user_id) AS pending_users FROM users WHERE user_level = 0 AND user_status = 'Pending'`);
    let activeUsers = await db.query(`SELECT COUNT(user_id) AS active_users FROM users WHERE user_level = 0 AND user_status = 'Active'`);
    let normalUsers = await db.query(`SELECT COUNT(user_id) AS normal_users FROM users WHERE user_level = 0 AND account_type = 'User'`);
    let subscribedUsers = await db.query(`SELECT COUNT(user_id) AS subscribed_users FROM users WHERE user_level = 0 AND is_subscribed IS TRUE`);
    let suspendedUsers = await db.query(`SELECT COUNT(user_id) AS suspended_users FROM users WHERE user_level = 0 AND user_status = 'Suspend'`);
    let bannedUsers = await db.query(`SELECT COUNT(user_id) AS banned_users FROM users WHERE user_level = 0 AND user_status = 'Ban'`);

    let totalListings = await db.query(`SELECT COUNT(listing_id) AS total_listings FROM user_listings WHERE listing_status != 'Deleted'`);
    let activeListings = await db.query(`SELECT COUNT(listing_id) AS active_listings FROM user_listings WHERE listing_status = 'Active'`);
    let inactiveListings = await db.query(`SELECT COUNT(listing_id) AS inactive_listings FROM user_listings WHERE listing_status = 'Inactive'`);

    let totalJobs = await db.query(`SELECT COUNT(job_id) AS total_jobs FROM jobs`);
    let completedJobs = await db.query(`SELECT COUNT(job_id) AS completed_jobs FROM jobs WHERE job_stage = 'Completed'`);
    let abandonedJobs = await db.query(`SELECT COUNT(job_id) AS abandoned_jobs FROM jobs WHERE job_stage = 'Abandoned'`);
    let incompleteJobs = await db.query(`SELECT COUNT(job_id) AS incomplete_jobs FROM jobs WHERE job_stage = 'Incomplete'`);
    let activeJobs = await db.query(`SELECT COUNT(job_id) AS active_jobs FROM jobs WHERE job_stage = 'Active'`);

    let listingPerSector = await db.query(`SELECT * FROM sectors LEFT JOIN (SELECT COUNT(listing_id) AS listing_count, listing_sector FROM user_listings GROUP BY listing_sector) AS user_listings ON user_listings.listing_sector = sectors.sector WHERE sectors.sector_status != 'Delete';`)

    resp.send({status: 'success', userCount: userCount.rows[0], pendingUsers: pendingUsers.rows[0], activeUsers: activeUsers.rows[0], normalUsers: normalUsers.rows[0], subscribedUsers: subscribedUsers.rows[0], suspendedUsers: suspendedUsers.rows[0], bannedUsers: bannedUsers.rows[0], totalListings: totalListings.rows[0], activeListings: activeListings.rows[0], inactiveListings: inactiveListings.rows[0], totalJobs: totalJobs.rows[0], completedJobs: completedJobs.rows[0], abandonedJobs: abandonedJobs.rows[0], incompleteJobs: incompleteJobs.rows[0], activeJobs: activeJobs.rows[0], listingPerSector: listingPerSector.rows});
});

module.exports = app;