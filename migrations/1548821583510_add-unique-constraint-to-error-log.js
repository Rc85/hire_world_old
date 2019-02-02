exports.up = pgm => {
    pgm.addConstraint('error_log', 'unique_error', 'unique (error)')
}