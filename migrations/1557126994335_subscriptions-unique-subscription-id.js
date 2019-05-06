exports.up = pgm => {
    pgm.addConstraint('subscriptions', 'unique_subscription_id', 'unique (subscription_id)')
}