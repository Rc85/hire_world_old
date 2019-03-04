exports.up = pgm => {
    pgm.renameColumn('jobs', 'job_offered_date', 'job_created_date')
}