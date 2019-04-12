exports.up = pgm => {
    pgm.alterColumn('jobs', 'job_total_price', {
        type: 'decimal'
    }),
    pgm.alterColumn('job_milestones', 'milestone_payment_amount', {
        type: 'decimal'
    }),
    pgm.alterColumn('jobs', 'job_offer_price', {
        type: 'decimal'
    })
}