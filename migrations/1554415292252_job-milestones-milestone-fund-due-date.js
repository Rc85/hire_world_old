exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        milestone_fund_due_date: {
            type: 'timestamp without time zone'
        }
    })
}