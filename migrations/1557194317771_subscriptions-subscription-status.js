exports.up = pgm => {
    pgm.dropConstraint('subscriptions', 'unique_subscription_id'),
    pgm.addConstraint('subscriptions', 'unique_user_subscription', 'unique (subscription_id, subscriber)'),
    pgm.addColumns('subscriptions', {
        subscription_status: {
            type: 'varchar',
            default: 'Active'
        }
    })
}