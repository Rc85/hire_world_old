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
            }

            resp.send({status: 'success', totalUsers: totalUsers.rows[0].user_count, users: result.rows});
        }
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/admin/user/change-status', (req, resp) => {
    let col, val;

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

    db.connect((err, client, done) => {
        if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

        (async() => {
            try {
                await client.query('BEGIN');

                let reason;

                if (req.body.reason) { reason = req.body.reason; }

                let permBanDate = new Date('9999-01-01T00:00:00');

                if (val === 'Ban') {
                    await client.query(`INSERT INTO user_bans (banned_user, banned_by, ban_reason, ban_type, ban_end_date) VALUES ($1, $2, $3, $4, $5)`, [req.body.username, req.session.user.username, reason, 'Permanent', permBanDate]);
                } else if (val === 'Suspend') {
                    let userBanCount = await client.query(`SELECT COUNT(ban_id) AS ban_count FROM user_bans WHERE banned_user = $1`, [req.body.username]);

                    let today = new Date();
                    let endDate = new Date();
                    endDate.setDate(today.getDate() + 7);
                    let banType = 'Temporary';

                    if (parseInt(userBanCount.rows[0].ban_count) === 1) {
                        endDate.setDate(today.getDate() + 30);
                    } else if (parseInt(userBanCount.rows[0].ban_count) === 2) {
                        endDate.setDate(today.getDate() + 90);
                    } else if (parseInt(userBanCount.rows[0].ban_count) >= 3) {
                        endDate = permBanDate;
                        banType = 'Permanent';
                        val = 'Ban';
                    }

                    await client.query(`INSERT INTO user_bans (banned_user, banned_by, ban_reason, ban_type, ban_end_date) VALUES ($1, $2, $3, $4, $5)`, [req.body.username, req.session.user.username, reason, banType, endDate]);
                } else if (val === 'User' || val === 'Moderator' || val === 'Admin') {
                    let message = `Role changed to ${val}`;

                    await client.query(`INSERT INTO notifications (notification_recipient, notification_message) VALUES ($1, $2)`, [req.body.username, message]);
                }

                let user = await client.query(`UPDATE users SET ${col} = $1 WHERE username = $2 RETURNING username, user_level, user_status, account_type, user_last_login`, [val, req.body.username]);

                await client.query('COMMIT')
                .then(() => resp.send({status: 'success', user: user.rows[0]}));
            } catch (e) {
                await client.query('ROLLBACK');
                ;
            } finally {
                done();
            }
        })()
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    });
});

app.post('/api/admin/user/warn', (req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

        (async() => {
            try {
                await client.query('BEGIN');
                await client.query('INSERT INTO user_warnings (warning, warned_by, warned_user) VALUES ($1, $2, $3)', [req.body.warning, req.session.user.username, req.body.user]);
                await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [req.body.user, 'You have been given a warning', 'Warning']);
                await client.query(`UPDATE reports SET report_status = $1 WHERE report_id = $2`, ['Warned', req.body.report_id]);
                await client.query('COMMIT')
                .then(() => resp.send({status: 'success', statusMessage: 'Warning sent'}));
            } catch (e) {
                await client.query('ROLLBACK');
                ;
            } finally {
                done();
            }
        })()
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    });
});

module.exports = app;