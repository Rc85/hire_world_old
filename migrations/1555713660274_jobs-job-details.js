exports.up = pgm => {
    pgm.addColumns('jobs', {
        job_details: {
            type: 'text'
        }
    })
}