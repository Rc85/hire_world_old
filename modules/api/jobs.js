const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const request = require('request');
const validate = require('../utils/validate');

stripe.setApiVersion('2019-02-19');

app.post('/api/job/accounts/create', (req, resp) => {
    if (req.session.user) {
        let supportedCountries = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LU', 'NL', 'NO', 'NZ', 'PT', 'SE', 'US'];
        
        if ((req.body.firstname && !validate.nameCheck.test(req.body.firstname) || (req.body.lastname && !validate.nameCheck.test(req.body.lastname)))) {
            resp.send({status: 'error', statusMessage: 'Invalid character(s) in your name'});
        } else if (req.body.dobMonth && isNaN(parseInt(req.body.dobMonth))) {
            resp.send({status: 'error', statusMessage: 'The month of your birth must be a number'});
        } else if (req.body.dobDay && isNaN(parseInt(req.body.dobDay))) {
            resp.send({status: 'error', statusMessage: 'The day of your birth must be a number'});
        } else if (req.body.dobYear && isNaN(parseInt(req.body.dobYear))) {
            resp.send({status: 'error', statusMessage: 'The year of your birth must be a number'});
        } else if (req.body.country && supportedCountries.indexOf(req.body.country) < 0 && !validate.locationCheck.test(req.body.country)) {
            resp.send({status: 'error', statusMessage: 'That is not a valid country name'});
        } else if (req.body.region && !validate.locationCheck.test(req.body.region)) {
            resp.send({status: 'error', statusMessage: 'That is not a valid region name'});
        } else if (req.body.city && !validate.locationCheck.test(req.body.city)) {
            resp.send({status: 'error', statusMessage: 'That is not a valid city name'});
        } else if (req.body.address && !validate.addressCheck.test(req.body.address)) {
            resp.send({status: 'error', statusMessage: 'Invalid character(s) in address'});
        } else if (req.body.address2 && !validate.addressCheck.test(req.body.address2)) {
            resp.send({status: 'error', statusMessage: 'Invalid character(s) in address'});
        } else if (req.body.cityCode && !validate.cityCodeCheck.test(req.body.cityCode)) {
            resp.send({status: 'error', statusMessage: 'Invalid character(s) in postal/zip code'});
        } else if (req.body.ssn && isNaN(parseInt(req.body.ssn))) {
            resp.send({stauts: 'error', statusMessage: 'Invalid SSN/SIN number'});
        } else if (req.body.ssn && req.body.ssn.length !== 9) {
            resp.send({status: 'error', statusMessage: 'SIN/SSN must be 9 digits'});
        } else if (!req.body.tosAgree && !req.body.stripeAgree) {
            resp.send({status: 'error', statusMessage: 'You must agree to all the terms'});
        } else {
            request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.JOB_ACCOUNT_RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
                if (err) console.log(err);

                let response = JSON.parse(res.body);

                if (response.success) {
                    db.connect((err, client, done) => {
                        if (err) console.log(err);

                        (async() => {
                            try {
                                await client.query('BEGIN');

                                let user = await client.query(`SELECT users.user_email, user_profiles.* FROM users
                                LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                                WHERE username = $1`, [req.session.user.username]);

                                if (req.body.firstname && req.body.firstname !== user.rows[0].user_firstname) {
                                    await client.query(`INSERT INTO suspicious_acitivities ()`)
                                }


                                if (supportedCountries.indexOf(req.body.country) >= 0) {
                                    let accountObj = {
                                        type: 'custom',
                                        country: req.body.country,
                                        tos_acceptance: {
                                            date: Math.floor(Date.now() / 1000),
                                            ip: process.env.NODE_ENV === 'development' ? '127.0.0.1' : req.headers['x-real-ip']
                                        },
                                        business_type: req.body.type,
                                        business_profile: {
                                            name: req.body.businessName,
                                            product_description: req.body.businessDescription,
                                        },
                                        individual: {
                                            dob: {
                                                day: req.body.dobDay,
                                                month: req.body.dobMonth,
                                                year: req.body.dobYear
                                            },
                                            first_name: req.body.firstname,
                                            last_name: req.body.lastname,
                                            address: {
                                                city: req.body.city,
                                                country: req.body.country,
                                                line1: req.body.address,
                                                line2: req.body.address2,
                                                postal_code: req.body.cityCode,
                                                state: req.body.region
                                            },
                                            id_number: req.body.ssn
                                        },
                                        requested_capabilities: ['platform_payments'],
                                        default_currency: req.body.country === 'US' ? 'usd' : 'cad',
                                        settings: {
                                            payments: {
                                                statement_descriptor: 'HireWorld Deposit'
                                            },
                                            payouts: {
                                                statement_descriptor: 'HireWorld Payment',
                                                schedule: {
                                                    delay_days: 7
                                                }
                                            }
                                        }
                                    }

                                    await stripe.accounts.create(accountObj)
                                    .then(async account => {
                                        await client.query(`UPDATE users SET connected_id = $1 WHERE username = $2`, [account.id, req.session.user.username]);
                                    })
                                    .catch(err => {
                                        throw err;
                                    });

                                    await client.query('COMMIT')
                                    .then(() => resp.send({status: 'success'}));
                                } else {
                                    let error = new Error(`Your country is not yet supported`);
                                    let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                    throw errObj;
                                }
                            } catch (e) {
                                await client.query('ROLLBACK');
                                throw e;
                            } finally {
                                done();
                            }
                        })()
                        .catch(err => error.log(err, req, resp));
                    });
                }
            });
        }
    }
});

