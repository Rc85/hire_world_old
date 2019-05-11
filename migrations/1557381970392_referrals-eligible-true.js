exports.up = pgm => {
    pgm.alterColumn('referrals', 'is_eligible', {
        default: true
    })
}