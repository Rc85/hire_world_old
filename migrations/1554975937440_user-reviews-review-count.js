exports.up = pgm => {
    pgm.addColumns('user_reviews', {
        review_count: {
            type: 'int',
            default: 1
        }
    })
}