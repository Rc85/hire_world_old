const app = require('express').Router();
const db = require('../db');
const cryptojs = require('crypto-js');
const error = require('../utils/error-handler');

app.post('/api/user/review/submit', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);

                    let authorized;
                    let user = await client.query('SELECT user_status FROM users WHERE user_id = $1', [req.session.user.user_id]);

                    if (user && user.rows[0].user_status === 'Active') {
                        //if (req.body.message.token_status === 'Valid') {
                            let decoded = decodeURIComponent(req.body.message.review_token);
                            let decrypt = cryptojs.AES.decrypt(decoded, 'authorize authentic review');
                            let authenticated = decrypt.toString(cryptojs.enc.Utf8);
                            authorized = await client.query(`SELECT * FROM user_reviews WHERE reviewer = $1 AND review_id = $2 AND token_status = 'Valid'`, [authenticated, req.body.message.review_id]);

                            if (authenticated) {
                                await client.query(`UPDATE user_reviews SET review = $1, review_rating = $2, token_status = $3 WHERE review_id = $4`, [req.body.review, req.body.star, 'Invalid', authorized.rows[0].review_id,]);
                            } else {
                                throw new Error(`You're not authorized`);
                            }

                            let job = await client.query(`SELECT * FROM jobs
                            LEFT JOIN user_reviews ON user_reviews.review_job_id = jobs.job_id
                            WHERE jobs.job_id = $1 AND user_reviews.reviewer = $2 AND user_reviews.review_list_id = $3`, [req.body.message.job_id, req.session.user.username, req.body.list_id]);

                            await client.query(`COMMIT`)
                            .then(() => resp.send({status: 'success', job: job.rows[0]}));
                    } else if (user && user.rows[0].user_status === 'Suspend') {
                        let error = new Error(`You're temporarily banned`);
                        error.type = 'CUSTOM';
                        throw error;
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

                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
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
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                    if (user && user.rows[0].user_status === 'Active') {
                        let inserted = await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review, review_rating, review_list_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.session.user.username, req.body.reviewing, req.body.review, req.body.star, req.body.id]);

                        let review = await client.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews
                        LEFT JOIN users ON users.username = user_reviews.reviewer
                        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                        WHERE review_id = $1`, [inserted.rows[0].review_id]);

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success', statusMessage: 'Review submitted', review: review.rows[0]}));
                    } else if (user && user.rows[0].user_status === 'Suspend') {
                        let error = new Error(`You're temporarily banned`);
                        error.type = 'CUSTOM';
                        throw error;
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

                let message = 'An error occurred';

                if (err.code = '23505') {
                    message = `You already reviewed this user`;
                } else if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
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
                    
                    let user = await client.query(`SELECT user_status FROM users WHERE user_id = $1`, [req.session.user.user_id]);

                    if (user && user.rows[0].user_status === 'Active') {
                        await client.query(`UPDATE user_reviews SET review = $1, review_rating = $2, review_modified_date = current_timestamp WHERE review_id = $3 RETURNING *`, [req.body.message, req.body.star, req.body.review_id]);

                        let review = await client.query(`SELECT user_reviews.*, user_profiles.avatar_url FROM user_reviews LEFT JOIN users ON username = reviewer LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE review_id = $1`, [req.body.review_id]);

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: 'success', statusMessage: 'Review updated', review: review.rows[0]}));
                    } else if (user && user.rows[0].user_status === 'Suspend') {
                        let error = new Error(`You're temporarily banned`);
                        error.type = 'CUSTOM';
                        throw error;
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
                
                let message = 'An error occurred';

                if (err.type === 'CUSTOM') {
                    message = err.message;
                }

                resp.send({status: 'error', statusMessage: message});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;