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
const error = require('./modules/utils/error-handler');

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
app.use('/user_files', express.static(`user_files`))

app.use('/images', express.static('src/images'));
app.use('/webfonts', express.static('webfonts'));

app.use(/^\/mploy\/(?!admin-panel).*/, async(req, resp, next) => {
    let status = await db.query(`SELECT config_status FROM site_configs WHERE config_name = 'Site'`);

    if (status.rows[0].config_status === 'Active') {
        next();
    } else {
        resp.render('offline', {header: 'Site Offline', message: 'M-ploy has been brought down for maintenance, please check back later'});
    }
});

app.use(/^\/api\/(?!admin).*/, async(req, resp, next) => {
    let status = await db.query(`SELECT config_status FROM site_configs WHERE config_name = 'Site'`);

    if (status.rows[0].config_status === 'Active') {
        next();
    } else {
        resp.send({status: 'error', statusMessage: 'Site is offline'});
    }
});

app.use(require('./modules/auth'));

app.use(require('./modules/user/user'));
app.use(require('./modules/user/settings'));
app.use(require('./modules/user/review'));
app.use(require('./modules/user/listings'));
app.use(require('./modules/user/reports'));

app.use(require('./modules/fetch/sectors'));
app.use(require('./modules/fetch/user'));
app.use(require('./modules/fetch/messages'));
app.use(require('./modules/fetch/jobs'));
app.use(require('./modules/fetch/listings'));

app.use(require('./modules/message/messages'));
app.use(require('./modules/message/offers'));
app.use(require('./modules/message/jobs'));

app.get('/', async(req, resp) => {
    let announcements = await db.query(`SELECT * FROM announcements`);

    resp.render('index', {user: req.session.user, announcements: announcements.rows});
});

app.get('/pricing', async(req, resp) => {
    let promo = await db.query(`SELECT * FROM promotions WHERE promo_status = 'Active'`)
    .then(result => {
        if (result) {
            return result.rows[0];
        }
    })
    .catch(err => error.log({name: err.name, message: err.message, origin: 'Database', url: req.url}));

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
            resp.render('activated', {header: `Account Activated`, message: `You can now <a href='/mploy'>login</a> to your account`});
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
        let encrypted = cryptoJS.AES.encrypt(req.body.email, 'registering for m-ploy');
        let registrationKey = encrypted.toString();

        await db.query(`UPDATE users SET registration_key = $1, reg_key_expire_date = current_timestamp + interval '1' day WHERE user_id = $2`, [registrationKey, user.rows[0].user_id]);

        let message = {
            to: req.body.email,
            from: 'support@m-ploy.org',
            subject: 'Welcome to Mploy',
            templateId: 'd-4994ab4fd122407ea5ba295506fc4b2a',
            dynamicTemplateData: {
                url: 'localhost:9999',
                regkey: registrationKey
            },
            trackingSettings: {
                clickTracking: {
                    enable: false
                }
            }
        }

        sgMail.send(message);

        resp.render('activated', {header: 'Email Sent', message: 'A new confirmation email has been sent. Check your email and activate your account now.'});
    } else {
        resp.render('activated', {header: '404 Not Found', message: 'That email does not exist in our system.'});
    }
});

app.get('/support', (req, resp) => {
    resp.render('support');
});

app.get('/about', (req, resp) => {
    resp.render('about');
});

app.get('/tos', (req, resp) => {
    resp.render('tos');
});

app.get('/privacy', (req, resp) => {
    resp.render('privacy');
});

app.get('/advertise', (req, resp) => {
    resp.render('advertise');
});

app.get('/contact', (req, resp) => {
    resp.render('contact');
});

app.get(/^\/(m-ploy|m-ploy(\/)?.*)?/, (req, resp) => {
    resp.sendFile(__dirname + '/dist/app.html');
});

/* app.use('/mploy/admin-panel', (req, resp, next) => {
    if (req.session.user && req.session.user.userLevel > 90) {
        next();
    } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    }
}); */

app.post('/api/log-error', (req, resp) => {
    error.log(req.body, status => {
        resp.send({status: status});
    });
});

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

/* app.use('/api/dev', (req, resp, next) => {
    if (req.session.user && req.session.user.userLevel > 90) {
        next();
    } else {
        resp.send({status: 'error', statusMessage: `You're not authorized`});
    }
});

app.use(require('./modules/admin/errors')); */

/* app.get('*', (req, resp) => {
    console.log('here');
    resp.sendFile(`${__dirname}/dist/index.html`);
}); */

server.listen(port, (err) => {
    if (err) {
        error.log({name: err.name, message: err.message, origin: 'Server', url: req.url});
        console.log(err);
    } else {
        console.log(process.env.NODE_ENV);
        console.log(`Server running on port ${port}`);
    }
});