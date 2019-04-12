const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const request = require('request');
const validate = require('../utils/validate');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
const cryptoJs = require('crypto-js');
const bcrypt = require('bcrypt');
const util = require('util');
const formidable = require('formidable');
const http = require('http');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

                console.log(req.body);

                if (response.success) {
                    db.connect((err, client, done) => {
                        if (err) console.log(err);

                        (async() => {
                            try {
                                await client.query('BEGIN');

                                /* let user = await client.query(`SELECT users.user_email, user_profiles.* FROM users
                                LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                                WHERE username = $1`, [req.session.user.username]);

                                if (req.body.individual.first_name && req.body.individual.first_name !== user.rows[0].user_firstname) {
                                    await client.query(`INSERT INTO suspicious_acitivities ()`)
                                } */

                                let currency;

                                if (req.body.individual.address.country === 'US' || req.body.company.address.country === 'US') {
                                    currency = 'usd';
                                } else if (req.body.individual.address.country === 'CA' || req.body.company.address.country === 'CA') {
                                    currency = 'cad';
                                } else if (req.body.individual.address.country === 'AU' || req.body.company.address.country === 'AU') {
                                    currency = 'aud';
                                } else {
                                    currency = 'eur';
                                }

                                if (supportedCountries.indexOf(req.body.individual.address.country) >= 0) {
                                    let accountObj = {
                                        type: 'custom',
                                        country: req.body.individual.address.country,
                                        tos_acceptance: {
                                            date: Math.floor(Date.now() / 1000),
                                            ip: process.env.NODE_ENV === 'development' ? '127.0.0.1' : req.headers['x-real-ip']
                                        },
                                        business_type: req.body.business_type,
                                        business_profile: {
                                            name: req.body.business_profile.name,
                                            product_description: req.body.business_profile.product_description,
                                        },
                                        email: req.body.email,
                                        individual: {
                                            dob: {
                                                day: req.body.individual.dob.day,
                                                month: req.body.individual.dob.month,
                                                year: req.body.individual.dob.year
                                            },
                                            first_name: req.body.individual.first_name,
                                            last_name: req.body.individual.last_name,
                                            address: {
                                                city: req.body.individual.address.city,
                                                country: req.body.individual.address.country,
                                                line1: req.body.individual.address.line1,
                                                line2: req.body.individual.address.line2,
                                                postal_code: req.body.individual.address.postal_code,
                                                state: req.body.individual.address.state
                                            },
                                            id_number: req.body.individual.id_number,
                                            email: req.body.email
                                        },
                                        default_currency: currency,
                                        settings: {
                                            payments: {
                                                statement_descriptor: 'Hire World Job Payment'
                                            },
                                            payouts: {
                                                statement_descriptor: 'Hire World Job Payout',
                                                schedule: {
                                                    interval: 'manual'
                                                }
                                            }
                                        }
                                    }

                                    if (req.body.individual.address.country === 'US' || req.body.company.address.country === 'US') {
                                        accountObj['requested_capabilities'] = ['card_payments'];
                                    }

                                    if (req.body.individual.phone) {
                                        accountObj['individual']['phone'] = req.body.individual.phone;
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
                } else {
                    resp.send({status: 'error', statusMessage: `You're not human`});
                }
            });
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
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
        delete req.body.id;
        delete req.body.object;
        delete req.body.charges_enabled;
        delete req.body.created;
        delete req.body.details_submitted;
        delete req.body.payouts_enabled;
        delete req.body.requirements;
        delete req.body.type;
        delete req.body.individual.id;
        delete req.body.individual.object;
        delete req.body.individual.account;
        delete req.body.individual.created;
        delete req.body.individual.id_number_provided;
        delete req.body.individual.relationship;
        delete req.body.individual.requirements;
        delete req.body.individual.ssn_last_4_provided;
        delete req.body.settings;
        delete req.body.business_profile.support_address;
        delete req.body.business_profile.support_email;
        delete req.body.business_profile.support_phone;
        delete req.body.business_profile.support_url;
        delete req.body.business_profile.url;
        delete req.body.tos_acceptance;
        delete req.body.individual.verification;
        delete req.body.documentFront;
        delete req.body.documentBack;
        delete req.body.country;
        delete req.body.capabilities;

        if (req.body.individual.address.country !== 'US') {
            delete req.body.business_profile.mcc;
        }

        if (req.body.business_type === 'individual') {
            delete req.body.company;
        } else if (req.body.business_type === 'company') {
            delete req.body.individual;
        }

        if (!req.body.individual.id_number) {
            delete req.body.individual.id_number;
        }
        
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
            console.log(req.body);
            if (req.body.token) {
                await stripe.accounts.createExternalAccount(user.rows[0].connected_id, {
                    external_account: req.body.token.id,
                    default_for_currency: true
                })
                .then(payment => {
                    console.log(payment);
                    resp.send({status: 'success', statusMessage: 'Payment account added', payment: payment})
                })
                .catch(err => error.log(err, req, resp));
            } else {
                resp.send({status: 'error', statusMessage: `Error in provided financial information`});
            }
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
            resp.send({status: 'error', statusMessage: `Connected account does not exist`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/create', async(req, resp) => {
    if (req.session.user) {
        let dueDate = new Date(req.body.workDueDate);

        if (!validate.titleCheck.test(req.body.workTitle)) {
            resp.send({status: 'error', statusMessage: `Invalid character(s) in title`});
        } else if (req.body.offerPrice && !validate.priceCheck.test(req.body.offerPrice)) {
            resp.send({status: 'error', statusMessage: `Invalid price format`});
        } else if (req.body.priceCurrency && !validate.currencyCheck.test(req.body.priceCurrency)) {
            resp.send({status: 'error', statusMessage: `Invalid currency`});
        } else if (req.body.workDueDate && isNaN(dueDate.getTime())) {
            resp.send({status: 'error', statusMessage: `Invalid due date`});
        } else {
            let query;
            let offerPrice = parseFloat(req.body.offerPrice).toFixed(2);

            if (req.body.job_id) {
                query = `UPDATE jobs SET job_title = $1, job_offer_price = $2, job_price_currency = $3, job_description = $4, job_due_date = $5, job_modified_date = current_timestamp WHERE job_id = $6 RETURNING *`;
                params = [req.body.workTitle, offerPrice, req.body.priceCurrency, req.body.workDescription, req.body.workDueDate, req.body.job_id];
            } else {
                query = `INSERT INTO jobs (job_title, job_offer_price, job_price_currency, job_description, job_due_date, job_client, job_user) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
                params = [req.body.workTitle, offerPrice, req.body.priceCurrency, req.body.workDescription, req.body.workDueDate, req.session.user.username, req.body.user];
            }

            await db.query(query, params)
            .then(result => {
                if (result && result.rowCount === 1) {
                    resp.send({status: 'success', statusMessage: req.body.job_id ? 'Job updated' : 'Job submitted', job: result.rows[0]});
                } else {
                    resp.send({status: 'error', statusMessage: req.body.job_id ? 'Fail to update job' : 'Fail to submit job'});
                }
            })
            .catch(err => {
                error.log(err, req, resp);
            });
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(req.headers);
        let dir = `./user_files/${req.session.user.user_id}`;
        let documentDir = `${dir}/documents`;

        if (fs.existsSync(dir)) {
            if (fs.existsSync(documentDir)) {
                cb(null, documentDir);
            } else {
                fs.mkdirSync(documentDir);
                cb(null, documentDir);
            }
        } else {
            fs.mkdirSync(dir);
            fs.mkdirSync(documentDir);
            cb(null, documentDir);
        }
    },
    filename: (req, file, cb) => {
        console.log(req.headers)
        let extension = path.extname(file.originalname);
        let dir = `./user_files/${req.session.user.user_id}/documents`;

        if (fs.existsSync(`${dir}/${file.fieldname}${extension}`)) {
            fs.unlinkSync(`${dir}/${file.fieldname}${extension}`);
        }

        cb(null, `${file.fieldname}${extension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5000000
    },
    fileFilter: (req, file, cb) => {
        console.log(req.headers)
        let extension = path.extname(file.originalname);
        let extCheck = /.(jpg|png)$/;
        let filesize = parseInt(req.headers['content-length']);
        let dir = `./user_files/${req.session.user.user_id}/documents`;

        if (extCheck.test(extension)) {
            if (filesize < 5000000) {
                if (!fs.existsSync(dir)) {
                    fs.mkdir(dir, (err) => {
                        if (err) console.log(err);
                    });
                }

                cb(null, true);
            } else {
                return cb(new Error('File size exceeded'));
            }
        } else {
            return cb(new Error('File type not supported'));
        }
    }
});

app.post('/api/job/account/document/upload', async(req, resp) => {
    if (req.session.user) {
        let user = await db.query(`SELECT user_id, connected_id FROM users WHERE username = $1`, [req.session.user.username]);
        let uploadFiles;

        if (req.headers.front & req.headers.back) {
            uploadFiles = upload.fields([{name: 'front'}, {name: 'back'}]);
        } else if (req.headers.front && !req.headers.back) {
            uploadFiles = upload.single('front');
        }

        uploadFiles(req, resp, (err) => {
            if (err) {
                error.log(err, req, resp);
            } else {
                

                fs.readdir(`user_files/${user.rows[0].user_id}/documents`, async(err, files) => {
                    let front = await stripe.fileUploads.create({
                        purpose: 'identity_document',
                        file: {
                            data: fs.readFileSync(`user_files/${user.rows[0].user_id}/documents/${files.find(value => /^front/.test(value))}`),
                            name: files.find(value => /^front/.test(value)),
                            type: 'application/octet-stream'
                        }
                    },
                    {stripe_account: user.rows[0].connected_id})
                    .catch(err => error.log(err, req));

                    let back = await stripe.fileUploads.create({
                        purpose: 'identity_document',
                        file: {
                            data: fs.readFileSync(`user_files/${user.rows[0].user_id}/documents/${files.find(value => /^back/.test(value))}`),
                            name: files.find(value => /^back/.test(value)),
                            type: 'application/octet-stream'
                        }
                    },
                    {stripe_account: user.rows[0].connected_id})
                    .catch(err => error.log(err, req));

                    await stripe.accounts.update(user.rows[0].connected_id, {
                        individual: {
                            verification: {
                                document: {
                                    front: front.id,
                                    back: back.id
                                }
                            }
                        }
                    })
                    .then(account => {
                        resp.send({status: 'success', statusMessage: 'Document(s) uploaded', account: account});
                    })
                    .catch(err => error.log(err, req, resp));
                });
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/agreement/submit', (req, resp) => {
    if (req.session.user) {
        let validMilestonePrices = true;
        let milestonePriceLimitExceeded = false;
        let validMilestoneDates = true;
        let totalMilestonePrice = 0;

        if (!validate.priceCheck.test(req.body.totalPrice)) {
            resp.send({status: 'error', statusMessage: 'Invalid total price'});
        } else if (!validate.currencyCheck.test(req.body.currency)) {
            resp.send({status: 'error', statusMessage: 'Invalid currency'});
        } else if (validMilestonePrices && typeof req.body.milestones === 'object') {
            for (let milestone of req.body.milestones) {
                if (!validate.priceCheck.test(milestone.milestone_payment_amount)) {
                    validMilestonePrices = false;
                    break;
                } else if (moment(milestone.milestone_due_date) === 'Invalid date') {
                    validMilestoneDates = false;
                    break;
                } else if (parseFloat(milestone.milestone_payment_amount) > 500) {
                    milestonePriceLimitExceeded = true;
                    break;
                }

                totalMilestonePrice += parseFloat(milestone.milestone_payment_amount);
            }
        }

        if (!validMilestonePrices) {
            resp.send({status: 'error', statusMessage: 'Invalid milestone price'});
        } else if (!validMilestoneDates) {
            resp.send({status: 'error', statusMessage: 'Invalid delivery date'});
        } else if (milestonePriceLimitExceeded) {
            resp.send({status: 'error', statusMessage: 'Milestone payment limit exceeded'});
        } else if (parseFloat(req.body.totalPrice) - totalMilestonePrice < 0) {
            resp.send({status: 'error', statusMessage: `Total milestone payment cannot exceed total price`});
        } else if (parseFloat(req.body.totalPrice) - totalMilestonePrice > 0) {
            resp.send({status: 'error', statusMessage: 'There are remaining funds to be set into milestones'});
        } else {
            db.connect((err, client, done) => {
                if (err) error.log(err, req);

                (async() => {
                    try {
                        await client.query('BEGIN');

                        let authorized = await client.query(`SELECT job_user, job_modified_date FROM jobs WHERE job_id = $1`, [req.body.jobId]);

                        let clientDate = new Date(req.body.job_modified_date);
                        let jobDate = new Date(authorized.rows[0].job_modified_date);

                        if (clientDate.toString() !== jobDate.toString()) {
                            let error = new Error(`Job modified, please reload`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error};
                            throw errObj;
                        } else if (authorized.rows[0].job_user === req.session.user.username) {
                            let job = await client.query(`UPDATE jobs SET job_total_price = $1, job_price_currency = $2, job_status = 'Pending', job_modified_date = current_timestamp WHERE job_id = $3 RETURNING job_client`, [req.body.totalPrice, req.body.currency.toUpperCase(), req.body.jobId]);

                            let milestones = await client.query(`DELETE FROM job_milestones WHERE milestone_job_id = $1`, [req.body.jobId]);
                            let milestoneIds = milestones.rows.map((milestone, i) => {
                                return milestone.milestone_id;
                            });

                            await client.query(`DELETE FROM milestone_conditions WHERE condition_parent_id = ANY($1)`, [milestoneIds]);

                            for (let milestone of req.body.milestones) {
                                let inserted = await client.query(`INSERT INTO job_milestones (milestone_job_id, milestone_payment_amount, milestone_due_date) VALUES ($1, $2, $3) RETURNING milestone_id`, [req.body.jobId, milestone.milestone_payment_amount, milestone.milestone_due_date]);

                                for (let condition of milestone.conditions) {
                                    await client.query(`INSERT INTO milestone_conditions (condition_parent_id, condition) VALUES ($1, $2)`, [inserted.rows[0].milestone_id, condition.condition]);
                                }
                            }

                            await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [job.rows[0].job_client, req.body.edit ? `Details for a job has been modified [ID: ${req.body.jobId}]`: `You received details a job [ID: ${req.body.jobId}]`, 'Job']);

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: req.body.edit ? 'Job details updated' : 'Job details sent'}));
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
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/decline', async(req, resp) => {
    if (req.session.user) {
        let authorized = await db.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.id]);

        if (authorized.rows[0].job_user === req.session.user.username || authorized.rows[0].job_client === req.session.user.username) {
            await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3), ($4, $2, $3)`, [authorized.rows[0].job_user, `Job ID ${req.body.id} has been declined`, 'Job', authorized.rows[0].job_client]);

            await db.query(`UPDATE jobs SET job_status = 'Declined' WHERE job_id = $1`, [req.body.id])
            .then(result => {
                if (result && result.rowCount === 1) {
                    resp.send({status: 'success'});
                } else {
                    resp.send({status: 'error', statusMessage: 'Fail to decline job'});
                }
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: `You're not authorized`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/accept', async(req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            console.log(req.body);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT jobs.job_user, jobs.job_client, jobs.job_title, jobs.job_price_currency, jobs.job_modified_date, job_milestones.*, users.connected_id FROM jobs
                    LEFT JOIN job_milestones ON job_milestones.milestone_job_id = jobs.job_id
                    LEFT JOIN users ON users.username = jobs.job_user
                    WHERE job_id = $1
                    ORDER BY milestone_id`, [req.body.job.job_id]);
                    let clientDate = new Date(req.body.job.job_modified_date).getTime()
                    let modifiedDate = authorized.rows[0].job_modified_date.getTime()

                    if (clientDate !== modifiedDate) {
                        let error = new Error('Job modified. Please go back and review');
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    }

                    if (authorized.rows[0].job_client === req.body.user && req.body.user === req.session.user.username) {
                        let user = await client.query(`SELECT users.stripe_id, users.user_email FROM jobs LEFT JOIN users ON users.username = jobs.job_client WHERE job_id = $1`, [req.body.job.job_id]);

                        for (let milestone of authorized.rows) {
                            if (milestone.milestone_due_date) {
                                await client.query(`INSERT INTO user_events (event_name, event_date, event_owner, event_type, event_reference_id) VALUES ($1, $2, $3, $4, $5)`, [`A milestone [ID: ${milestone.milestone_id}] is expected to be delivered`, milestone.milestone_due_date, authorized.rows[0].job_user, 'Job', milestone.milestone_job_id]);
                            }
                        }

                        let amount = parseFloat(authorized.rows[0].milestone_payment_amount) * 100;
                        let clientFee = Math.round(amount * 0.05);
                        let userFee = Math.round(amount * 0.10);
                        let chargeAmount = amount + clientFee;

                        let chargeObj = {
                            amount: chargeAmount,
                            application_fee_amount: userFee + clientFee,
                            currency: authorized.rows[0].job_price_currency.toLowerCase(),
                            description: `Funds for job ID: ${req.body.job.job_id} [${authorized.rows[0].job_title}]`,
                            on_behalf_of: authorized.rows[0].connected_id,
                            transfer_data: {
                                destination: authorized.rows[0].connected_id
                            },
                            source: req.body.token.id,
                            receipt_email: user.rows[0].user_email,
                            expand: ['transfer.destination_payment.balance_transaction']
                        }

                        if (user.rows[0].stripe_id) {
                            chargeObj['customer'] = user.rows[0].stripe_id
                        }

                        // NOTE: expand transfer.destination_payment next time you make a charge
                        let charge = await stripe.charges.create(chargeObj);
                        console.log(util.inspect(charge, false, null, true));

                        await client.query(`UPDATE job_milestones SET milestone_status = 'In Progress', charge_id = $2, milestone_fund_due_date = to_timestamp($5) + interval '90 days', milestone_start_date = to_timestamp($3), balance_txn_id = $4, milestone_payment_after_fees = $6 WHERE milestone_id = $1`, [authorized.rows[0].milestone_id, charge.id, charge.created, charge.balance_transaction, charge.created, charge.transfer.destination_payment.balance_transaction.net]);
                        await client.query(`UPDATE jobs SET job_status = 'Active' WHERE job_id = $1`, [req.body.job.job_id]);
                        await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`An amount of $${amount / 100} was charged on card ending with ${charge.payment_method_details.card.last4}`, authorized.rows[0].job_client, 'Payment']);
                        await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_user, `Job ID ${req.body.job.job_id} has been accepted and funds has been transferred to your connected account`, 'Job']);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success'}));
                    }
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log(err, req, resp);
            });
        });
    }
});

app.post('/api/job/condition/update', async(req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);
            (async() => {
                try {
                    await client.query('BEGIN');
                    let authorized = await client.query(`SELECT jobs.job_user FROM jobs WHERE job_id = $1`, [req.body.job_id]);

                    if (authorized.rows[0].job_user === req.session.user.username) {
                        let action;

                        if (req.body.action === 'check') {
                            action = 'Complete';
                        } else if (req.body.action === 'uncheck') {
                            action = 'In Progress';
                        }

                        let milestone = await client.query(`SELECT * FROM job_milestones WHERE milestone_id = $1`, [req.body.milestone_id]);
                        console.log(req.body);

                        if (milestone.rows[0].milestone_status !== 'Complete' && milestone.rows[0].milestone_status !== 'Abandoned') {
                            let milestoneObj;

                            if (req.body.action === 'uncheck') {
                                await client.query(`UPDATE jobs SET job_status = 'Active' WHERE job_id = $1`, [req.body.job_id]);
                                milestoneObj = await client.query(`UPDATE job_milestones SET milestone_status = 'In Progress' WHERE milestone_id = $1 RETURNING *`, [req.body.milestone_id]);
                            } else if (req.body.action === 'check') {
                                milestoneObj = await client.query(`SELECT * FROM job_milestones WHERE milestone_id = $1`, [req.body.milestone_id]);
                            }

                            let condition = await client.query(`UPDATE milestone_conditions SET condition_status = $2, condition_completed_date = $3 WHERE condition_id = $1 RETURNING *`, [req.body.condition_id, action, req.body.action === 'check' ? new Date() : null]);
                            let balance = await stripe.balance.retrieveTransaction(milestoneObj.rows[0].balance_txn_id, {expand: ['source.transfer.destination_payment.balance_transaction']});
                            let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1 ORDER BY filename`, [req.body.milestone_id]);

                            milestoneObj.rows[0]['conditions'] = condition.rows;
                            milestoneObj.rows[0]['balance'] = balance.source.transfer.destination_payment.balance_transaction;
                            milestoneObj.rows[0]['files'] = files.rows;
                            
                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Condition updated', milestone: milestoneObj.rows[0]}));
                        } else {
                            resp.send({status: 'error', statusMessage: 'Milestone cannot be modified'});
                        }
                    } else {
                        resp.send({status: 'error', statusMessage: `You're not authorized`});
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

app.post('/api/job/account/close', async(req, resp) => {
    if (req.session.user) {
        if (!req.body.password) {
            resp.send({status: 'error', statusMessage: 'Password required'});
        } else {
            let authorized = await db.query(`SELECT username, user_password, connected_id FROM users WHERE connected_id = $1`, [req.body.id]);

            if (authorized.rows[0].username === req.body.user && req.body.user === req.session.user.username) {
                let jobs = await db.query(`SELECT job_id FROM jobs WHERE (job_user = $1 OR job_client = $1) AND job_status IN ('Active', 'Requesting Payment')`, [req.session.user.username]);

                if (jobs.rows.length > 0) {
                    resp.send({status: 'error', statusMessage: 'Cannot close because you still have active jobs'});
                } else {
                    bcrypt.compare(req.body.password, authorized.rows[0].user_password, async(err, matched) => {
                        if (err) {
                            error.log(err, req, resp);
                        } else if (matched) {
                            let account = await stripe.accounts.del(authorized.rows[0].connected_id);

                            if (account && account.deleted) {
                                await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Connected account deleted', authorized.rows[0].username, 'Account']);
                                await db.query(`UPDATE jobs SET job_status = 'Declined' WHERE job_user = $1 AND job_status IN ('Open', 'New', 'Pending', 'Confirmed')`)
                                await db.query(`UPDATE users SET connected_id = null, connected_acct_status = 'Reviewing' WHERE username = $1`, [authorized.rows[0].username])
                                .then(result => {
                                    if (result && result.rowCount === 1) {
                                        resp.send({status: 'success'});
                                    }
                                })
                                .catch(err => error.log(err, req, resp));
                            }
                        } else {
                            resp.send({status: 'error', statusMessage: 'Incorrect password'});
                        }
                    });
                }
            } else {
                resp.send({status: 'error', statusMessage: `You're not authorized`});
            }
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/payment/request', async(req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            (async() => {
                try {
                    await client.query(`BEGIN`);

                    let authorized = await client.query(`SELECT * FROM job_milestones LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id WHERE milestone_id = $1`, [req.body.milestone_id]);

                    if (authorized.rows[0].job_user === req.session.user.username) {
                        await client.query(`UPDATE jobs SET job_status = 'Requesting Payment' WHERE job_id = $1`, [authorized.rows[0].job_id]);
                        let milestone = await client.query(`UPDATE job_milestones SET milestone_status = 'Requesting Payment', requested_payment_amount = $2 WHERE milestone_id = $1 RETURNING *`, [req.body.milestone_id, req.body.amount]);
                        await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, `You received a payment request for a milestone in Job ID: ${authorized.rows[0].job_id}`, 'Job']);

                        let conditions = await client.query(`SELECT * FROM milestone_conditions WHERE condition_parent_id = $1`, [req.body.milestone_id]);
                        let balance = await stripe.balance.retrieveTransaction(authorized.rows[0].balance_txn_id, {expand: ['source.transfer.destination_payment.balance_transaction']});
                        let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1 ORDER BY filename`, [req.body.milestone_id]);
                        
                        milestone.rows[0]['files'] = files.rows;
                        milestone.rows[0]['conditions'] = conditions.rows;
                        milestone.rows[0]['balance'] = balance.source.transfer.destination_payment.balance_transaction;

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'Request sent', milestone: milestone.rows[0]}));
                    } else {
                        let error = new Error(`You're not authorized`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack}
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

app.post('/api/job/pay', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);

            console.log(req.body);

        
            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT jobs.job_id, jobs.job_user, jobs.job_client, jobs.job_price_currency, job_milestones.balance_txn_id, users.connected_id, job_milestones.charge_id, job_milestones.requested_payment_amount, job_milestones.milestone_payment_after_fees FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    LEFT JOIN users ON users.username = jobs.job_user
                    WHERE milestone_id = $1`, [req.body.milestone_id]);

                    if (authorized.rows[0].job_client === req.session.user.username) {
                        let conditions = await client.query(`SELECT * FROM milestone_conditions WHERE condition_parent_id = $1`, [req.body.milestone_id]);
                        let conditionsComplete = true;

                        for (let condition of conditions.rows) {
                            if (condition.condition_status !== 'Complete') {
                                conditionsComplete = false;
                                break;
                            }
                        }

                        if (conditionsComplete) {
                            let amount;
                            
                            if (authorized.rows[0].requested_payment_amount) {
                                amount = Math.round(parseFloat(authorized.rows[0].requested_payment_amount) * 100);
                            } else {
                                amount = authorized.rows[0].milestone_payment_after_fees;
                            }

                            let balance = await stripe.balance.retrieveTransaction(authorized.rows[0].balance_txn_id, {expand: ['source.transfer.destination_payment.balance_transaction']});

                            let payout = await stripe.payouts.create({
                                amount: amount,
                                currency: balance.source.transfer.destination_payment.balance_transaction.currency
                            }, {stripe_account: authorized.rows[0].connected_id})
                            .catch(err => console.log(err));
                            console.log(payout);

                            let milestone = await client.query(`UPDATE job_milestones SET milestone_status = 'Complete', payout_id = $2, milestone_completed_date = current_timestamp WHERE milestone_id = $1 RETURNING *`, [req.body.milestone_id, payout.id]);
                            await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_user, `A milestone in Job ID: ${authorized.rows[0].job_id} has been completed`, 'Job']);
                            await client.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_user, `A ${amount !== balance.source.transfer.destination_payment.balance_transaction.net ? 'partial' : ''} payment amount of $${amount / 100} has been paid to you for completing a milestone in Job ID: ${authorized.rows[0].job_id}`, 'Payment'])

                            let milestones = await client.query(`SELECT milestone_status FROM job_milestones WHERE milestone_job_id = $1`, [authorized.rows[0].job_id]);
                            let jobComplete = true;
                            let review;

                            for (let milestone of milestones.rows) {
                                if (milestone.milestone_status !== 'Complete') {
                                    jobComplete = false;
                                }
                            }

                            if (jobComplete) {
                                await client.query(`UPDATE jobs SET job_status = 'Complete', job_end_date = current_timestamp WHERE job_id = $1`, [authorized.rows[0].job_id]);

                                let encrypt = cryptoJs.AES.encrypt(authorized.rows[0].job_client, process.env.REVIEW_TOKEN_SECRET);
                                let reviewToken = encrypt.toString();

                                review = await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review_job_id) VALUES ($1, $2, $3) ON CONFLICT (reviewer, reviewing) DO UPDATE SET review_count = user_reviews.review_count + 1 RETURNING *`, [authorized.rows[0].job_client, authorized.rows[0].job_user, authorized.rows[0].job_id]);
                                token = await client.query(`INSERT INTO review_tokens (token, token_review_id, token_job_id) VALUES ($1, $2, $3) RETURNING *`, [reviewToken, review.rows[0].review_id, authorized.rows[0].job_id]);

                                review.rows[0] = {...review.rows[0], ...token.rows[0]};
                            } else {
                                await client.query(`UPDATE jobs SET job_status = 'Active' WHERE job_id = $1`, [authorized.rows[0].job_id]);
                            }

                            let conditions = await client.query(`SELECT * FROM milestone_conditions WHERE condition_parent_id = $1`, [req.body.milestone_id]);
                            let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1 ORDER BY filename`, [req.body.milestone_id]);
                    
                            milestone.rows[0]['files'] = files.rows;
                            milestone.rows[0]['balance'] = balance.source.transfer.destination_payment.balance_transaction;
                            milestone.rows[0]['conditions'] = conditions.rows;

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Payment sent', jobComplete: jobComplete, milestone: milestone.rows[0], review: review ? review.rows[0] : null}));
                        } else {
                            let error = new Error(`The milestone has been modified`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errObj;
                        }
                    } else {
                        let error = new Error(`You're not authorized`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack}
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

app.post('/api/job/milestone/start', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) console.log(err);
            console.log(req.body);

            (async() => {
                try {
                    await client.query('BEGIN');
                    let authorized = await client.query(`SELECT jobs.job_client, jobs.job_title, jobs.job_id, job_milestones.milestone_payment_amount, job_milestones.milestone_status, jobs.job_price_currency, users.user_email, users.stripe_id FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    LEFT JOIN users ON users.username = jobs.job_client
                    WHERE milestone_id = $1`, [req.body.id]);
                    console.log(authorized.rows[0]);

                    if (authorized.rows[0].milestone_status === 'In Progress') {
                        let error = new Error(`Milestone already started`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    } else if (authorized.rows[0].milestone_status !== 'Pending') {
                        let error = new Error(`Cannot start milestone`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    } else if (authorized.rows[0].job_client === req.body.user && req.body.user === req.session.user.username) {
                        let user = await client.query(`SELECT jobs.job_user, users.connected_id FROM job_milestones
                        LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                        LEFT JOIN users ON jobs.job_user = users.username
                        WHERE milestone_id = $1`, [req.body.id]);

                        let amount = parseFloat(authorized.rows[0].milestone_payment_amount) * 100;
                        let clientFee = Math.round(amount * 0.05);
                        let userFee = Math.round(amount * 0.10);
                        let chargeAmount = amount + clientFee;

                        let chargeObj = {
                            amount: chargeAmount,
                            application_fee_amount: userFee + clientFee,
                            currency: authorized.rows[0].job_price_currency.toLowerCase(),
                            description: `Funds for job ID: ${req.body.job.job_id} [${authorized.rows[0].job_title}]`,
                            transfer_data: {
                                destination: authorized.rows[0].connected_id
                            },
                            source: req.body.token.id,
                            receipt_email: user.rows[0].user_email,
                            expand: ['transfer.destination_payment.balance_transaction']
                        }

                        if (user.rows[0].stripe_id) {
                            chargeObj['customer'] = user.rows[0].stripe_id
                        }

                        let charge = await stripe.charges.create(chargeObj)
                        .catch(err => console.log(err));

                        let milestone = await client.query(`UPDATE job_milestones SET balance_txn_id = $1, charge_id = $2, milestone_status = 'In Progress', milestone_fund_due_date = to_timestamp($5) + interval '90 days', milestone_start_date = to_timestamp($3), milestone_payment_after_fees = $6 WHERE milestone_id = $4 RETURNING *`, [charge.balance_transaction, charge.id, charge.created, req.body.id, charge.created, charge.transfer.destination_payment.balance_transaction.net]);
                        await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [user.rows[0].job_user, `${authorized.rows[0].job_client} has started a milestone in Job ID: ${authorized.rows[0].job_id}`, 'Job']);
                        await client.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, [`An amount of $${amount} was charged on card ending with ${charge.payment_method_details.card.last4}`, authorized.rows[0].job_client, 'Payment']);

                        let conditions = await client.query(`SELECT * FROM milestone_conditions WHERE condition_parent_id = $1`, [req.body.id]);
                        let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1 ORDER BY filename`, [req.body.milestone_id]);
                        
                        milestone.rows[0]['files'] = files.rows;
                        milestone.rows[0]['balance'] = charge.transfer.destination_payment.balance_transaction;
                        milestone.rows[0]['conditions'] = conditions.rows;

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'Milestone started', milestone: milestone.rows[0]}));
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
        })
    } else {
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    }
});

const jobFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = `./job_files`;

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

const jobFileUpload = multer({
    storage: jobFileStorage,
    limits: {
        fileSize: 250000000
    },
    fileFilter: (req, file, cb) => {
        let extension = path.extname(file.originalname);
        let extCheck = /.(zip|rar|tar.gz|gz|tgz)$/;
        let filesize = parseInt(req.headers['content-length']);

        //if (extCheck.test(extension)) {
            if (filesize < 250000000) {
                cb(null, true);
            } else {
                let error = new Error('File size limit exceeded');
                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                return cb(errObj);
            }
        /* } else {
            return cb(new Error('File type not supported'));
        } */
    }
});

app.post('/api/job/check-file-exists', (req, resp) => {
    console.log(req.headers);
    if (parseInt(req.headers.filesize) > 250000000) {
        resp.send({status: 'error', statusMessage: 'File size limit exceeded'});
    } else if (!/(zip|rar|tar.gz|gz|tgz)$/.test(req.headers.filetype)) {
        resp.send({status: 'error', statusMessage: 'File type not supported'});
    } else {
        fs.exists(`./job_files/${req.body.job_id}/${req.body.milestone_id}/${req.body.file}`, (exists) => {
            if (exists) {
                resp.send({status: 'exists'});
            } else {
                resp.send({status: 'not exist'});
            }
        });
    }
});

app.post('/api/job/upload', async(req, resp) => {
    if (req.session.user) {
        let uploadFile = jobFileUpload.single('file');
        
        uploadFile(req, resp, async(err) => {
            if (err) {
                error.log(err, req, resp);
            } else {
                let authorized = await db.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.job_id]);
        
                if (authorized.rows[0].job_user === req.body.user && req.body.user === req.session.user.username) {
                    if (err) {
                        error.log(err, req, resp);
                        fs.unlinkSync(`./job_files/${req.file.originalname}`);
                    } else {
                        if (!fs.existsSync(`./job_files/${req.body.job_id}`)) {
                            fs.mkdirSync(`./job_files/${req.body.job_id}`);
                            fs.mkdirSync(`./job_files/${req.body.job_id}/${req.body.milestone_id}`);
                        } else {
                            if (!fs.existsSync(`./job_files/${req.body.job_id}/${req.body.milestone_id}`)) {
                                fs.mkdirSync(`./job_files/${req.body.job_id}/${req.body.milestone_id}`);
                            }
                        }

                        let encrypt = cryptoJs.AES.encrypt(authorized.rows[0].job_client, process.env.FILE_HASH_SECRET);
                        let secret = encrypt.toString();
                        let file;
                        
                        if (!req.body.overwrite || req.body.overwrite === 'yes') {
                            fs.rename(`./job_files/${req.file.originalname}`, `./job_files/${req.body.job_id}/${req.body.milestone_id}/${req.file.originalname}`, async(err) => {
                                if (err) {
                                    error.log(err, req, resp);
                                } else {
                                    file = await db.query(`INSERT INTO milestone_files (file_hash, file_owner, file_milestone_id, filesize, filename) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (file_milestone_id, filename) DO UPDATE SET file_hash = $1, file_uploaded_date = current_timestamp, filesize = $4 RETURNING *`, [secret, authorized.rows[0].job_client, req.body.milestone_id, req.file.size, req.file.originalname]);

                                    await db.query('UPDATE job_milestones SET have_files = true WHERE milestone_id = $1 RETURNING *', [req.body.milestone_id]);
            
                                    resp.send({status: 'success', statusMessage: 'File uploaded', file: file.rows[0]});
                                }
                            });
                        } else if (req.body.overwrite === 'no') {
                            fs.unlink(`./job_files/${req.body.filename}`, async(err) => {
                                if (err) {
                                    error.log(err, req, resp);
                                } else {
                                    await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, `${authorized.rows[0].job_user} uploaded a file named ${req.body.filename} in Job ID: ${req.body.job_id}`, 'Job']);

                                    resp.send({status: 'success'});
                                }
                            });
                        }
                    }
                } else {
                    resp.send({status: 'error', statusMessage: `You're not authorized`});
                    fs.unlinkSync(`./job_files/${req.file.originalname}`);
                }
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/job/download', async(req, resp) => {
    if (req.session.user) {
        let authorized = await db.query(`SELECT * FROM job_milestones LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id WHERE milestone_id = $1`, [req.body.milestone_id]);
        let downloadFile = await db.query(`SELECT * FROM milestone_files WHERE filename = $1 AND file_milestone_id = $2`, [req.body.file, req.body.milestone_id]);

        let decrypt = cryptoJs.AES.decrypt(downloadFile.rows[0].file_hash, process.env.FILE_HASH_SECRET);
        let secret = decrypt.toString(cryptoJs.enc.Utf8);

        if (authorized.rows[0].job_client === req.body.user && req.body.user === req.session.user.username && secret === req.body.user) {
            await db.query(`UPDATE milestone_files SET file_download_counter = file_download_counter + 1 WHERE filename = $1 AND file_milestone_id = $2`, [req.body.file, req.body.milestone_id]);

            let filePath = path.resolve(`./job_files/${authorized.rows[0].job_id}/${authorized.rows[0].milestone_id}/${downloadFile.rows[0].filename}`);
            resp.download(filePath, downloadFile.rows[0].filename, (err) => {
                if (err) console.log(err);
            });
        } else {
            resp.send({status: 'error', statusMessage: `You're not authorized`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;