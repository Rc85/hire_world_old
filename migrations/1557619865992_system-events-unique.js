exports.up = pgm => {
    pgm.addConstraint('system_events', 'unique_events', 'unique (event_name, event_reference)')
}