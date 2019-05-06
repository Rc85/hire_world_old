exports.up = pgm => {
    pgm.addColumns('referrals', {
        is_eligible: {
            type: 'boolean',
            default: false
        },
        disqualified_reason: {
           type: 'varchar'
        }
    })
}