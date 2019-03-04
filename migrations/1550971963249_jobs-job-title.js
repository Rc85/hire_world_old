exports.up = pgm => {
    pgm.addColumns('jobs', {
        job_title: {
            type: 'varchar',
            notNull: true
        }
    })
}