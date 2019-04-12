exports.up = pgm => {
    pgm.alterColumn('user_settings', 'email_notifications', {
        default: true
    }),
    pgm.alterColumn('user_settings', 'allow_messaging', {
        default: true
    })
}