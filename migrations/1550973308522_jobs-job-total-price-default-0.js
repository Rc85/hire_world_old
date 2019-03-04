exports.up = pgm => {
    pgm.alterColumn('jobs', 'job_total_price', {
        default: 0
    })
}