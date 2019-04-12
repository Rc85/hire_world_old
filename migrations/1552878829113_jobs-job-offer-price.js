exports.up = pgm => {
    pgm.addColumns('jobs', {
        job_offer_price: {
            type: 'money'
        }
    })
}