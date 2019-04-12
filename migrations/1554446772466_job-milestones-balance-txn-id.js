exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        balance_txn_id: {
            type: 'varchar'
        }
    })
}