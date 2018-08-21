const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const session = require('cookie-session');
const server = http.createServer(app);
const port = 9999;
require('dotenv').config();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: 900000
}));

app.use(function (req, res, next) {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next();
});

app.use(express.static('dist'));
app.use('/user_files', express.static('user_files'));

app.use(require('./modules/auth'));

app.use(require('./modules/user/user'));
app.use(require('./modules/user/profile-pic'));
app.use(require('./modules/user/services'));

app.use(require('./modules/admin/category'));

app.use(require('./modules/fetch/categories'));
app.use(require('./modules/fetch/services'));

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