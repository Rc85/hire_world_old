exports.up = pgm => {
    pgm.addConstraint('currencies', 'unique_currency', 'unique (currency)'),
    pgm.addConstraint('jobs', 'currencies_jobs_job_price_currency_fk', {
        foreignKeys: {
            columns: 'job_price_currency',
            references: 'currencies (currency)',
            onUpdate: 'cascade'
        }
    })
}