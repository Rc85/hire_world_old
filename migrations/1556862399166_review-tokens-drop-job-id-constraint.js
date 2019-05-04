exports.up = pgm => {
    pgm.dropConstraint('review_tokens', 'review_tokens_token_job_id_fkey')
}