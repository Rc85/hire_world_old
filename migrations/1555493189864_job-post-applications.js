exports.up = pgm => {
    pgm.createTable('job_post_applications', {
        application_id: 'id',
        applicant: {
            type: 'varchar',
            references: 'users (username)',
            notNull: true
        },
        applied_job_post_id: {
            type: 'int',
            references: 'job_postings (job_post_id)',
            notNull: true
        },
        applied_date: {
            type: 'timestamp',
            default: pgm.func('current_timestamp')
        },
        application_status: {
            type: 'varchar',
            default: 'Reviewing'
        },
        application_details: {
            type: 'text'
        },
        application_notification: {
            type: 'boolean',
            default: false
        }
    })
}