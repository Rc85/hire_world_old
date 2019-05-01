exports.up = pgm => {
    pgm.addColumns('user_settings', {
        hide_completed_milestones: {
            type: 'boolean',
            default: false
        }
    })
}