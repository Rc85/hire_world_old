exports.up = pgm => {
    pgm.addColumns('user_settings', {
        hide_declined_jobs: {
            type: 'boolean',
            default: false
        }
    })
}