exports.up = pgm => {
    pgm.createTable('review_tokens', {
        token_id: 'id',
        token: {
            type: 'varchar',
            notNull: true
        },
        token_job_id: {
            type: 'int',
            notNull: true,
            references: 'jobs (job_id)'
        },
        token_review_id: {
            type: 'int',
            notNull: true,
            references: 'user_reviews (review_id)'
        },
        token_status: {
            type: 'varchar',
            default: 'Valid'
        },
        token_created_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        },
        token_used_date: {
            type: 'timestamp without time zone'
        }
    }),
    pgm.dropColumns('user_reviews', ['token_status', 'review_token'])
}