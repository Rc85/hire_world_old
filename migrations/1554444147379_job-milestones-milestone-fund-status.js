exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        milestone_fund_status: {
            type: 'varchar',
            default: 'Pending'
        }
    })
}