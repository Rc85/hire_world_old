exports.up = pgm => {
    pgm.dropConstraint('user_reviews', 'unique_review'),
    pgm.addConstraint('user_reviews', 'unique_review', {
        unique: ['reviewing', 'reviewer']
    })
}