exports.up = pgm => {
    pgm.addConstraint('review_tokens', 'unique_job_token', 'unique (token_job_id)')
}