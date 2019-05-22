exports.up = pgm => {
    pgm.addColumns('job_messages', {
        job_message_type: {
            type: 'varchar',
            default: 'User'
        }
    })
}