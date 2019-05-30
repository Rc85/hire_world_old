const db = require('../pg_conf');

module.exports = {
    session: {
        retrieve: async(dbClient, id) => {
            if (!dbClient) {
                dbClient = db;
            }

            let user = await dbClient.query(`SELECT
                users.username,
                users.user_email,
                users.user_status,
                users.user_this_login,
                users.user_level,
                users.link_work_acct_status,
                users.link_work_id,
                users.two_fa_enabled,
                user_profiles.*,
                user_settings.*,
                user_listings.listing_status
            FROM users
            LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
            LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
            LEFT JOIN user_listings ON users.username = user_listings.listing_user
            LEFT JOIN subscriptions ON users.username = subscriptions.subscriber
            WHERE users.user_id = $1`, [id])
            .then(result => {
                if (result && result.rows.length === 1) {
                    return result.rows[0];
                } else {
                    return false;
                }
            })
            .catch(err => {
                return err;
            });

            return user;
        }
    },
}