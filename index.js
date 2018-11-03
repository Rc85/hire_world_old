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

app.use(require('./modules/fetch/sectors'));
app.use(require('./modules/fetch/user'));
app.use(require('./modules/fetch/messages'));
app.use(require('./modules/fetch/offers'));
app.use(require('./modules/fetch/listings'));

app.use(require('./modules/message/messages'));
app.use(require('./modules/message/offers'));
app.use(require('./modules/message/jobs'));

app.get('/', (req, resp) => {
    console.log(req.session.user);
    resp.render('index', {user: req.session.user});
});

app.get('/pricing', async(req, resp) => {
    let promo = await db.query(`SELECT * FROM promotions WHERE promo_name = '30 Days Free'`)
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