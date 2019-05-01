exports.up = pgm => {
    pgm.dropColumns('users', ['has_link_work_bank_acct', 'bank_acct_verified'])
}