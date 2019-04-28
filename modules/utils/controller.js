const db = require('../db');
const cryptoJS = require('crypto-js');
const sgMail = require('@sendgrid/mail');
const error = require('./error-handler');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
    session: {
        retrieve: async(client, id) => {
            if (!client) {
                client = db;
            }

            let user = await client.query(`SELECT
                users.username,
                users.user_email,
                users.account_type,
                users.user_status,
                users.is_subscribed,
                users.plan_id,
                users.user_last_login,
                users.user_level,
                users.subscription_end_date,
                users.connected_acct_status,
                users.connected_id,
                users.has_connected_bank_acct,
                users.bank_acct_verified,
                user_profiles.*,
                user_settings.*,
                user_listings.listing_status
            FROM users
            LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id
            LEFT JOIN user_settings ON user_settings.user_setting_id = users.user_id
            LEFT JOIN user_listings ON users.username = user_listings.listing_user
            WHERE users.user_id = $1
            ORDER BY user_listings.listing_status = 'Active'
            LIMIT 1`, [id])
            
            if (user && user.rows.length === 1) {
                return user.rows[0];
            } else {
                return false;
            }
        }
    },
    email: {
        confirmation: {
            resend: async(email) => {
                let encrypted = cryptoJS.AES.encrypt(email, process.env.ACTIVATE_ACCOUNT_SECRET);
                let regKeyString = encrypted.toString();
                let registrationKey = encodeURIComponent(regKeyString);
                
                let message = {
                    to: email,
                    from: 'admin@hireworld.ca',
                    subject: 'Welcome to Hire World',
                    templateId: 'd-4994ab4fd122407ea5ba295506fc4b2a',
                    dynamicTemplateData: {
                        url: process.env.SITE_URL,
                        regkey: registrationKey
                    },
                    trackingSettings: {
                        clickTracking: {
                            enable: false
                        }
                    }
                }
                
                sgMail.send(message);

                return regKeyString;
            }
        },
        password: {
            reset: async(email, callback) => {
                let encrypted = cryptoJS.AES.encrypt(email, process.env.RESET_PASSWORD_SECRET);
                let resetKeyString = encrypted.toString();
                let resetKey = encodeURIComponent(resetKeyString);

                let user = await db.query(`SELECT username FROM users WHERE user_email = $1`, [email]);
                await db.query(`INSERT INTO reset_passwords(reset_user, reset_key) VALUES ($1, $2) ON CONFLICT (reset_user) DO UPDATE SET reset_key = $2, reset_expires = current_timestamp + interval '1 day'`, [user.rows[0].username, resetKeyString])
                .then(() => {
                    let message = {
                        to: email,
                        from: 'admin@hireworld.ca',
                        subject: 'Reset Password',
                        templateId: 'd-d299977ec2404a5d9952b08a21576be5',
                        dynamicTemplateData: {
                            url: `${process.env.SITE_URL}/reset-password/${resetKey}`
                        },
                        trackingSettings: {
                            clickTracking: {
                                enable: false
                            }
                        }
                    }
                    
                    sgMail.send(message)
                    .then(() => callback())
                    .catch(err => callback(err));
                })
                .catch(err => {
                    if (err.code === '23505') {
                        callback(err, 'An error occurred, please try again');
                    } else {
                        callback(err);
                    }
                });
            }
        }
    },
    conversations: {
        delete: async(id, req, callback) => {
            let authorized = await db.query(`SELECT conversation_starter, conversation_recipient FROM conversations WHERE conversation_id = $1`, [id]);

            if (req.session.user.username === authorized.rows[0].conversation_recipient || req.session.user.username === authorized.rows[0].conversation_starter) {
                await db.query(`INSERT INTO deleted_conversations (deleted_convo, convo_deleted_by) VALUES ($1, $2)`, [id, req.session.user.username])
                .then(result => {
                    if (result && result.rowCount === 1) {
                        callback('success', 'Message deleted');
                    }
                })
                .catch(err => {
                    error.log(err, req);
                    callback('error', 'An error occurred');
                });
            } else {
                callback('error', `You're not authorized`);
            }
        }
    },
    user: {
        retrieve: async(id) => {
            
        }
    },
    blockedUsers: {
        retrieve: async(req, callback) => {
            let filterValue = '';
            let filterString = '';

            if (req.body.letter !== 'All') {
                if (req.body.letter === '#') {
                    filterValue = '0-9';
                } else if (req.body.letter === '_') {
                    filterValue = '_';
                } else if (req.body.letter === '-') {
                    filterValue = '-';
                } else if (/[a-zA-Z]/.test(req.body.letter)) {
                    filterValue = req.body.letter;
                }

                filterString = `AND blocked_users.blocked_user ~ '^[${filterValue}${filterValue.toLowerCase()}]'`;
            }

            let totalBlockedUsers = await db.query(`SELECT COUNT(blocked_user_id) AS count FROM blocked_users
            WHERE blocking_user = $1
            ${filterString}
            OFFSET $2
            LIMIT 30`, [req.session.user.username, req.body.offset]);

            await db.query(`SELECT blocked_user FROM blocked_users  
            WHERE blocking_user = $1
            ${filterString}
            ORDER BY blocking_user
            OFFSET $2
            LIMIT 30`, [req.session.user.username, req.body.offset])
            .then(result => {
                if (result) {
                    callback({status: 'success', statusMessage: 'User blocked', users: result.rows, totalBlockedUser: totalBlockedUsers.rows[0].count});
                } else {
                    callback({status: 'error', statusMessage: 'Failed to retrieve blocked users list'});
                }
            })
            .catch(err => callback({status: 'error', statusMessage: 'An error occurred', error: err}));
        }
    }
}