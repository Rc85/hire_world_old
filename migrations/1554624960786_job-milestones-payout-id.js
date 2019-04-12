exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        payout_id: {
            type: 'varchar'
        }
    })
}