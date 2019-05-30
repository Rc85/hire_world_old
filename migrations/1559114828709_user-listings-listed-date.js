exports.up = pgm => {
    pgm.addColumns('user_listings', {
        listing_toggled_date: {
            type: 'timestamp with time zone'
        }
    })
}