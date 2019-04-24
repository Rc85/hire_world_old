exports.up = pgm => {
    pgm.alterColumn('job_milestones', 'milestone_fund_status', {
        default: 'pending'
    })
}