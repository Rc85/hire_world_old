exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        have_files: {
            type: 'boolean',
            default: false
        }
    })
}