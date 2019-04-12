exports.up = pgm => {
    pgm.alterColumn('jobs', 'job_total_price', {
        type: 'money'
    }),
    pgm.alterColumn('job_milestones', 'milestone_payment_amount', {
        type: 'money'
    })
}