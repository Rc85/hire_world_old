exports.up = pgm => {
    pgm.dropConstraint('user_reviews', 'unique_reviews'),
    pgm.createIndex('user_reviews', ['reviewing', 'reviewer', 'review_job_id'], {
        unique: true,
        where: 'review_job_id IS NOT NULL'
    })
}