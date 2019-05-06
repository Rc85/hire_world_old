exports.up = pgm => {
    pgm.addConstraint('user_view_count', 'unique_user', 'unique (viewing_user)')
}