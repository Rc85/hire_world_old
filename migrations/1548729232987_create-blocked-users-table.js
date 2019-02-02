exports.up = pgm => {
    pgm.createTable('blocked_users', {
        blocked_user_id: 'id',
        blocking_user: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)',
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        blocked_user: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)',
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        blocked_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        }
    }),
    pgm.addConstraint('blocked_users', 'unique_blocked_users', 'unique (blocking_user, blocked_user)')
}