exports.up = pgm => {
    pgm.addColumns('reports', {
        report_filed_date: {
            type: 'timestamp with time zone'
        }
    }),
    pgm.addColumns('user_events', {
        event_created_date: {
            type: 'timestamp with time zone',
            default: pgm.func('current_timestamp')
        }
    }),
    pgm.dropColumns('users', ['privacy_agreed', 'tos_agreed']),
    pgm.addColumns('users', {
        privacy_agreed: {
            type: 'timestamp with time zone'
        },
        tos_agreed: {
            type: 'timestamp with time zone'
        }
    })
}