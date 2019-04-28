exports.up = pgm => {
    pgm.createTable('reset_passwords', {
        reset_pw_id: 'id',
        reset_user: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)',
            unique: true
        },
        reset_key: {
            type: 'varchar',
            notNull: true,
            unique: true
        },
        reset_expires: {
            type: 'timestamp without time zone',
            default: pgm.func(`current_timestamp + interval '1 day'`)
        }
    })
}