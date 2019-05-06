exports.up = pgm => {
    pgm.createTable('subscriptions', {
        sub_id: 'id',
        subscription_id: {
            type: 'varchar',
            notNull: true
        },
        subscription_created_date: {
            type: 'timestamp with time zone'
        },
        subscription_end_date: {
            type: 'timestamp with time zone'
        },
        subscriber: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        }
    })
}