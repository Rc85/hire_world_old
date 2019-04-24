exports.up = pgm => {
    pgm.createTable('job_postings', {
        job_post_id: 'id',
        job_post_title: {
            type: 'varchar',
            notNull: true
        },
        job_post_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        },
        job_post_modified_date: {
            type: 'timestamp without time zone'
        },
        job_post_user: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        },
        job_post_sector: {
            type: 'varchar',
            notNull: true,
            references: 'sectors (sector)'
        },
        job_post_status: {
            type: 'varchar',
            default: 'Active'
        },
        job_post_details: {
            type: 'text'
        },
        job_post_payment_type: {
            type: 'varchar'
        },
        job_post_budget: {
            type: 'numeric',
            default: 0
        },
        job_post_budget_end: {
            type: 'numieric',
        },
        job_post_budget_currency: {
            type: 'varchar'
        },
        job_post_budget_threshold: {
            type: 'varchar',
        },
        job_post_as_user: {
            type: 'boolean',
            default: true
        },
        job_is_local: {
            type: 'boolean',
            default: false
        },
        job_is_remote: {
            type: 'boolean',
            default: false
        },
        job_is_online: {
            type: 'boolean',
            default: false
        },
        job_post_company: {
            type: 'varchar'
        },
        job_post_company_website: {
            type: 'varchar'
        },
        job_post_country: {
            type: 'varchar'
        },
        job_post_region: {
            type: 'varchar'
        },
        job_post_city: {
            type: 'varchar'
        },
        job_post_notification: {
            type: 'boolean',
            default: false
        },
        job_post_position_num: {
            type: 'int',
            default: 1
        },
        job_post_closing_date: {
            type: 'timestamp without time zone'
        },
        job_post_type: {
            type: 'varchar'
        },
        job_post_expiration_date: {
            type: 'timestamp without time zone'
        }
    })
}