const app = require('express').Router();
const db = require('../db');
const cryptojs = require('crypto-js');

app.post('/api/user/review/submit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);

                    let authorized;

                    if (req.body.message.review_id) {
                        authorized = await client.query(`SELECT * FROM user_reviews WHERE reviewer = $1`, [req.session.user.username]);
                        let decoded = decodeURIComponent(req.body.message.review_token);
                        let authenticated = cryptojs.AES.decrypt(decoded, req.body.message.reviewer);

                        if (authorized && authenticated) {
                            await client.query(`UPDATE user_reviews SET review = $1, review_rating = $2, token_status = $3 WHERE review_id = $4`, [req.body.review, req.body.star, 'Invalid', authorized.rows[0].review_id,]);
                        } else {
                            throw new Error(`You're not authorized`);
                        }

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success'}));
                    } else if (req.body.message.job_id) {
                        let reviewing;

                        if (req.session.user.username === req.body.message.job_user) {
                            reviewing = req.body.message.job_client;
                        } else if (req.session.user.username === req.body.message.job_client) {
                            reviewing = req.body.message.job_user;
                        } else {
                            throw new Error(`You're not authorized`);
                        }

                        await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review, review_rating) VALUES ($1, $2, $3, $4)`, [req.session.user.username, reviewing, req.body.review, req.body.star]);

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success'}));
                    } else {
                        let review = await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review, review_rating) VALUES ($1, $2, $3, $4) RETURNING *`, [req.session.user.username, req.body.reviewing, req.body.review, req.body.star]);

                        if (review && review.rowCount === 1) {
                            await client.query(`COMMIT`)
                            .then(() => resp.send({status: 'success', review: review.rows[0]}));
                        } else {
                            throw new Error('Insert error');
                        }
                    }
                } catch (e) {
                    await client.query(`ROLLBACK`);
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    }
});

app.post('/api/review/submit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);
                    let inserted = await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review, review_rating) VALUES ($1, $2, $3, $4) RETURNING *`, [req.session.user.username, req.body.reviewing, req.body.review, req.body.star]);

                    let review = await client.query(`SELECT user_reviews.*, users.avatar_url FROM user_reviews LEFT JOIN users ON username = reviewer WHERE review_id = $1`, [inserted.rows[0].review_id]);

                    await client.query(`COMMIT`)
                    .then(() => resp.send({status: 'success', statusMessage: 'Review submitted', review: review.rows[0]}));
                } catch (e) {
                    await client.query(`ROLLBACK`);
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/review/edit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);
                    
                    await client.query(`UPDATE user_reviews SET review = $1, review_rating = $2, review_modified_date = current_timestamp WHERE review_id = $3 RETURNING *`, [req.body.message, req.body.star, req.body.review_id]);

                    let review = await client.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews LEFT JOIN users ON username = reviewer LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE review_id = $1`, [req.body.review_id]);

                    await client.query(`COMMIT`)
                    .then(() => resp.send({status: 'success', statusMessage: 'Review updated', review: review.rows[0]}))
                } catch (e) {
                    await client.query(`ROLLBACK`);
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;