exports.up = pgm => {
    pgm.createTable('reports', {
        report_id: 'id',
        reporter: {
            type: 'varchar',
            notNull: true,
            references: 'users (username)'
        },
        report_type: {
            type: 'varchar',
            notNull: true
        },
        report_date: {
            type: 'timestamp without time zone',
            default: pgm.func('current_timestamp')
        },
        report_status: {
            type: 'varchar',
            default: 'Pending'
        },
        report_reason: {
            type: 'varchar'
        },
        other_reason: {
            type: 'text'
        },
        reported_content_link: {
            type: 'varchar'
        }
    }),
    pgm.createIndex('reports', ['reporter', 'report_type', 'report_status', 'reported_content_link'], {
        unique: true,
        where: `report_status = 'Pending'`
    })
}