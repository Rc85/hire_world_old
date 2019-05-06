exports.up = pgm => {
    pgm.alterColumn('users', 'privacy_agreed', {
        default: pgm.func('current_timestamp')
    }),
    pgm.alterColumn('users', 'tos_agreed', {
        default: pgm.func('current_timestamp')
    })
}