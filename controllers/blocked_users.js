const db = require('../pg_conf');

module.exports = {
    retrieve: async(dbClient, user, filter, offset) => {
        if (!dbClient) dbClient = db;

        let filterValue = '';
        let filterString = '';

        if (filter && filter !== 'All') {
            if (filter === '#') {
                filterValue = '0-9';
            } else if (filter === '_') {
                filterValue = '_';
            } else if (filter === '-') {
                filterValue = '-';
            } else if (/[a-zA-Z]/.test(filter)) {
                filterValue = filter;
            }
            filterString = `AND blocked_users.blocked_user ~ '^[${filterValue}${filterValue.toLowerCase()}]'`;
        }

        let totalBlockedUsers = await dbClient.query(`SELECT COUNT(blocked_user_id) AS count FROM blocked_users
        WHERE blocking_user = $1
        ${filterString}
        OFFSET $2
        LIMIT 30`, [user, offset])
        .catch(err => {
            return err;
        });

        let blockedUsers = await dbClient.query(`SELECT blocked_user FROM blocked_users  
        WHERE blocking_user = $1
        ${filterString}
        ORDER BY blocking_user
        OFFSET $2
        LIMIT 30`, [user, offset])
        .then(result => {
            return result.rows;
        })
        .catch(err => {
            return err;
        });

        return {total: totalBlockedUsers, blocked_users: blockedUsers};
    }
}