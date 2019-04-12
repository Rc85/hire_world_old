exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        requested_payment_amount: {
            type: 'numeric'
        }
    })
}