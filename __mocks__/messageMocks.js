export const userMessage = {
    message_id: 1,
    belongs_to_job: 1,
    message_body: 'test',
    message_date: new Date(),
    message_type: 'User',
    message_sender: 'client',
    message_recipient: 'user',
    message_status: 'New',
    is_reply: 'false',
    message_modified_date: new Date()
}

export const systemUpdateMessage = Object.assign({}, userMessage);

systemUpdateMessage['message_type'] = 'Update';
systemUpdateMessage['message_sender'] = 'System';

export const systemConfirmMessage = Object.assign({}, userMessage);

systemConfirmMessage['message_type'] = 'Confirmation';
systemConfirmMessage['message_sender'] = 'System';