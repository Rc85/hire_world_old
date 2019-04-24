exports.up = pgm => {
    pgm.dropColumns('jobs', 'job_accept_key_expire_date')
}