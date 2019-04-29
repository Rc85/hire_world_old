exports.up = pgm => {
    pgm.alterColumn('user_reviews', 'review_count', {
        default: 0
    })
}