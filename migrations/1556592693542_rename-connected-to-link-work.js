exports.up = pgm => {
    pgm.renameColumn('users', 'connected_id', 'link_work_id'),
    pgm.renameColumn('users', 'connected_acct_status', 'link_work_acct_status'),
    pgm.renameColumn('users', 'has_connected_bank_acct', 'has_link_work_bank_acct')
}