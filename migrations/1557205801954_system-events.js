exports.up = pgm => {
    pgm.createTable('system_events', {
        event_id: 'id',
        event_name: {
            type: 'varchar',
            notNull: true
        },
        event_created_date: {
            type: 'timestamp with time zone',
            default: pgm.func('current_timestamp')
        },
        event_modified_date: {
            type: 'timestamp with time zone'
        },
        event_status: {
            type: 'varchar',
            default: 'Queued'
        },
        event_reference: {
            type: 'varchar',
            notNull: true
        }
    })
}