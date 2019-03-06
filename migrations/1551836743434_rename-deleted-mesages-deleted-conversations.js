exports.up = pgm => {
    pgm.renameTable('deleted_messages', 'deleted_conversations'),
    pgm.renameColumn('deleted_conversations', 'deleted_msg_id', 'deleted_convo_id'),
    pgm.renameColumn('deleted_conversations', 'deleted_message', 'deleted_convo'),
    pgm.renameColumn('deleted_conversations', 'message_deleted_by', 'convo_deleted_by'),
    pgm.renameColumn('deleted_conversations', 'message_deleted_date', 'convo_deleted_date')
}