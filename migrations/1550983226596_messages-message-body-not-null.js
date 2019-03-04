exports.up = pgm => {
    pgm.alterColumn('messages', 'message_body', {
        notNull: true
    })
}