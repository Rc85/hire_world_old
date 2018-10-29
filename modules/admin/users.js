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

    console.log(req.body);

    if (req.body.username || req.body.status || req.body.level || req.body.type) {
        let blankCheck = /^\s*$/;

        if (req.body.username) {
            if (!blankCheck.test(req.body.username)) {
                params.push(`%${req.body.username}%`);
                totalUserParams.push(`%${req.body.username}%`);
                query.push(`username ILIKE $${params.length}`);
                totalUserQuery.push(`username ILIKE $${totalUserParams.length}`);
            } else {
                resp.send({status: 'error', statusMessage: 'Username cannot be blank'});
            }
        }

        if (req.body.status) {
            params.push(req.body.status);
            totalUserParams.push(req.body.status);
            query.push(`user_status = $${params.length}`);
            totalUserQuery.push(`user_status = $${totalUserParams.length}`);
        }

        if (req.body.level) {
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

        whereConditionString = ` AND ${query.join(' AND ')}`;
        totalUserWhereConditionString = ` AND ${totalUserQuery.join(' AND ')}`;
    }

    totalUserQueryString = `SELECT COUNT(user_id) as user_count FROM users WHERE username != 'roger85'${totalUserWhereConditionString}`;
    queryString = `SELECT * FROM users WHERE username != 'roger85'${whereConditionString} ORDER BY username LIMIT 25 OFFSET $1`;

    let totalUsers = await db.query(totalUserQueryString, totalUserParams);

    await db.query(queryString, params)
    .then(result => {
        if (result) {
            for (let user of result.rows) {
                delete user.user_id;
                delete user.user_password;
                delete user.user_this_login;
            }

            resp.send({status: 'success', totalUsers: totalUsers.rows[0].user_count, users: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/admin/user/change-status', async(req, resp) => {
    let col, val;
    console.log(req.body);

    if (req.body.column === 'Status') {
        col = 'user_status';
        val = req.body.val;
    } else if (req.body.column === 'Level') {
        col = 'user_level';

        if (req.body.val === 'User') {
            val = 0;
        } else if (req.body.val === 'Moderator') {
            val = 79;
        } else if (req.body.val === 'Admin') {
            val = 89;
        }
    } else if (req.body.column === 'Account') {
        col = 'account_type';
        val = req.body.val;
    }

    await db.query(`UPDATE users SET ${col} = $1 WHERE username = $2 RETURNING username, user_level, user_status, account_type, user_last_login`, [val, req.body.username])
    .then(result => {
        if (result) resp.send({status: 'success', user: result.rows[0]});
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;