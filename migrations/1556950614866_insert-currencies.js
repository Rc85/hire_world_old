exports.up = pgm => {
    pgm.db.query(`INSERT INTO currencies (currency) VALUES ('AUD'), ('CAD'), ('EUR'), ('GBP'), ('RMB'), ('USD')`)
}