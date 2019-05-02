exports.up = pgm => {
    pgm.createTable('suspicious_activities', {
        sa_id: 'id',
        sa_source: {
            type: 'varchar',
            notNull: true
        },
        sa_details: {
            type: 'text'
        },
        sa_date: {
            type: 'timestamp with time zone',
            default: pgm.func('current_timestamp')
        },
        suspicious_user: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)',
            onDelete: 'cascade'
        },
        sa_status: {
            type: 'varchar',
            default: 'Active'
        },
        sa_severity: {
            type: 'int',
            notNull: true
        },
        sa_reference: {
            type: 'varchar',
            notNull: true
        }
    })
}