app.post('/api/job/account/update', async(req, resp) => {
    if (req.session.user) {
        delete req.body.ukBankType;
        delete req.body.useDefault;
        delete req.body.accountHolder;
        delete req.body.accountType;
        delete req.body.accountRoutingNumber;
        delete req.body.accountNumber;
        delete req.body.accountCountry;
        delete req.body.accountCurrency;
        delete req.body.external_accounts;
        delete req.body.status;
        delete req.body.statusMessage;
        delete req.body.user;

        let user = await db.query(`SELECT connected_id FROM users WHERE username = $1`, [req.session.user.username]);

        if (user && user.rows[0].connected_id) {
            await stripe.accounts.update(user.rows[0].connected_id, req.body)
            .then(account => {
                resp.send({status: 'success', statusMessage: 'Account updated', account: account});
            })
            .catch(err => error.log(err, req, resp));
        } else if (!user.rows[0].connected_id) {
            resp.send({status: 'error', statusMessage: `Connected account does not exist`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/account/payment/add', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query(`SELECT connected_id FROM users WHERE username = $1`, [req.session.user.username]);

        if (user && user.rows[0].connected_id) {
            await stripe.accounts.createExternalAccount(user.rows[0].connected_id, {
                external_account: req.body.token.id
            })
            .then(payment => resp.send({status: 'success', statusMessage: 'Payment account added', payment: payment}))
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: `Connected account does not exist`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/account/payment/default', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query(`SELECT connected_id FROM users WHERE username = $1`, [req.session.user.username]);

        if (user && user.rows[0].connected_id) {
            await stripe.accounts.updateExternalAccount(user.rows[0].connected_id, req.body.id, {
                default_for_currency: true
            })
            .then(payment => resp.send({status: 'success', statusMessage: 'Default payment account set', payment: payment}))
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: `Connected account does not exist`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/account/payment/delete', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query(`SELECT connected_id FROM users WHERE username = $1`, [req.session.user.username]);

        if (user && user.rows[0].connected_id) {
            let account = await stripe.accounts.retrieveExternalAccount(user.rows[0].connected_id, req.body.id);

            if (!account.default_for_currency) {
                await stripe.accounts.deleteExternalAccount(user.rows[0].connected_id, req.body.id)
                .then(payment => {
                    if (payment.deleted) {
                        resp.send({status: 'success', statusMessage: 'Payment account deleted'});
                    } else {
                        resp.send({status: 'error', statusMessage: `Cannot delete that payment`});
                    }
                })
                .catch(err => error.log(err, req, resp));
            } else {
                resp.send({status: 'error', statusMessage: `Default payment account cannot be deleted`});
            }
        } else {
            resp.send({status: 'error', statusMessage: `Connected account does not exist`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/create', async(req, resp) => {
    if (req.session.user) {
        await db.query(`INSERT INTO jobs (job_title, job_description, job_due_date, job_client, job_user) VALUES ($1, $2, $3, $4, $5)`, [req.body.workTitle, req.body.workDescription, req.body.workDueDate, req.session.user.username, req.body.user])
        .then(result => {
            if (result && result.rowCount === 1) {
                resp.send({status: 'success', statusMessage: 'Proposal submitted'});
            } else {
                resp.send({status: 'error', statusMessage: 'Fail to submit proposal'});
            }
        })
        .catch(err => {
            error.log(err, req, resp);
        });
    }
});

app.post('/api/job/submit/message', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.id]);

                    if (authorized.rows[0].job_user === req.session.user.username || authorized.rows[0].job_client === req.session.user.username) {
                        let newMessage = await client.query(`INSERT INTO job_messages (job_message_creator, job_message, job_message_parent_id) VALUES ($1, $2, $3) RETURNING job_message_id`, [req.session.user.username, req.body.message, req.body.id]);

                        let message = await client.query(`SELECT job_messages.*, user_profiles.avatar_url FROM job_messages LEFT JOIN users ON users.username = job_messages.job_message_creator LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id WHERE job_message_id = $1`, [newMessage.rows[0].job_message_id]);
                        
                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', message: message.rows[0]}))
                    } else {
                        let error = new Error(`You're not authorized`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => error.log(err, req, resp));
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;