exports.up = pgm => {
    pgm.createTable('saved_job_posts', {
        saved_id: 'id',
        saved_job_post_id: {
            type: 'int',
            references: 'job_postings (job_post_id)',
            notNull: true
        },
        saved_by: {
            type: 'varchar',
            references: 'users (username)',
            notNull: true
        },
        saved_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        }
    }),
    pgm.addConstraint('saved_job_posts', 'unique_saved_job_post', 'unique (saved_job_post_id, saved_by)')
}