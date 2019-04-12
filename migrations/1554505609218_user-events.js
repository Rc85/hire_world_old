exports.up = pgm => {
    pgm.createTable('user_events', {
        event_id: 'id',
        event_name: {
            type: 'varchar',
            notNull: true
        },
        event_date: {
            type: 'timestamp without time zone'
        },
        event_owner: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        },
        event_type: {
            type: 'varchar'
        },
        event_reference_id: {
            type: 'int'
        }
    })
}