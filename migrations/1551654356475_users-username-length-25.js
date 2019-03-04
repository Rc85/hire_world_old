exports.up = pgm => {
    pgm.alterColumn('users', 'username', {
        type: 'varchar(25)'
    })
}