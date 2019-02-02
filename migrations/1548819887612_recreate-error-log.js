exports.up = pgm => {
    pgm.createTable('error_log', {
        error_id: 'id',
        error: {
            type: 'varchar',
            notNull: true
        },
        error_url: {
            type: 'varchar'
        },
        error_entry_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        },
        error_occurrence: {
            type: 'integer',
            default: '0'
        },
    })
}