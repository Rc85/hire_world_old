exports.up = pgm => {
    pgm.alterColumn('user_reviews', 'review_date', {
        default: null
    })
}