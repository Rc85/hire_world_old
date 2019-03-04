exports.up = pgm => {
    pgm.alterColumn('jobs', 'job_total_price', {
        notNull: false
    })
}