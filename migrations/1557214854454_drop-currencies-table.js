exports.up = pgm => {
    pgm.dropConstraint('jobs', 'currencies_jobs_job_price_currency_fk'),
    pgm.dropTable('currencies')
}