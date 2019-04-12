exports.up = pgm => {
    pgm.dropColumns('user_reviews', 'review_list_id')
}