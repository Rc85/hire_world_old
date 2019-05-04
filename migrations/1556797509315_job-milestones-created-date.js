exports.up = pgm => {
    pgm.addColumns('jobs', {
        milestones_created_date: {
            type: 'timestamp with time zone'
        },
        milestones_modified_date: {
            type: 'timestamp with time zone'
        }
    })
}