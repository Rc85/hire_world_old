exports.up = pgm => {
    pgm.addColumns('sectors', {
        sector_definition: {
            type: 'text'
        }
    });
}