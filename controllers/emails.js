const db = require('../pg_conf');
const cryptoJS = require('crypto-js');
const sgMail = require('@sendgrid/mail');

module.exports = {
    email: {
        confirmation: {
            resend: async(email) => {
                let encrypted = cryptoJS.AES.encrypt(email, process.env.ACTIVATE_ACCOUNT_SECRET);
                let regKeyString = encrypted.toString();
                let registrationKey = encodeURIComponent(regKeyString);
                
                let message = {
                    to: email,
                    from: {
                        name: 'Hire World',
                        email: 'admin@hireworld.ca'
                    },
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
                        from: {
                            name: 'Hire World',
                            email: 'admin@hireworld.ca'
                        },
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
    }
}