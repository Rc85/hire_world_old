exports.up = pgm => {
    pgm.db.query(`INSERT INTO subscriptions (subscription_id, subscription_end_date, subscriber) SELECT subscription_id, subscription_end_date, username FROM users WHERE subscription_id IS NOT NULL`)
}