exports.up = pgm => {
    pgm.dropColumns('jobs', ['client_job_terms_agreed', 'user_job_terms_agreed']);
}