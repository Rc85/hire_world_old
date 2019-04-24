exports.up = pgm => {
    pgm.addColumns('job_milestones', {
        client_app_fee: {
            type: 'numeric',
            default: 0
        },
        user_app_fee: {
            type: 'numeric',
            default: 0
        },
        app_fee_id: {
            type: 'varchar'
        },
        payout_amount: {
            type: 'numeric',
            default: 0
        },
        payout_currency: {
            type: 'varchar'
        },
        payout_txn_id: {
            type: 'varchar'
        },
        payout_date: {
            type: 'timestamp without time zone'
        },
        payout_status: {
            type: 'varchar'
        },
        payout_fail_code: {
            type: 'varchar'
        },
        payout_fail_message: {
            type: 'text'
        },
        payout_destination: {
            type: 'varchar'
        },
        payout_arrival_date: {
            type: 'timestamp without time zone'
        }
    })
}