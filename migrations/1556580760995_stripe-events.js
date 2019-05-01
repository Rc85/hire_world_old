exports.up = pgm => {
    pgm.createTable('stripe_events', {
        event_id: {
            type: 'varchar',
            notNull: true,
            unique: true
        },
        event_created_date: {
            type: 'timestamp with time zone',
            notNull: true
        },
        event_status: {
            type: 'varchar'
        }
    })
}