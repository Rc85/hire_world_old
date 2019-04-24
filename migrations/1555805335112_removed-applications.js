exports.up = pgm => {
    pgm.createTable('removed_applications', {
        removed_id: 'id',
        removed_application_id: {
            type: 'int',
            notNull: true,
            references: 'job_post_applications (application_id)'
        },
        removed_by: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        },
        removed_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        }
    })
}