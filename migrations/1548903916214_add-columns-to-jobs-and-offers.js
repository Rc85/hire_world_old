exports.up = pgm => {
    pgm.addColumn('jobs', {
        job_end_date: {
            type: 'timestamp without time zone'
        }
    }),
    pgm.addColumn('offers', {
        offer_accepted_date: {
            type: 'timestamp without time zone'
        }
    })
}