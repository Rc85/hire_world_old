exports.up = pgm => {
    pgm.addColumns('subscriptions', {
        subscription_name: {
            type: 'varchar',
            default: 'Link Work'
        }
    }),
    pgm.alterColumn('subscriptions', 'subscription_name', {
        default: null
    })
}