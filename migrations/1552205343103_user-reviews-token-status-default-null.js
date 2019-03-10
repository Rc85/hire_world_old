exports.up = pgm => {
    pgm.alterColumn('user_reviews', 'token_status', {
        default: null
    })
}