exports.up = pgm => {
    pgm.alterColumn('job_milestones', 'payout_status', {
        default: 'pending'
    })
}