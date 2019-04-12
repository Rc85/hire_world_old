exports.up = pgm => {
    pgm.addColumns('jobs', {
        client_job_terms_agreed: {
            type: 'boolean',
            default: false
        },
        user_job_terms_agreed: {
            type: 'boolean',
            default: false
        },
        job_modified_date: {
            type: 'timestamp without time zone'
        }
    }),
    pgm.addColumns('job_milestones', {
        milestone_completed_date: {
            type: 'timestamp without time zone'
        }
    }),
    pgm.addColumns('milestone_conditions', {
        condition_completed_date: {
            type: 'timestamp without time zone'
        }
    }),
    pgm.createTable('ip_address_log', {
        ip_log_id: 'id',
        ip_user: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        },
        ip_address: {
            type: 'varchar',
            notNull: true
        },
        ip_logged_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        },
        log_reference: {
            type: 'varchar',
            notNull: true
        }
    })
}