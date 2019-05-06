exports.up = pgm => {
    pgm.dropColumns('users', ['subscription_id', 'is_subscribed', 'plan_id', 'subscription_end_date'])
}