const db = require('../db');

module.exports = {
    session: {
        retrieve: async(client, id) => {
            if (!client) {
                client = db;
            }

            let user = await client.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
            LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
            LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
            LEFT JOIN user_listings ON users.username = user_listings.listing_user
            WHERE users.user_id = $1`, [id])
            
            if (user && user.rows.length === 1) {
                return user.rows[0];
            } else {
                return false;
            }
        }
    }
}