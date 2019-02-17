const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY);
const request = require('request');
const validate = require('../utils/validate');

app.post('/api/job/accounts/create', (req, resp) => {
    if (req.session.user) {
        let supportedCountries = ['AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LU', 'NL', 'NO', 'NZ', 'PT', 'SE', 'US'];
        
        console.log(req.body);
        /* if ((req.body.firstname && !validate.nameCheck.test(req.body.firstname) || (req.body.lastname && !validate.nameCheck.test(req.body.lastname)))) {
            resp.send({status: 'error', statusMessage: 'Invalid character(s) in your name'});
        } else if (req.body.dobMonth && isNaN(parseInt(req.body.dobMonth))) {
            resp.send({status: 'error', statusMessage: 'The month of your birth must be a number'});
        } else if (req.body.dobDay && isNaN(parseInt(req.body.dobDay))) {
            resp.send({status: 'error', statusMessage: 'The day of your birth must be a number'});
        } else if (req.body.dobYear && (parseInt(req.body.dobYear))) {
            resp.send({status: 'error', statusMessage: 'The year of your birth must be a number'});
        } else if (req.body.country && supportedCountries.indexOf(req.body.country) < 0 && !validate.locationCheck.test(req.body.country)) {
            resp.send({status: 'error', statusMessage: 'That is not a valid country name'});
        } else if (req.body.region && !validate.locationCheck.test(req.body.region)) {
            resp.send({status: 'error', statusMessage: 'That is not a valid region name'});
        } else if (req.body.city && !validate.locationCheck.test(req.body.city)) {
            resp.send({status: 'error', statusMessage: 'That is not a valid city name'});
        } else if (req.body.address && !validate.addressCheck.test(req.body.address)) {
            resp.send({status: 'error', statusMessage: 'Invalid character(s) in address'});
        } else if (req.body.cityCode && !validate.cityCodeCheck.test(req.body.cityCode)) {
            resp.send({status: 'error', statusMessage: 'Invalid character(s) in postal/zip code'});
        } else if (!req.body.tosAgree && !req.body.stripeAgree) {
            resp.send({status: 'error', statusMessage: 'You must agree to all the terms'});
        } else {
            console.log('verifying recaptcha')
            request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.JOB_ACCOUNT_RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
                if (err) console.log(err);

                console.log('parse response to json');
                let response = JSON.parse(res.body);

                console.log(response);

                if (response.success) {
                    console.log('recaptcha verified')
                    console.log('terms agreed');
                    db.connect((err, client, done) => {
                        if (err) console.log(err);

                        console.log('beginning');
                        (async() => {
                            try {
                                await client.query('BEGIN');

                                let user = await client.query(`SELECT users.user_email, user_profiles.* FROM users
                                LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                                WHERE username = $1`, [req.session.user.username]);

                                if (req.body.firstname && req.body.firstname !== user.rows[0].user_firstname) {
                                    await client.query(`INSERT INTO suspicious_acitivities ()`)
                                }

                                console.log('inside try before if condition');

                                if (supportedCountries.indexOf(req.body.country) >= 0) {
                                    console.log('country is supported');
                                    console.log('creating stripe account');
                                    await stripe.accounts.create({
                                        type: 'custom',
                                        country: req.body.country,
                                        tos_acceptance: {
                                            date: Math.floor(Date.now() / 1000),
                                            ip: 
                                        },
                                        legal_entity: {
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
                                                postal_code: req.body.cityCode,
                                                state: req.body.region
                                            },
                                            personal_id_number: req.body.country === 'CA' && req.body.ssn ? req.body.ssn : null,
                                            ssn_last_4: req.body.country === 'US' && req.body.ssn ? req.body.ssn : null
                                        },
                                        default_currency: 'cad'
                                    })
                                    .then(account => {

                                    })
                                } else {
                                    return;
                                }

                                console.log('inside try after if condition');
                            } catch (e) {
                                await client.query('ROLLBACK');
                                throw e;
                            }

                            await client.query('ROLLBACK');

                            console.log('outside of try');

                            done();
                        })()
                        .catch(err => error.log(err, req, resp));
                    })
                }
            });
        } */
        console.log(req);
    }
});

module.exports = app;