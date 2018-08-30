const app = require('express').Router();
const db = require('../db');
const moment = require('moment');

app.post('/api/get/user', async(req, resp) => {
    let user = await db.query(`SELECT user_id, username, user_email, user_created_on, avatar_url, user_title, user_education, user_bio, user_github, user_twitter, user_facebook, user_website, user_linkedin, user_firstName, user_lastname, user_instagram, business_name, user_phone, user_address, hide_email, display_business_name, display_fullname, display_contacts FROM users WHERE username = $1 AND user_status = 'Active'`, [req.body.username])
    .then(result => {
        return result;
    })
    .catch(err => {
        console.log(err);
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });

    if (user !== undefined) {
        if (user.rows.length === 1) {
            if (user.rows[0].hide_email === true) {
                delete user.rows[0].user_email;
            }

            if (!user.rows[0].display_business_name) {
                delete user.rows[0].business_name;
            }

            if (!user.rows[0].display_fullname) {
                delete user.rows[0].user_firstname;
                delete user.rows[0].user_lastname;
            }

            if (!user.rows[0].display_contacts) {
                delete user.rows[0].user_phone;
                delete user.rows[0].user_address;
            }

            delete user.rows[0].hide_email;
            delete user.rows[0].display_business_name;
            delete user.rows[0].display_fullname;
            delete user.rows[0].display_contacts;

            user.rows[0].user_created_on = moment(user.rows[0].user_created_on).fromNow();

            await db.query(`SELECT * FROM user_services WHERE service_provided_by = $1 AND service_status = 'Active' ORDER BY service_id`, [req.body.username])
            .then(result => {
                if (result !== undefined) {
                    for (let i in result.rows) {
                        result.rows[i].service_created_on = moment(result.rows[i].service_created_on).fromNow();
                    }

                    resp.send({status: 'success', user: user.rows[0], services: result.rows});
                }
            })
            .catch(err => {
                console.log(err);
                resp.send({status: 'error', statusMessage: `An error occurred while trying to retrieve the user's profile`});
            });
        } else {
            resp.send({status: 'error', statusMessage: `The requested user's profile does not exist`});
        }
    }
});

module.exports = app;