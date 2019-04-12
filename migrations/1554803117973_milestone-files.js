exports.up = pgm => {
    pgm.createTable('milestone_files', {
        file_id: 'id',
        file_hash: {
            type: 'varchar',
            notNull: true
        },
        file_uploaded_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        },
        file_owner: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        },
        file_milestone_id: {
            type: 'int',
            notNull: true,
            references: 'job_milestones (milestone_id)'
        },
        filesize: {
            type: 'int'
        },
        filename: {
            type: 'varchar'
        }
    })
}