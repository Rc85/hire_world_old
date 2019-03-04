exports.up = pgm => {
    pgm.alterColumn('users', 'account_type', {
        default: 'User'
    })
}