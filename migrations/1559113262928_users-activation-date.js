exports.up = pgm => {
    pgm.addColumns('users', {
        activation_date: {
            type: 'timestamp with time zone'
        }
    })
}