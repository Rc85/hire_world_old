exports.up = pgm => {
    pgm.addColumns('milestone_conditions', {
        condition_is_new: {
            type: 'boolean',
            default: false
        }
    })
}