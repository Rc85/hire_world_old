exports.up = pgm => {
    pgm.addColumns('system_events', {
        event_execute_date: {
            type: 'timestamp with time zone'
        }
    })
}