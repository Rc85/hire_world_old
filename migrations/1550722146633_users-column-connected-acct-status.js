exports.up = pgm => {
    pgm.addColumns('users', {
        connected_acct_status: {
            type: 'varchar',
            default: 'Reviewing'
        }
    })
}