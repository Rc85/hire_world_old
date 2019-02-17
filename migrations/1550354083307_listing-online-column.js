exports.up = pgm => {
    pgm.addColumns('user_listings', {
        listing_online: {
            type: 'boolean',
            default: false
        }
    })
}