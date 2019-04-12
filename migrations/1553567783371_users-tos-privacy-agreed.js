exports.up = pgm => {
    pgm.addColumns('users', {
        tos_agreed: {
            type: 'boolean',
            default: false
        },
        privacy_agreed: {
            type: 'boolean',
            default: false
        }
    })
}