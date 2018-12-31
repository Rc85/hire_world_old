const db = require('../db');

module.exports = {
    session: {
        retrieve: async(id) => {
            let user = await db.query(`SELECT users.username, users.user_email, users.account_type, users.user_status, users.is_subscribed, users.plan_id, users.user_last_login, users.user_level, users.subscription_end_date, user_profiles.*, user_settings.*, user_listings.listing_status FROM users
            LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
            LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
            LEFT JOIN user_listings ON users.username = user_listings.listing_user
            WHERE users.user_id = $1`, [id]);
            
            if (user && user.rows.length === 1) {
                delete user.rows[0].user_profile_id;
                delete user.rows[0].user_setting_id;

                if (user.rows[0].hide_email) {
                    delete user.rows[0].user_email;
                }

                if (!user.rows[0].display_fullname) {
                    delete user.rows[0].user_firstname;
                    delete user.rows[0].user_lastname;
                }

                return user.rows[0];
            } else {
                return false;
            }
        }
    }
}