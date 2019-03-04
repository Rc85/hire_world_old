const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.get('/api/get/sectors', async(req, resp) => {
    db.query(`SELECT * FROM sectors
    LEFT JOIN (
        SELECT COUNT(listing_id) AS listing_count, listing_sector FROM user_listings
        GROUP BY listing_sector
    ) AS ul ON ul.listing_sector = sectors.sector
    WHERE sector_status NOT IN ('Close', 'Delete') ORDER BY sector`)
    .then(result => {
        if (result !== undefined) {
            resp.send({status: 'get sectors success', sectors: result.rows});
        }
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'get sectors error'});
    });
});

module.exports = app;