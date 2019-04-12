exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        charge_id: {
            type: 'varchar'
        }
    })
}