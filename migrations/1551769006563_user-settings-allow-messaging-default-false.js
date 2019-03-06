exports.up = pgm => {
    pgm.alterColumn('user_settings', 'allow_messaging', {
        default: false
    })
}