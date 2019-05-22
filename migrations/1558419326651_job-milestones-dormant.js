exports.up = pgm => {
    pgm.alterColumn('job_milestones', 'milestone_status', {
        default: 'Dormant'
    })
}