exports.up = pgm => {
    pgm.dropIndex('user_reviews', ['reviewing', 'reviewer', 'review_job_id'], {
        name: 'user_reviews_reviewing_reviewer_review_job_id_index'
    }),
    pgm.addConstraint('user_reviews', 'unique_reviews', {
        unique: ['reviewer', 'reviewing']
    })
}