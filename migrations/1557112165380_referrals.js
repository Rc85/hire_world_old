exports.up = pgm => {
    pgm.createTable('referrals', {
        referral_id: 'id',
        referer: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        },
        referred_email: {
            type: 'varchar',
            notNull: true
        },
        referral_created_date: {
            type: 'timestamp with time zone',
            default: pgm.func('current_timestamp')
        },
        referral_accepted_date: {
            type: 'timestamp with time zone'
        },
        referral_status: {
            type: 'varchar',
            default: 'Active'
        },
        referral_key: {
            type: 'varchar',
            notNull: true
        }
    })
}