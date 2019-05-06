exports.up = pgm => {
    pgm.addConstraint('referrals', 'unique_referrals', {
        unique: ['referer', 'referred_email']
    })
}