exports.up = pgm => {
    pgm.addColumn('users', {
        has_connected_bank_acct: {
            type: 'boolean',
            default: false
        }
    })
}