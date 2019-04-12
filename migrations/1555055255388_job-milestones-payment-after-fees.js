exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        milestone_payment_after_fees: {
            type: 'numeric'
        }
    })
}