exports.up = pgm => {
    pgm.createTable('currencies', {
        currency_id: 'id',
        currency: {
            type: 'varchar'
        }
    })
}