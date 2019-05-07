exports.up = pgm => {
    pgm.alterColumn('jobs', 'job_price_currency', {
        notNull: false
    })
}