const app = require('express').Router();
const db = require('../db');
const cryptoJs = require('crypto-js');
const error = require('../utils/error-handler');
const authenticate = require('../utils/auth');
const validate = require('../utils/validate');

app.post('/api/authentic/review/submit', authenticate, (req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        if (validate.blankCheck.test(req.body.review)) {
            resp.send({status: 'Please write a review'});
        } else {
            (async() => {
                try {
                    await client.query(`BEGIN`);

                    let authorized = await client.query(`SELECT user_reviews.*, users.user_status FROM user_reviews
                    LEFT JOIN users ON users.username = user_reviews.reviewer
                    LEFT JOIN review_tokens ON review_tokens.token_review_id = user_reviews.review_id
                    WHERE review_id = $1`, [req.body.review_id]);

                    if (authorized.rows[0].token_status === 'Invalid') {
                        let error = new Error('This job has been reviewed');
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    } else if (authorized.rows[0].user_status === 'Active' && authorized.rows[0].reviewer === req.body.user && req.body.user === req.session.user.username) {
                        
                        let decrypt = cryptoJs.AES.decrypt(req.body.token, process.env.REVIEW_TOKEN_SECRET);
                        let authenticated = decrypt.toString(cryptoJs.enc.Utf8);
                        let review;

                        if (authenticated === req.session.user.username) {
                            review = await client.query(`UPDATE user_reviews SET review = $1, review_rating = $2, review_date = current_timestamp, review_count = review_count + 1 WHERE review_id = $3 RETURNING *`, [req.body.review, req.body.star, authorized.rows[0].review_id]);
                            let token = await client.query(`UPDATE review_tokens SET token_status = 'Invalid', token_used_date = current_timestamp WHERE token_job_id = $1 RETURNING *`, [req.body.job_id]);

                            review.rows[0] = {...review.rows[0], ...token.rows[0]};
                        } else {
                            let error = new Error(`You're not authorized`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errObj;
                        }

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success', statusMessage: 'Review submitted', review: review.rows[0]}));
                    } else if (authorized.rows[0].user_status === 'Suspended') {
                        let error = new Error(`You're temporarily banned`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }
                } catch (e) {
                    await client.query(`ROLLBACK`);
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        }
    });
});

app.post('/api/review/submit', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query(`BEGIN`);
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                    if (user && user.rows[0].user_status === 'Active') {
                        let reviewed = await client.query(`SELECT reviewer FROM user_reviews WHERE reviewing = $1 AND reviewer = $2`, [req.body.reviewing, req.session.user.username]);

                        if (reviewed.rows.length === 0) {
                            let inserted = await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review, review_rating, review_date) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.session.user.username, req.body.reviewing, req.body.review, req.body.star, new Date()]);

                            let review = await client.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews
                            LEFT JOIN users ON users.username = user_reviews.reviewer
                            LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                            WHERE review_id = $1`, [inserted.rows[0].review_id]);

                            await client.query(`COMMIT`)
                            .then(() => resp.send({status: 'success', statusMessage: 'Review submitted', review: review.rows[0]}));
                        } else if (reviewed.rows.length > 0) {
                            let error = new Error(`You already reviewed this user`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errObj;
                        }
                    } else if (user && user.rows[0].user_status === 'Suspend') {
                        let error = new Error(`You're temporarily banned`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }
                } catch (e) {
                    await client.query(`ROLLBACK`);
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

app.post('/api/review/edit', authenticate, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query(`BEGIN`);
                    
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                    if (user && user.rows[0].user_status === 'Active') {
                        await client.query(`UPDATE user_reviews SET review = $1, review_rating = $2, review_modified_date = current_timestamp WHERE review_id = $3 RETURNING *`, [req.body.message, req.body.star, req.body.review_id]);

                        let review = await client.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews LEFT JOIN users ON username = reviewer LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE review_id = $1`, [req.body.review_id]);

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success', statusMessage: 'Review updated', review: review.rows[0]}));
                    } else if (user && user.rows[0].user_status === 'Suspend') {
                        let error = new Error(`You're temporarily banned`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};;
                        throw errObj;
                    }
                } catch (e) {
                    await client.query(`ROLLBACK`);
                throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
});

module.exports = app;