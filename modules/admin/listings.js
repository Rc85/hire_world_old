const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

app.post('/api/admin/listings/get', async(req, resp) => {
    let whereConditionString = '';
    let totalListingWhereConditionString = '';
    let paramStringParts = [];
    let totalListingParamStringParts = [];
    let params = [req.body.offset];
    let totalListingsQueryParams = [];

    if (req.body.sector || req.body.user) {
        let blankCheck = /^\s*$/

        if (req.body.sector) {
            params.push(req.body.sector);
            paramStringParts.push(`listing_sector = $${params.length}`);
            totalListingsQueryParams.push(req.body.sector);
            totalListingParamStringParts.push(`listing_sector = $${totalListingsQueryParams.length}`);
        }

        if (req.body.user) {
            if (!blankCheck.test(req.body.user)) {
                params.push(`%${req.body.user}`);
                paramStringParts.push(`listing_user ILIKE $${params.length}`);
                totalListingsQueryParams.push(`${req.body.user}%`);
                totalListingParamStringParts.push(`listing_user ILIKE $${totalListingsQueryParams.length}`);
            } else {
                resp.send({status: 'error', statusMessage: 'User cannot be blank'});
            }
        }

        whereConditionString = ` AND ${paramStringParts.join(' AND ')}`;
        totalListingWhereConditionString = ` AND ${totalListingParamStringParts.join(' AND ')}`;
    }

    let totaListingsQuery = `SELECT COUNT(listing_id) as listing_count FROM user_listings WHERE listing_status != 'Delete'${totalListingWhereConditionString}`;
    let query = `SELECT listing_id, listing_created_date, listing_renewed_date, listing_sector, listing_status, listing_user FROM user_listings WHERE listing_status != 'Delete'${whereConditionString} ORDER BY listing_id LIMIT 25 OFFSET $1`;
    let totalListings = await db.query(totaListingsQuery, totalListingsQueryParams);

    await db.query(query, params)
    .then(result => {
        if (result) resp.send({status: 'success', listings: result.rows, totalListings: totalListings.rows[0].listing_count});
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/admin/listing/change-status', async(req, resp) => {
    await db.query(`UPDATE user_listings SET listing_status = $1 WHERE listing_id = $2 RETURNING listing_id, listing_created_date, listing_renewed_date, listing_sector, listing_status, listing_user`, [req.body.status, req.body.id])
    .then(result => {
        let listing;

        if (req.body.status !== 'Delete') {
            listing = result.rows[0];
        }

        if (result) resp.send({status: 'success', listing: listing});
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

module.exports = app;