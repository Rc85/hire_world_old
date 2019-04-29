exports.up = pgm => {
    pgm.dropIndex('user_reviews', ['reviewer', 'reviewing', 'review_job_id'], {
        name: 'user_reviews_reviewing_reviewer_review_job_id_unique_index'
    }),
    pgm.addConstraint('user_reviews', 'unique_review', 'unique (reviewer, reviewing, review_job_id)')
}