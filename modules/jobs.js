const app = require('express').Router();
const db = require('./db');
const error = require('./utils/error-handler');
const stripe = require('stripe')(process.env.NODE_ENV === 'development' ? process.env.DEV_STRIPE_API_KEY : process.env.STRIPE_API_KEY);

module.exports = {
    accounts: {
        create: () => {
            app.post('/api/job/accounts/create', (req, resp) => {
                if (req.session.user) {
                    
                    /* db.connect((err, client, done) => {
                        if (err) console.log(err);

                        (async() => {
                            try {
                                stripe.accounts.create({
                                    type: 'custom',

                                })
                            }
                        })
                    }) */
                }
            })
        }
    }
}