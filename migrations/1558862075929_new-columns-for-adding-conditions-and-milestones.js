exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        milestone_creator: {
            type: 'varchar'
        },
        milestone_sequence: {
            type: 'int'
        }
    }),
    pgm.addColumns('milestone_conditions', {
        condition_creator: {
            type: 'varchar'
        },
        condition_created_date: {
            type: 'timestamp with time zone',
            default: pgm.func('current_timestamp')
        }
    }),
    pgm.alterColumn('job_milestones', 'milestone_payment_amount', {
        notNull: true,
        default: 0
    })
}