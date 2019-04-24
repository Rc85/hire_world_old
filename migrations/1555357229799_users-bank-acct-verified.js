exports.up = pgm => {
    pgm.addColumns('users', {
        bank_acct_verified: {
            type: 'boolean',
            default: false
        }
    })
}