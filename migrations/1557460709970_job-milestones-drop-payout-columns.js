exports.up = pgm => {
    pgm.dropColumns('job_milestones', ['payout_amount', 'payout_arrival_date', 'payout_currency', 'payout_date', 'payout_destination', 'payout_fail_code', 'payout_fail_message', 'payout_status', 'payout_txn_id'])
}