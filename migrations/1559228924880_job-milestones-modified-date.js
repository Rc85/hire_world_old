exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        milestone_modified_date: {
            type: 'timestamp with time zone'
        }
    })
}