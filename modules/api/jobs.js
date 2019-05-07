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
const authenticate = require('../utils/auth');
const moneyFormatter = require('../utils/money-formatter');
const subscriptionCheck = require('../utils/subscription-check');
const userEvents = require('../utils/user-events');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

stripe.setApiVersion('2019-02-19');

app.post('/api/job/accounts/create', authenticate, subscriptionCheck, (req, resp) => {
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
            request.post('https://www.google.com/recaptcha/api/siteverify', {form: {secret: process.env.RECAPTCHA_SECRET, response: req.body.verified}}, (err, res, body) => {
                if (err) error.log(err, req, resp);

                let response = JSON.parse(res.body);

                if (response.success) {
                    db.connect((err, client, done) => {
                        if (err) error.log(err, req, resp);

                        (async() => {
                            try {
                                await client.query('BEGIN');

                                let user = await client.query(`SELECT account_type FROM users WHERE username = $1`, [req.session.user.username]);

                                /* if (req.body.individual.first_name && req.body.individual.first_name !== user.rows[0].user_firstname) {
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
                                                },
                                                debit_negative_balances: false
                                            }
                                        }
                                    }

                                    if (req.body.individual.address.country === 'US' || req.body.company.address.country === 'US') {
                                        accountObj['requested_capabilities'] = ['card_payments'];
                                        accountObj.business_profile['mcc'] = req.body.business_profile.mcc;
                                    }

                                    if (req.body.individual.phone) {
                                        accountObj['individual']['phone'] = req.body.individual.phone;
                                    }

                                    await stripe.accounts.create(accountObj)
                                    .then(async account => {
                                        await client.query(`UPDATE users SET link_work_id = $1 WHERE username = $2`, [account.id, req.session.user.username]);
                                        await client.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [req.session.user.username, `Link Work account created`, 'Account']);
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
});

app.post('/api/job/account/update', authenticate, subscriptionCheck, async(req, resp) => {
        // need user validation
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
        
        let user = await db.query(`SELECT link_work_id FROM users WHERE username = $1`, [req.session.user.username]);

        if (user && user.rows[0].link_work_id) {
            await stripe.accounts.update(user.rows[0].link_work_id, req.body)
            .then(account => {
                resp.send({status: 'success', statusMessage: 'Account updated', account: account});
            })
            .catch(err => error.log(err, req, resp));
        } else if (!user.rows[0].link_work_id) {
            resp.send({status: 'error', statusMessage: `Link Work account does not exist`});
        }
});

app.post('/api/job/account/payment/add', authenticate, subscriptionCheck, async(req, resp) => {
        let user = await db.query(`SELECT username, link_work_id FROM users WHERE username = $1`, [req.body.user]);

        if (user && user.rows[0].username === req.session.user.username) {
            if (user.rows[0].link_work_id) {
                
                if (req.body.token) {
                    await stripe.accounts.createExternalAccount(user.rows[0].link_work_id, {
                        external_account: req.body.token.id,
                        default_for_currency: true
                    })
                    .then(async(account) => {
                        await db.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [req.session.user.username, account.object === 'bank_account' ? `Added a bank account to Link Work account` : `Added a card ending in ${account.last4} to Link Work account`, 'Link Work']);
                        await stripe.accounts.listExternalAccounts(user.rows[0].link_work_id)
                        .then(accounts => {
                            resp.send({status: 'success', statusMessage: 'Payment account added', accounts: accounts.data});
                        })
                        .catch(err => error.log(err,req, resp));
                    })
                    .catch(err => error.log(err, req, resp));
                } else {
                    resp.send({status: 'error', statusMessage: `Error in provided financial information`});
                }
            } else {
                resp.send({status: 'error', statusMessage: `Link Work account does not exist`});
            }
        } else {
            resp.send({status: 'error', statusMessage: `You're not authorized`});
        }
});

app.post('/api/job/account/payment/default', authenticate, subscriptionCheck, async(req, resp) => {
        let user = await db.query(`SELECT link_work_id FROM users WHERE username = $1`, [req.session.user.username]);

        if (user && user.rows[0].link_work_id) {
            await stripe.accounts.updateExternalAccount(user.rows[0].link_work_id, req.body.id, {
                default_for_currency: true
            })
            .then(payment => resp.send({status: 'success', statusMessage: 'Default payment account set', payment: payment}))
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: `Link Work account does not exist`});
        }
});

app.post('/api/job/account/payment/delete', authenticate, subscriptionCheck, async(req, resp) => {
        let user = await db.query(`SELECT link_work_id FROM users WHERE username = $1`, [req.session.user.username]);

        if (user && user.rows[0].link_work_id) {
            await stripe.accounts.deleteExternalAccount(user.rows[0].link_work_id, req.body.id)
            .then(payment => {
                if (payment.deleted) {
                    resp.send({status: 'success', statusMessage: 'Payment account deleted'});
                } else {
                    resp.send({status: 'error', statusMessage: `Cannot delete that payment`});
                }
            })
            .catch(err => error.log(err, req, resp));
        } else {
            resp.send({status: 'error', statusMessage: `Link Work account does not exist`});
        }
});

app.post('/api/job/create', authenticate, subscriptionCheck, async(req, resp) => {
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
            let offerPrice = 0;
            
            if (req.body.offerPrice) {
                offerPrice = parseFloat(req.body.offerPrice).toFixed(2);
            }

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
                    resp.send({status: 'success', statusMessage: req.body.job_id ? 'Job updated' : 'Job submitted and has been added to your job proposals', job: result.rows[0]});
                } else {
                    resp.send({status: 'error', statusMessage: req.body.job_id ? 'Fail to update job' : 'Fail to submit job'});
                }
            })
            .catch(err => {
                error.log(err, req, resp);
            });
        }
});

app.post('/api/job/submit/message', authenticate, subscriptionCheck, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

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
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
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
        
        let extension = path.extname(file.originalname);
        let extCheck = /.(jpg|png)$/;
        let filesize = parseInt(req.headers['content-length']);
        let dir = `./user_files/${req.session.user.user_id}/documents`;

        if (extCheck.test(extension)) {
            if (filesize < 5000000) {
                if (!fs.existsSync(dir)) {
                    fs.mkdir(dir, (err) => {
                        if (err) error.log(err, req);
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

app.post('/api/job/account/document/upload', authenticate, subscriptionCheck, async(req, resp) => {
        let user = await db.query(`SELECT user_id, link_work_id FROM users WHERE username = $1`, [req.session.user.username]);
        let uploadFiles;

        if (req.headers.front === 'true' & req.headers.back === 'true') {
            uploadFiles = upload.fields([{name: 'front'}, {name: 'back'}]);
        } else if (req.headers.front === 'true' && req.headers.back === 'false') {
            uploadFiles = upload.single('front');
        }

        uploadFiles(req, resp, (err) => {
            if (err) {
                error.log(err, req, resp);
            } else {
                fs.readdir(`user_files/${user.rows[0].user_id}/documents`, async(err, files) => {
                    let front, back;
                    let document = {};

                    if (files.length >= 1 && fs.readFileSync(`user_files/${user.rows[0].user_id}/documents/${files.find(value => /^front/.test(value))}`)) {
                        front = await stripe.fileUploads.create({
                            purpose: 'identity_document',
                            file: {
                                data: fs.readFileSync(`user_files/${user.rows[0].user_id}/documents/${files.find(value => /^front/.test(value))}`),
                                name: files.find(value => /^front/.test(value)),
                                type: 'application/octet-stream'
                            }
                        },
                        {stripe_account: user.rows[0].link_work_id})
                        .catch(err => error.log(err, req));

                        document['front'] = front.id;

                        if (files.length > 1 && fs.readFileSync(`user_files/${user.rows[0].user_id}/documents/${files.find(value => /^back/.test(value))}`)) {
                            back = await stripe.fileUploads.create({
                                purpose: 'identity_document',
                                file: {
                                    data: fs.readFileSync(`user_files/${user.rows[0].user_id}/documents/${files.find(value => /^back/.test(value))}`),
                                    name: files.find(value => /^back/.test(value)),
                                    type: 'application/octet-stream'
                                }
                            },
                            {stripe_account: user.rows[0].link_work_id})
                            .catch(err => error.log(err, req));

                            document['back'] = back.id;
                        }
                    }

                    await stripe.accounts.update(user.rows[0].link_work_id, {
                        individual: {
                            verification: {
                                document: document
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
});

app.post('/api/job/agreement/submit', authenticate, subscriptionCheck, (req, resp) => {
    let validMilestonePrices = true;
    let validMilestoneDates = true;
    let totalMilestonePrice = 0;
    let validConditions = true;

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
            }

            totalMilestonePrice += parseFloat(milestone.milestone_payment_amount);

            for (let condition of milestone.conditions) {
                if (validate.blankCheck.test(condition.condition)) {
                    validConditions = false;
                    break;
                }
            }
        }
    }

    if (req.body.milestones.length === 0) {
        resp.send({status: 'error', statusMessage: 'At least one milestone is required'});
    } else if (!validConditions) {
        resp.send({status: 'error', statusMessage: 'Condition cannot be blank'});
    } else if (!validMilestonePrices) {
        resp.send({status: 'error', statusMessage: 'Invalid milestone price'});
    } else if (!validMilestoneDates) {
        resp.send({status: 'error', statusMessage: 'Invalid delivery date'});
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

                    if (clientDate.getTime() - jobDate.getTime() !== 0) {
                        let error = new Error(`Job modified, please reload`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error};
                        throw errObj;
                    } else if (authorized.rows[0].job_user === req.session.user.username) {
                        let job = await client.query(`UPDATE jobs SET job_total_price = $1, job_price_currency = $2, job_status = 'Pending', job_modified_date = current_timestamp, job_details = $4 WHERE job_id = $3 RETURNING *`, [req.body.totalPrice, req.body.currency.toUpperCase(), req.body.jobId, req.body.details]);

                        await client.query(`DELETE FROM job_milestones WHERE milestone_job_id = $1`, [req.body.jobId]);

                        for (let obj of req.body.milestones) {
                            let milestone = await client.query(`INSERT INTO job_milestones (milestone_job_id, milestone_payment_amount, milestone_due_date) VALUES ($1, $2, $3) RETURNING milestone_id`, [req.body.jobId, obj.milestone_payment_amount, obj.milestone_due_date]);

                            for (let condition of obj.conditions) {
                                await client.query(`INSERT INTO milestone_conditions (condition_parent_id, condition) VALUES ($1, $2)`, [milestone.rows[0].milestone_id, condition.condition]);
                            }
                        }

                        let milestones = await client.query(`WITH 
                            milestones AS (
                                SELECT jm.*, JSON_AGG(mc.*)
                                FROM job_milestones AS jm
                                LEFT JOIN milestone_conditions AS mc
                                ON jm.milestone_id = mc.condition_parent_id
                                GROUP BY jm.milestone_id
                            ),
                            files AS (
                                SELECT jm.*, JSON_AGG(f.*)
                                FROM job_milestones AS jm
                                LEFT JOIN milestone_files AS f
                                ON jm.milestone_id = f.file_milestone_id
                                GROUP BY jm.milestone_id
                            )
                        SELECT jms.*, JSON_AGG(ms.*) AS conditions, JSON_AGG(ft.*) AS files
                        FROM job_milestones AS jms
                        LEFT JOIN milestones AS ms
                        ON jms.milestone_id = ms.milestone_id
                        LEFT JOIN files AS ft
                        ON jms.milestone_id = ft.milestone_id
                        WHERE jms.milestone_job_id = $1
                        ORDER BY jms.milestone_id`, [job.rows[0].job_id]);

                        if (req.body.edit) {
                            await client.query(`UPDATE jobs SET milestones_modified_date = current_timestamp WHERE job_id = $1`, [req.body.jobId]);
                        }

                        await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [job.rows[0].job_client, req.body.edit ? `Details for a job has been modified [ID: ${req.body.jobId}]`: `You received details a job [ID: ${req.body.jobId}]`, 'Update']);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: req.body.edit ? 'Job details updated' : 'Job details sent', job: job.rows[0], milestones: milestones.rows}));
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
});

app.post('/api/job/decline', authenticate, subscriptionCheck, async(req, resp) => {
        let authorized = await db.query(`SELECT job_user, job_client FROM jobs WHERE job_id = $1`, [req.body.id]);

        if (authorized.rows[0].job_user === req.session.user.username || authorized.rows[0].job_client === req.session.user.username) {
            await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3), ($4, $2, $3)`, [authorized.rows[0].job_user, `Job ID ${req.body.id} has been declined`, 'Update', authorized.rows[0].job_client]);

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
});

app.post('/api/job/condition/update', authenticate, subscriptionCheck, async(req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);
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
                        

                        if (milestone.rows[0].milestone_status !== 'Complete' && milestone.rows[0].milestone_status !== 'Abandoned') {
                            let milestoneObj;

                            if (req.body.action === 'uncheck') {
                                await client.query(`UPDATE jobs SET job_status = 'Active', job_modified_date = current_timestamp WHERE job_id = $1`, [req.body.job_id]);
                                milestoneObj = await client.query(`UPDATE job_milestones SET milestone_status = 'In Progress', requested_payment_amount = null WHERE milestone_id = $1 RETURNING *`, [req.body.milestone_id]);
                            } else if (req.body.action === 'check') {
                                milestoneObj = await client.query(`SELECT * FROM job_milestones WHERE milestone_id = $1`, [req.body.milestone_id]);
                            }

                            let condition = await client.query(`UPDATE milestone_conditions SET condition_status = $2, condition_completed_date = $3 WHERE condition_id = $1 RETURNING *`, [req.body.condition_id, action, req.body.action === 'check' ? new Date() : null]);
                            /* let balance = await stripe.balance.retrieveTransaction(milestoneObj.rows[0].balance_txn_id, {expand: ['source.transfer.destination_payment.balance_transaction']});
                            let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1 ORDER BY filename`, [req.body.milestone_id]);

                            milestoneObj.rows[0]['balance'] = balance.source.transfer.destination_payment.balance_transaction;
                            milestoneObj.rows[0]['files'] = files.rows; */
                            milestoneObj.rows[0]['conditions'] = condition.rows;
                            
                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Condition updated', condition: condition.rows[0]}));
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
});

app.post('/api/job/account/close', authenticate, async(req, resp) => {
        if (!req.body.password) {
            resp.send({status: 'error', statusMessage: 'Password required'});
        } else {
            let authorized = await db.query(`SELECT username, user_password, link_work_id FROM users WHERE link_work_id = $1`, [req.body.id]);

            if (authorized.rows[0].username === req.body.user && req.body.user === req.session.user.username) {
                let jobs = await db.query(`SELECT job_id FROM jobs WHERE (job_user = $1 OR job_client = $1) AND job_status IN ('Active', 'Requesting Payment')`, [req.session.user.username]);

                if (jobs.rows.length > 0) {
                    resp.send({status: 'error', statusMessage: 'Cannot close because you still have active jobs'});
                } else {
                    bcrypt.compare(req.body.password, authorized.rows[0].user_password, async(err, matched) => {
                        if (err) {
                            error.log(err, req, resp);
                        } else if (matched) {
                            let account = await stripe.accounts.del(authorized.rows[0].link_work_id);

                            if (account && account.deleted) {
                                await db.query(`INSERT INTO activities (activity_action, activity_user, activity_type) VALUES ($1, $2, $3)`, ['Link Work account deleted', authorized.rows[0].username, 'Account']);
                                await db.query(`UPDATE jobs SET job_status = 'Declined' WHERE job_user = $1 AND job_status IN ('Open', 'New', 'Pending', 'Confirmed')`, [req.session.user.username]);
                                await db.query(`UPDATE users SET link_work_id = null, link_work_acct_status = 'Reviewing' WHERE username = $1`, [authorized.rows[0].username])
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
});

app.post('/api/job/payment/request', authenticate, subscriptionCheck, async(req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);
            
            (async() => {
                try {
                    await client.query(`BEGIN`);
                    
                    let authorized = await client.query(`SELECT * FROM job_milestones LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id WHERE milestone_id = $1`, [req.body.milestone_id]);
                    
                    if (parseFloat(req.body.amount) > parseFloat(authorized.rows[0].milestone_payment_after_fees)) {
                        let error = new Error(`Requested amount cannot exceed payment`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    } else if (authorized.rows[0].job_user === req.session.user.username) {
                        let stripeBalance = await stripe.balance.retrieveTransaction(authorized.rows[0].balance_txn_id, {expand: ['source.transfer.destination_payment.balance_transaction']});
                        await client.query(`UPDATE jobs SET job_status = 'Requesting Payment' WHERE job_id = $1`, [authorized.rows[0].job_id]);
                        let lifetime = await client.query(`SELECT SUM(requested_payment_amount) + SUM(user_app_fee) AS total_payout FROM job_milestones
                        LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                        WHERE jobs.job_client = $1 AND job_user = $2
                        AND job_milestones.milestone_status = 'Complete'
                        AND (payout_status != 'failed' OR payout_status != 'canceled')`, [authorized.rows[0].job_client, authorized.rows[0].job_user]);
                        let lifetimeTotal = isNaN(parseFloat(lifetime.rows[0].total_payout)) ? 0 : parseFloat(lifetime.rows[0].total_payout);
                        let requestAmount = parseFloat(req.body.amount);
                        let userFee = (stripeBalance.source.transfer.destination_payment.balance_transaction.fee - Math.round(parseFloat(authorized.rows[0].client_app_fee) * 100)) / 100;
                        let amount = parseFloat(authorized.rows[0].milestone_payment_after_fees);
                        let newRequestAmount = requestAmount;
                        console.log('user fee before: ' + userFee)
                        console.log('lifetime: ' + lifetimeTotal);
                        console.log('requested: ' + requestAmount);
                        console.log('amount: ' + amount);
                        
                        if (requestAmount !== amount) {
                            let totalAmount = lifetimeTotal + requestAmount;
                            console.log('request and lifetime: ' + (requestAmount + lifetimeTotal))
                            console.log('total amount: ' + totalAmount);
                            
                            if (lifetimeTotal <= 500) {
                                userFee = Math.round(requestAmount * 0.15 * 100) / 100;

                                if (totalAmount > 500 & totalAmount <= 10000) {
                                    let firstFee = Math.round((500 - lifetimeTotal) * 0.15 * 100) / 100;
                                    let secondFee = Math.round((requestAmount - (500 - lifetimeTotal)) * 0.075 * 100) / 100;
                                    console.log('500 - 10000')
                                    console.log('first fee: ' + firstFee);
                                    console.log('second fee: ' + secondFee);
                                    
                                    userFee = firstFee + secondFee;
                                } else if (totalAmount > 10000) {
                                    let firstFee = Math.round((500 - lifetimeTotal) * 0.15 * 100) / 100;
                                    let secondFee = Math.round((10000 - 5000) * 0.075);
                                    let thirdFee = Math.round((requestAmount - 10000) * 0.0375 * 100) / 100;
                                    console.log('10000+')
                                    console.log('first fee: ' + firstFee);
                                    console.log('second fee: ' + secondFee);
                                    console.log('third fee: ' + thirdFee);

                                    userFee = firstFee + secondFee + thirdFee;
                                }
                            } else if (lifetimeTotal > 500 && lifetimeTotal <= 10000) {
                                userFee = (Math.round(requestAmount * 0.075));

                                if (totalAmount > 10000) {
                                    let firstFee = Math.round((10000 - lifetimeTotal) * 0.075 * 100) / 100;
                                    let secondFee =  Math.round((requestAmount - (10000 - lifetimeTotal)) * 0.0375 * 100) / 100;
                                    console.log('10000+')
                                    console.log('first fee: ' + firstFee);
                                    console.log('second fee: ' + secondFee);

                                    userFee = firstFee + secondFee;
                                }
                            } else if (lifetimeTotal > 10000) {
                                userFee = Math.round(requestAmount * 0.0375 * 100) / 100;
                            }

                            newRequestAmount = requestAmount - userFee;
                        }
                        
                        console.log('user fee: ' + userFee);
                        // if user has previous payouts
                        
                        // get total of previous payout
                        // if request is less than the payment after fees
                        // calculate if the partial payment puts the lifetime total below a tier
                        // recalculate the user fee

                        // if it's user's first miletone pay
                        // if request is less than the payment after fees
                        // calculate if the partial payment goes below a tier
                        // recalculate the user fee

                        let milestone = await client.query(`UPDATE job_milestones SET milestone_status = 'Requesting Payment', requested_payment_amount = $2, user_app_fee = $3 WHERE milestone_id = $1 RETURNING *`, [req.body.milestone_id, newRequestAmount.toFixed(2), userFee.toFixed(2)]);
                        await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, `You received a payment request for a milestone in Job ID: ${authorized.rows[0].job_id}`, 'Update']);

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
});

app.post('/api/job/pay', authenticate, subscriptionCheck, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let authorized = await client.query(`SELECT 
                        jobs.job_id, jobs.job_user, 
                        jobs.job_client, 
                        jobs.job_price_currency, 
                        jobs.job_modified_date,
                        job_milestones.balance_txn_id, 
                        job_milestones.charge_id, 
                        job_milestones.requested_payment_amount, 
                        job_milestones.milestone_payment_after_fees, 
                        job_milestones.user_app_fee, 
                        job_milestones.client_app_fee, 
                        job_milestones.charge_id,
                        job_milestones.milestone_payment_amount,
                        users.link_work_id
                    FROM job_milestones
                    LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                    LEFT JOIN users ON users.username = jobs.job_user
                    WHERE milestone_id = $1`, [req.body.milestone_id]);

                    let clientDate = new Date(req.body.job_modified_date).getTime();
                    let serverDate = new Date(authorized.rows[0].job_modified_date).getTime();

                    if (clientDate - serverDate !== 0) {
                        let error = new Error(`Milestone has been modified`);
                        let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                        throw errObj;
                    } else if (authorized.rows[0].job_client === req.session.user.username) {
                        let conditions = await client.query(`SELECT * FROM milestone_conditions WHERE condition_parent_id = $1`, [req.body.milestone_id]);
                        let conditionsComplete = true;

                        for (let condition of conditions.rows) {
                            if (condition.condition_status !== 'Complete') {
                                conditionsComplete = false;
                                break;
                            }
                        }

                        if (conditionsComplete) {
                            let balance = await stripe.balance.retrieveTransaction(authorized.rows[0].balance_txn_id, {expand: ['source.transfer.destination_payment.balance_transaction']});
                            let amount = parseFloat(authorized.rows[0].milestone_payment_after_fees); // Amount before all fees
                            let requestedAmount = parseFloat(authorized.rows[0].requested_payment_amount);
                            //let amount = balance.source.transfer.destination_payment.balance_transaction.net / 100; // Amount after all fees
                            let payment = requestedAmount;
                            let userFee = (balance.source.transfer.destination_payment.balance_transaction.fee - Math.round(parseFloat(authorized.rows[0].client_app_fee) * 100)) / 100;
                            console.log('user fee: ' + userFee);
                            let refundAppFee = 0;
                            
                            // If partial payment is made
                            if (requestedAmount !== amount) {
                                // Refund the entire app fee minus the new fee of partial payment
                                refundAppFee = Math.round((userFee - parseFloat(authorized.rows[0].user_app_fee)) * 100);
                                console.log('app fee refunded: ' + refundAppFee)

                                await stripe.applicationFees.createRefund(balance.source.application_fee, {amount: refundAppFee})
                                .catch(err => error.log(err, req, resp));
                            }

                            payment = Math.round(requestedAmount * 100);
                             
                            let payout = await stripe.payouts.create({
                                amount: payment,
                                currency: balance.source.transfer.destination_payment.balance_transaction.currency,
                            }, {stripe_account: authorized.rows[0].link_work_id})
                            .catch(err => error.log(err, req, resp));

                            console.log(requestedAmount)
                            console.log(amount);

                            if (requestedAmount !== amount) {
                                console.log('refunded: ' + Math.round((amount - requestedAmount - parseFloat(authorized.rows[0].user_app_fee)) * 100));
                                await stripe.refunds.create({
                                    charge: authorized.rows[0].charge_id,
                                    amount: Math.round((amount - requestedAmount - parseFloat(authorized.rows[0].user_app_fee)) * 100),
                                    reason: 'requested_by_customer',
                                    reverse_transfer: true
                                })
                                .catch(err => error.log(err, req, resp));
                            }

                            let milestone = await client.query(`UPDATE job_milestones SET milestone_status = 'Complete', payout_id = $2, milestone_completed_date = current_timestamp, payout_amount = $3, payout_currency = $4, payout_txn_id = $5, payout_date = to_timestamp($6), payout_status = $7, payout_destination = $8, payout_arrival_date = to_timestamp($9) WHERE milestone_id = $1 RETURNING *`, [req.body.milestone_id, payout.id, (payout.amount / 100).toFixed(2), payout.currency, payout.balance_transaction, payout.created, payout.status, payout.destination, payout.arrival_date]);

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

                                review = await client.query(`INSERT INTO user_reviews (reviewer, reviewing, review_job_id) VALUES ($1, $2, $3) ON CONFLICT (reviewer, reviewing) DO UPDATE SET reviewer = EXCLUDED.reviewer RETURNING *`, [authorized.rows[0].job_client, authorized.rows[0].job_user, authorized.rows[0].job_id]);
                                token = await client.query(`INSERT INTO review_tokens (token, token_review_id, token_job_id) VALUES ($1, $2, $3) RETURNING *`, [reviewToken, review.rows[0].review_id, authorized.rows[0].job_id]);

                                review.rows[0] = {...review.rows[0], ...token.rows[0]};
                            } else {
                                await client.query(`UPDATE jobs SET job_status = 'Active' WHERE job_id = $1`, [authorized.rows[0].job_id]);
                            }

                            await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_user, `A ${payment !== balance.source.transfer.destination_payment.balance_transaction.net ? 'partial' : ''} payment amount of $${moneyFormatter(requestedAmount)} has been paid to you for completing a milestone in Job ID: ${authorized.rows[0].job_id}`, 'Update']);
                            await client.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_user, jobComplete ? `You completed a job` : `You completed a milestone`, 'Job']);
                            await client.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, jobComplete ? `You completed a job` : `You completed a milestone`, 'Job']);

                            // email user that a payout was made

                            let conditions = await client.query(`SELECT * FROM milestone_conditions WHERE condition_parent_id = $1`, [req.body.milestone_id]);
                            let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1 ORDER BY filename`, [req.body.milestone_id]);
                    
                            milestone.rows[0]['files'] = files.rows;
                            milestone.rows[0]['balance'] = balance.source.transfer.destination_payment.balance_transaction;
                            milestone.rows[0]['conditions'] = conditions.rows;

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Payout successful', jobComplete: jobComplete, milestone: milestone.rows[0], review: review ? review.rows[0] : null}));
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
});

app.post('/api/job/milestone/start', authenticate, subscriptionCheck, (req, resp) => {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');
                    let authorized = await client.query(`SELECT
                        jobs.job_client,
                        jobs.job_user,
                        jobs.job_title, 
                        jobs.job_id, 
                        jobs.job_modified_date,
                        job_milestones.milestone_id,
                        job_milestones.milestone_payment_amount, 
                        job_milestones.milestone_status,
                        jobs.job_price_currency, 
                        users.user_email, 
                        users.stripe_id,
                        users.link_work_id
                    FROM jobs
                    LEFT JOIN job_milestones ON jobs.job_id = job_milestones.milestone_job_id
                    LEFT JOIN users ON users.username = jobs.job_client
                    WHERE job_id = $1
                    ORDER BY milestone_id`, [req.body.job_id]);

                    if (authorized.rows[0].job_client === req.body.user && req.body.user === req.session.user.username) {
                        let clientDate;
                        let serverDate;

                        // If job has a modified date
                        if (req.body.job_modified_date) {
                            clientDate = new Date(req.body.job_modified_date).getTime();
                            serverDate = new Date(authorized.rows[0].job_modified_date).getTime();

                            // Compare dates to see if they're not equal
                            if (clientDate - serverDate !== 0) {
                                let error = new Error('Job modified, please review');
                                let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                                throw errObj;
                            }
                        }

                        let milestoneInProgress = false;
                        let pendingMilestones = [];

                        // Loop through all milestones
                        for (let milestone of authorized.rows) {
                            // If there is one in progress, stop looping
                            if (milestone.milestone_status === 'In Progress' || milestone.milestone_status === 'Requesting Payment') {
                                milestoneInProgress = true;
                                break;
                            // Or else store id of all "Pending" miletones
                            } else if (milestone.milestone_status === 'Pending') {
                                pendingMilestones.push(milestone.milestone_id);
                            }
                        }
                        
                        // If there is a milestone in progress
                        if (milestoneInProgress) {
                            let error = new Error(`Cannot start milestone while another is in progress`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errObj;
                        // If there first pending milestone id does not match the one sent from client
                        } else if (pendingMilestones[0] !== req.body.id) {
                            let error = new Error(`Milestones must start in sequence`);
                            let errObj = {error: error, type: 'CUSTOM', stack: error.stack};
                            throw errObj;
                        } else {
                            let milestones = await client.query(`SELECT * FROM job_milestones WHERE milestone_job_id = $1 AND milestone_status = 'Pending' ORDER BY milestone_id`, [req.body.job_id]);

                            if (req.body.saveAddress) {
                                await client.query(`UPDATE user_profiles SET user_city = $1, user_region = $2, user_country = $3, user_address = $4, user_city_code = $5 WHERE user_profile_id = $6`, [req.body.token.card.address_city, req.body.token.card.address_state, req.body.token.card.address_country, req.body.token.card.address_line1, req.body.token.card.address_zip, req.session.user.user_id]);
                            }

                            // Check if the milestone ID sent from client matches the next milestone in 'Pending' status
                            // This prevents clients from skipping milestones
                            
                            let user = await client.query(`SELECT jobs.job_user, users.link_work_id FROM job_milestones
                            LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                            LEFT JOIN users ON jobs.job_user = users.username
                            WHERE milestone_id = $1`, [req.body.id]);
                            
                            let lifetime = await client.query(`SELECT SUM(requested_payment_amount) + SUM(user_app_fee) AS total_payout FROM job_milestones
                            LEFT JOIN jobs ON jobs.job_id = job_milestones.milestone_job_id
                            WHERE jobs.job_client = $1 AND job_user = $2
                            AND job_milestones.milestone_status = 'Complete'
                            AND (payout_status != 'failed' OR payout_status != 'canceled')`, [authorized.rows[0].job_client, authorized.rows[0].job_user]);

                            let lifetimeTotal = isNaN(parseFloat(lifetime.rows[0].total_payout)) ? 0 : parseFloat(lifetime.rows[0].total_payout);
                            let amount = parseFloat(milestones.rows[0].milestone_payment_amount);
                            let clientFee = Math.round(amount * 0.03 * 100);
                            let userFee = totalAmount = lifetimeAmount = 0;

                            let firstFee = secondFee = thirdFee = 0;

                            totalAmount = lifetimeTotal + amount;
                            /* console.log('lifetime total: ' + lifetimeTotal);
                            console.log('total amount: ' + totalAmount); */

                            if (lifetimeTotal <= 500) {
                                if (totalAmount <= 500) {
                                    userFee = Math.round(amount * 0.15 * 100);
                                } else if (totalAmount > 500 && totalAmount <= 10000) {
                                    firstFee = Math.round((500 - lifetimeTotal) * 0.15 * 100);
                                    secondFee = Math.round((amount - 500) * 0.075 * 100);
                                    /* console.log('500 - 10000')
                                    console.log('first fee: ' + firstFee)
                                    console.log('second fee: ' + secondFee) */

                                    userFee = firstFee + secondFee;
                                } else if (totalAmount > 10000) {
                                    firstFee = Math.round((500 - lifetimeTotal) * 0.15 * 100);
                                    secondFee = Math.round((10000 - 500) * 0.075 * 100);
                                    thirdFee = Math.round((totalAmount - 10000) * 0.0375 * 100);
                                    /* console.log('10000+')
                                    console.log('first fee: ' + firstFee)
                                    console.log('second fee: ' + secondFee)
                                    console.log('third fee: ' + thirdFee) */

                                    userFee = firstFee + secondFee + thirdFee;
                                }
                            } else if (lifetimeTotal > 500 && lifetimeTotal <= 10000) {
                                if (totalAmount <= 10000) {
                                    userFee = Math.round(amount * 0.075 * 100);
                                } else if (totalAmount > 10000) {
                                    firstFee = Math.round((10000 - lifetimeTotal) * 0.075 * 100);
                                    secondFee = Math.round((totalAmount - 10000) * 0.0375 * 100);
                                    /* console.log('10000+')
                                    console.log('first fee: ' + firstFee)
                                    console.log('second fee: ' + secondFee) */

                                    userFee = firstFee + secondFee;
                                }
                            } else if (lifetimeTotal > 10000) {
                                userFee = Math.round(amount * 0.0375 * 100);
                            }
                            /* } else {
                                if (amount <= 500) {
                                    userFee = Math.round(amount * 0.15 * 100);
                                } else if (amount > 500 && amount <= 10000) {
                                    firstFee = Math.round(500 * 0.15 * 100);
                                    //console.log('500 - 10000');
                                    secondFee = Math.round((amount - 500) * 0.075 * 100);
                                    //console.log('first fee: ' + firstFee)
                                    //console.log('second fee: ' + secondFee)
                                    
                                    userFee = firstFee + secondFee;
                                } else if (amount > 10000) {
                                    firstFee = Math.round(500 * 0.15 * 100);
                                    secondFee = Math.round(9500 * 0.075 * 100);
                                    thirdFee = Math.round((amount - 10000) * 0.0375 * 100);
                                    //console.log('10000+')
                                    //console.log('first fee: ' + firstFee)
                                    //console.log('second fee: ' + secondFee)
                                    //console.log('third fee: ' + thirdFee)

                                    userFee = firstFee + secondFee + thirdFee;
                                }
                            } */

                            //console.log('user fee: ' + userFee);

                            let chargeAmount = amount * 100 + clientFee;
                    
                            let chargeObj = {
                                amount: chargeAmount,
                                application_fee_amount: userFee + clientFee,
                                currency: authorized.rows[0].job_price_currency.toLowerCase(),
                                description: `Funds for job ID: ${req.body.job_id} [${authorized.rows[0].job_title}]`,
                                on_behalf_of: user.rows[0].link_work_id,
                                transfer_data: {
                                    destination: user.rows[0].link_work_id
                                },
                                source: req.body.token.id,
                                receipt_email: authorized.rows[0].user_email,
                                expand: ['transfer.destination_payment.balance_transaction']
                            }

                            if (!req.body.token.object) {
                                chargeObj['customer'] = authorized.rows[0].stripe_id
                            }

                            let charge = await stripe.charges.create(chargeObj)
                            .catch(err => error.log(err, req, resp));
                            //console.log(charge);

                            let milestone = await client.query(`UPDATE job_milestones SET milestone_status = 'In Progress', charge_id = $2, milestone_fund_due_date = to_timestamp($3) + interval '90 days', milestone_start_date = to_timestamp($3), balance_txn_id = $4, milestone_payment_after_fees = $5, client_app_fee = $6, user_app_fee = $7, payout_status = $8, app_fee_id = $9 WHERE milestone_id = $1 RETURNING *`, [
                                req.body.id, 
                                charge.id, 
                                charge.created, 
                                charge.balance_transaction, 
                                (charge.transfer.destination_payment.balance_transaction.net / 100).toFixed(2), 
                                (clientFee / 100).toFixed(2), 
                                (userFee / 100).toFixed(2),
                                charge.transfer.destination_payment.balance_transaction.status,
                                charge.application_fee
                            ]);

                            // Set job status to 'Active' regardless whether it's accepted job or starting another milestone
                            await client.query(`UPDATE jobs SET job_status = 'Active' WHERE job_id = $1`, [req.body.job_id]);

                            // Create notification
                            await client.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, `An amount of $${moneyFormatter(amount * 1.03)} was charged on card ending with ${charge.payment_method_details.card.last4}`, 'Update']);

                            // Add to recent activities
                            await client.query(`INSERT INTO activities (activity_user, activity_action, activity_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, req.body.accept ? `You accepted a job` : `You started a milestone`, 'Job']);

                            // If an expected delivery date is set, add to upcoming events
                            if (req.body.milestone_due_date) {
                                await userEvents.create(client, `Milestone Due Date`, req.body.milestone_due_date, authorized.rows[0].job_user, 'Job', req.body.job_id, `A milestone [ID: ${milestone.milestone_id}] is expected to be delivered`);
                            }

                            // Email user that a milestone has started
                            let message = {
                                to: req.body.email,
                                from: 'admin@hireworld.ca',
                                subject: 'A milestone has begun!',
                                content: `A client has deposited funds for the next milestone in job ID: ${req.body.job_id}. The funds may or may not yet be available. Please ensure that it is available before you begin work. This can take up to 7 days from when you received this email.`,
                                templateId: 'd-9459cc1fde43454ca77670ea97ee2d5a',
                                trackingSettings: {
                                    clickTracking: {
                                        enable: false
                                    }
                                }
                            }

                            sgMail.send(message);

                            await client.query(`INSERT INTO system_events (event_name, event_reference, event_execute_date) VALUES ($1, $2, current_timestamp + interval '60 days')`, ['check_milestone_funds', charge.id]);

                            let conditions = await client.query(`SELECT * FROM milestone_conditions WHERE condition_parent_id = $1`, [req.body.id]);
                            let files = await client.query(`SELECT * FROM milestone_files WHERE file_milestone_id = $1 ORDER BY filename`, [req.body.milestone_id]);
                            
                            milestone.rows[0]['files'] = files.rows;
                            milestone.rows[0]['balance'] = charge.transfer.destination_payment.balance_transaction;
                            milestone.rows[0]['conditions'] = conditions.rows;

                            await client.query('COMMIT')
                            .then(() => resp.send({status: 'success', statusMessage: 'Milestone started', milestone: milestone.rows[0]}));
                        }
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

app.post('/api/job/upload', authenticate, subscriptionCheck, async(req, resp) => {
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
                                await db.query(`INSERT INTO notifications (notification_recipient, notification_message, notification_type) VALUES ($1, $2, $3)`, [authorized.rows[0].job_client, `${authorized.rows[0].job_user} uploaded a file named ${req.body.filename} in Job ID: ${req.body.job_id}`, 'Updated']);

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
});

app.get('/files/:user/:milestone_id/:hash/:filename', authenticate, subscriptionCheck, async(req, resp) => {   
    let file = await db.query(`SELECT * FROM milestone_files
    LEFT JOIN job_milestones
    ON job_milestones.milestone_id = milestone_files.file_milestone_id
    WHERE file_milestone_id = $1`, [req.params.milestone_id]);

    if (req.session.user.username === req.params.user && req.params.user === file.rows[0].file_owner) {
        resp.sendFile(path.resolve(`./job_files/${file.rows[0].milestone_job_id}/${req.params.milestone_id}/${req.params.filename}`));
    } else {
        resp.redirect('/error/file/401');
    }
});

app.post('/api/job/request/close', authenticate, subscriptionCheck, async(req, resp) => {
    let authorized = await db.query(`SELECT job_user FROM jobs WHERE job_id = $1 AND job_status IN ('Requesting Payment', 'Active')`, [req.body.job_id]);

    if (authorized.rows[0].job_user === req.body.user && req.body.user === req.session.user.username) {
        await db.query(`UPDATE jobs SET job_status = 'Requesting Close' WHERE job_id = $1`, [req.body.job_id])
        .then(result => {
            if (result.rowCount === 1) {
                resp.send({status: 'success'});
            } else {
                resp.send({status: 'error', statusMessage: 'Request failed'});
            }
        })
        .catch(err => error.log(err, req, resp));
    } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    }
});

app.post('/api/job/close', authenticate, subscriptionCheck, async(req, resp) => {
    db.connect((err, client, done) => {
        if (err) error.log(err, req, resp);

        (async() => {
            try{
                await client.query('BEGIN');

                let authorized = await client.query(`SELECT job_client FROM jobs WHERE job_id = $1 AND job_status = 'Requesting Close'`, [req.body.job_id]);

                if (authorized.rows[0].job_client === req.body.user && req.body.user === req.session.user.username) {
                    if (req.body.action) {
                        await client.query(`UPDATE jobs SET job_status = 'Closed' WHERE job_id = $1`, [req.body.job_id]);
                        let milestone = await client.query(`SELECT * FROM job_milestones WHERE milestone_job_id = $1 AND milestone_status = 'In Progress'`, [req.body.job_id])
                        let milestones = await client.query(`UPDATE job_milestones SET milestone_status = 'Incomplete' WHERE milestone_job_id = $1 RETURNING milestone_id`, [req.body.job_id]);
                        let milestoneIds = [];

                        

                        for (let milestone of milestones.rows) {
                            milestoneIds.push(milestone.milestone_id);
                        }

                        await client.query(`UPDATE milestone_conditions SET condition_status = 'Incomplete' WHERE condition_parent_id = ANY($1)`, [milestoneIds]);

                        if (milestone.rows.length === 1) {
                            let userFee = Math.round(milestone.rows[0].user_app_fee * 100);
                            let refundAmount = Math.round(parseFloat(milestone.rows[0].milestone_payment_after_fees) * 100) + userFee;

                            await stripe.applicationFees.createRefund(milestone.rows[0].app_fee_id, {amount: userFee})
                            .catch(err => error.log(err, req, resp));

                            await stripe.refunds.create({
                                charge: milestone.rows[0].charge_id,
                                amount: refundAmount,
                                reason: 'requested_by_customer',
                                reverse_transfer: true
                            })
                            .catch(err => error.log(err, req, resp));
                        }
                    } else {
                        await client.query(`UPDATE jobs SET job_status = 'Active' WHERE job_id = $1`, [req.body.job_id]);
                    }

                    await client.query(`COMMIT`)
                    .then(() => resp.send({status: 'success', closed: req.body.action}));
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
});

/* app.post('/api/link-work/bank/verify', authenticate, async(req, resp) => {
    let authorized = await db.query(`SELECT link_work_id FROM users WHERE username = $1`, [req.session.user.username]);

    if (authorized.rows.length > 0) {
        if (authorized.rows[0].link_work_id === req.body.account_id) {
            await stripe.customers.verifySource(
                authorized.rows[0].link_work_id,
                req.body.bank_id,
                {amounts: [req.body.deposit1, req.body.deposit2]}
            )
            .then(account => {
                if (account.status === 'verified') {
                    resp.send({status: 'success', statusMessage: 'Verified'});
                } else if (account.status === 'verification_failed') {
                    resp.send({status: 'error', statusMessage: 'Verification failed'});
                } else if (account.status === 'errored') {
                    resp.send({status: 'error', statusMessage: 'Transfers to the account failed'});
                }
            })
            .catch(err => {
                return error.log(err, req, resp);
            });
        } else {
            resp.send({status: 'error', statusMessage: `That Link Work account does not exist`});
        }
    } else {
        resp.send({status: 'error', statusMessage: `That Link Work account does not exist`});
    }
}); */

module.exports = app;