const app = require('express').Router();
const db = require('../db');

app.post('/api/admin/get/users', async(req, resp) => {
    let userLevel, totalUserQueryString, queryString;
    let query = [];
    let totalUserQuery = [];
    let params = [req.body.offset];
    let totalUserParams = [];
    let whereConditionString = '';
    let totalUserWhereConditionString = '';

    if (req.body.username || req.body.status || req.body.level || req.body.type) {
        if (req.body.username) {
            params.push(`%${req.body.username}%`);
            totalUserParams.push(`%${req.body.username}%`);
            query.push(`username ILIKE $${params.length}`);
            totalUserQuery.push(`username ILIKE $${totalUserParams.length}`);
        }

        if (req.body.status) {
            params.push(req.body.status);
            totalUserParams.push(req.body.status);
            query.push(`user_status = $${params.length}`);
            totalUserQuery.push(`user_status = $${totalUserParams.length}`);
        }

        if (req.body.level > 0 && req.body.level < 90) {
            if (req.body.level === 'User') {
                userLevel = 10;
            } else if (req.body.level === 'Moderator') {
                userLevel = 80;
            } else if (req.body.level === 'Admin') {
                userLevel = 90;
            }

            params.push(userLevel);
            totalUserParams.push(userLevel);
            query.push(`(user_level BETWEEN ($${params.length} - 10) AND $${params.length})`);
            totalUserQuery.push(`(user_level BETWEEN ($${totalUserParams.length} - 10) AND $${totalUserParams.length})`);
        }

        if (req.body.type) {
            params.push(req.body.type);
            totalUserParams.push(req.body.type);
            query.push(`account_type = $${params.length}`);
            totalUserQuery.push(`account_type = $${totalUserParams.length}`);
        }

        whereConditionString = ` WHERE ${query.join(' AND ')}`;
        totalUserWhereConditionString = ` WHERE ${totalUserQuery.join(' AND ')}`;
    }

    totalUserQueryString = `SELECT COUNT(user_id) as user_count FROM users${totalUserWhereConditionString}`;
    queryString = `SELECT * FROM users${whereConditionString} ORDER BY username LIMIT 25 OFFSET $1`;

    let totalUsers = await db.query(totalUserQueryString, totalUserParams);

    await db.query(queryString, params)
    .then(result => {
        if (result)  resp.send({status: 'success', totalUsers: totalUsers.rows[0].user_count, users: result.rows});
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;