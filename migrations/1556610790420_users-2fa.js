exports.up = pgm => {
    pgm.addColumns('users', {
        'two_fa_key': {
            type: 'varchar'
        },
        'two_fa_enabled': {
            type: 'boolean',
            default: false
        }
    })
}