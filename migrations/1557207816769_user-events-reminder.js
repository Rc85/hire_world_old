exports.up = pgm => {
    pgm.addColumns('user_events', {
        reminder: {
            type: 'boolean',
            default: true
        }
    })
}