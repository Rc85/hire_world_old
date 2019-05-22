exports.up = pgm => {
    pgm.dropColumns('referrals', 'is_eligible')
}