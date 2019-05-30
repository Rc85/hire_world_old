exports.up = pgm => {
    pgm.addColumns('jobs', {
        discount: {
            type: 'numeric',
            default: 0
        }
    })
}