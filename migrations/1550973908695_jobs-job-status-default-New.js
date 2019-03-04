exports.up = pgm => {
    pgm.alterColumn('jobs', 'job_status', {
        default: 'New'
    })
}