exports.up = pgm => {
    pgm.dropConstraint('users', 'check_user_status'),
    pgm.dropConstraint('users', 'check_user_level')
}