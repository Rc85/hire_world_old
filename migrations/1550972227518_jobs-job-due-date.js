exports.up = pgm => {
    pgm.addColumns('jobs', {
        job_due_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        }
    })
}