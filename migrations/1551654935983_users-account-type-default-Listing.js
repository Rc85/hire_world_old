exports.up = pgm => {
    pgm.alterColumn('users', 'account_type', {
        default: 'Listing',
    }),
    pgm.alterColumn('users', 'subscription_end_date', {
        default: '2020-01-01'
    })
}