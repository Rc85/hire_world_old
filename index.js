require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const session = require('cookie-session');
const pug = require('pug');
const path = require('path');
const server = http.createServer(app);
const port = 9999;
const db = require('./modules/db');
const cryptoJS = require('crypto-js');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.set('view engine', 'pug');
app.set('views', ['dist', 'dist/inc']);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: 8.64e+7
}));

app.use(function (req, res, next) {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next();
});

app.use(express.static('dist'));
app.use('/fonts', express.static('src/fonts'));
app.use('/styles', express.static('src/styles'));
app.use('/user_files', express.static('user_files'));
app.use('/images', express.static('images'));
app.use('/webfonts', express.static('webfonts'));

app.use(require('./modules/auth'));
app.use(require('./modules/listings'));

app.use(require('./modules/user/user'));
app.use(require('./modules/user/settings'));
app.use(require('./modules/user/review'));
app.use(require('./modules/user/listings'));
app.use(require('./modules/user/reports'));

app.use(require('./modules/fetch/sectors'));
app.use(require('./modules/fetch/user'));
app.use(require('./modules/fetch/messages'));
app.use(require('./modules/fetch/offers'));
app.use(require('./modules/fetch/listings'));

app.use(require('./modules/message/messages'));
app.use(require('./modules/message/offers'));
app.use(require('./modules/message/jobs'));

app.get('/', (req, resp) => {
    resp.render('index', {user: req.session.user});
});

app.get('/pricing', async(req, resp) => {
    let promo = await db.query(`SELECT * FROM promotions WHERE promo_status = 'Active'`)
    .then(result => {
        if (result) {
            return result.rows[0];
        }
    })
    .catch(err => console.log(err));

    resp.render('pricing', {promo: promo, user: req.session.user});
});

app.get('/how-it-works', (req, resp) => {
    resp.render('how', {user: req.session.user});
});

app.get('/faq', (req, resp) => {
    resp.render('faq', {user: req.session.user});
});

app.get('/activate-account', async(req, resp) => {
    let registrationKey = req.query.key;

    let user = await db.query(`SELECT * FROM users WHERE registration_key = $1 AND reg_key_expire_date > current_timestamp`, [registrationKey])

    if (user && user.rows.length === 1) {
        let decrypted = cryptoJS.AES.decrypt(registrationKey, 'registering for m-ploy');

        if (decrypted.toString(cryptoJS.enc.Utf8) === user.rows[0].user_email) {
            await db.query(`UPDATE users SET user_status = 'Active' WHERE user_id = $1`, [user.rows[0].user_id]);
            resp.render('activated', {header: `Account Activated`, message: `You can now <a href='/mploy/account/login'>login</a> to your account`});
        } else {
            resp.render('activated', {header: '404 Not Found', message: `The content you're looking for cannot be found.`});
        }
    } else {
        resp.render('activated', {header: 'Expired', message: 'The activation button you clicked on has expired.'});
    }
});

app.get('/resend-confirmation', (req, resp) => {
    resp.render('resend');
});

app.post('/resend', async(req, resp) => {
    let user = await db.query(`SELECT * FROM users WHERE user_email = $1`, [req.body.email]);

    if (user && user.rows.length === 1) {
        let registrationKey = cryptoJS.AES.encrypt(req.body.email, 'registering for m-ploy');

        await db.query(`UPDATE users SET registration_key = $1, reg_key_expire_date = current_timestamp + interval '1' day WHERE user_id = $2`, [registrationKey.toString(), user.rows[0].user_id]);

        let message = {
            to: req.body.email,
            from: 'support@m-ploy.org',
            subject: 'Welcome to M-ploy',
            html: `<div style="text-align: center;">In order to start using M-ploy, you need to activate your account. Click on the button below to activate your account.

            <p><a href='http://localhost:9999/activate-account?key=${registrationKey.toString()}'>
                <button type='button' style="background: #007bff; padding: 10px; border-radius: 0.25rem; color: #fff; border: 0px; cursor: pointer;">Activate</button>
            </a></p>
            
            <p><strong>You have 24 hours to activate your account.</strong> You will need to <a href='http://localhost:9999/resend-confirmation'>request a new confirmation email</a> if 24 hours have past.</p>
            
            <p><small><strong>Note:</strong> New confirmation emails may end up in your spam folder.</small></p>
            
            <p><small><a href='https://www.m-ploy.org'>M-ploy.org</a></div>`
        }

        sgMail.send(message);

        resp.render('activated', {header: 'Email Sent', message: 'A new confirmation email has been sent. Check your email and activate your account now.'});
    } else {
        resp.render('activated', {header: '404 Not Found', message: 'That email does not exist in our system.'});
    }
});

app.get('/mploy*', (req, resp) => {
    resp.sendFile(__dirname + '/dist/app.html');
});

/* app.use('/mploy/admin-panel', (req, resp, next) => {
    if (req.session.user && req.session.user.userLevel > 90) {
        next();
    } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    }
}); */

app.use('/api/admin', (req, resp, next) => {
    if (req.session.user && req.session.user.userLevel > 80) {
        next();
    } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    }
});

app.get('/api/admin/privilege', (req, resp) => {
    if (req.session.user && req.session.user.userLevel > 80) {
        resp.send({status: 'success'});
    } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    }
});

app.use(require('./modules/admin/sector'));
app.use(require('./modules/admin/users'));
app.use(require('./modules/admin/listings'));
app.use(require('./modules/admin/reports'));
app.use(require('./modules/admin/configs'));

/* app.get('*', (req, resp) => {
    console.log('here');
    resp.sendFile(`${__dirname}/dist/index.html`);
}); */

server.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(process.env.NODE_ENV);
        console.log(`Server running on port ${port}`);
    }
});