exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        milestone_start_date: {
            type: 'timestamp without time zone'
        }
    })
}