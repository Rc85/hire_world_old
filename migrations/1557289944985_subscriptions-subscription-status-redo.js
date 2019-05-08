exports.up = pgm => {
    pgm.dropColumn('subscriptions', 'subscription_status'),
    pgm.addColumns('subscriptions', {
        is_subscribed: {
            type: 'boolean',
            default: true
        }
    })
}