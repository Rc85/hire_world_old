exports.up = pgm => {
    pgm.alterColumn('users', 'subscription_end_date', {
        default: null
    })
}