exports.up = pgm => {
    pgm.addColumns('user_events', {
        event_message: {
            type: 'text'
        }
    })
}