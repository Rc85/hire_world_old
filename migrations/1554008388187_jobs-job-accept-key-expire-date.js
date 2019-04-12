exports.up = pgm => {
    pgm.addColumns('jobs', {
        job_accept_key_expire_date: {
            type: 'timestamp without time zone',
            default: pgm.func(`current_timestamp + interval '1' day`)
        }
    })
}