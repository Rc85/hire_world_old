exports.up = pgm => {
    pgm.renameColumn('jobs', 'job_offer_price', 'job_budget'),
    pgm.addColumns('jobs', {
        job_budget_currency: {
            type: 'varchar'
        }
    })
}