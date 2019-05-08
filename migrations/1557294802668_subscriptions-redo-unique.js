exports.up = pgm => {
    pgm.dropConstraint('subscriptions', 'unique_user_subscription'),
    pgm.addConstraint('subscriptions', 'unique_user_subscription', 'unique (subscriber, subscription_name)')
}