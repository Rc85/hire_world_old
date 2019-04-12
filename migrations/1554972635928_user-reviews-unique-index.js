exports.up = pgm => {
    pgm.createIndex('user_reviews', ['reviewing', 'reviewer', 'review_job_id'], {
        where: 'review_job_id IS NULL'
    }),
    pgm.dropConstraint('user_reviews', 'unique_review')
}