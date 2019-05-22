require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const session = require('express-session');
const server = http.createServer(app);
const db = require('./pg_conf');
const sgMail = require('@sendgrid/mail');
const error = require('./modules/utils/error-handler');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
let port = process.env.PORT;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({
    verify: function(req, resp, buffer) {
        let url = req.originalUrl;
        
        if (url.startsWith('/stripe-webhooks')) {
            req.rawBody = buffer.toString();
        }
    }
}));

let sessionObj = {
    name: 'hireworld.ca.sid',
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 3600000
    },
    resave: false,
    saveUninitialized: false,
    store: new redisStore({
        client: redis.createClient(),
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    })
}

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionObj.cookie['secure'] = true;
}

app.use(session(sessionObj));

app.use(function (req, res, next) {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next();
});

app.use(express.static('dist'));
app.use('/fonts', express.static('dist/fonts'));
app.use('/styles', express.static('dist/css'));
app.use('/user_files', express.static(`user_files`));
app.use('/images', express.static('dist/images'));
app.use('/file', express.static('./job_files'));

app.use(/^\/(?!admin-panel).*/, async(req, resp, next) => {
    let status = await db.query(`SELECT config_status FROM site_configs WHERE config_name = 'Site'`);

    if (status.rows[0].config_status === 'Active') {
        next();
    } else {
        resp.render('offline', {header: 'Site Offline', message: 'Hire World has been brought down for maintenance, please check back later'});
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
app.use(require('./modules/fetch/configs'));
app.use(require('./modules/fetch/posts'));

app.use(require('./modules/api/messages'));
app.use(require('./modules/api/jobs'));
app.use(require('./modules/api/posts'));

app.get('/*', async(req, resp) => {
    resp.sendFile(__dirname + '/dist/app.html');
});

app.post('/api/site/review', (req, resp) => {
    db.query(`INSERT INTO site_review (reviewer, rating) VALUES ($1, $2)`, [req.session.user.username, req.body.stars])
    .then(result => {
        if (result && result.rowCount === 1) {
            resp.send({status: 'success'});
        } else {
            resp.send({status: 'error', statusMessage: 'Not available at this time'});
        }
    })
    .catch(err => error.log(err, req, resp));
});

app.post('/api/pin', async(req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log(err, req, resp);

            (async() => {
                try {
                    await client.query('BEGIN');

                    let table, pinnedId, pinnedBy, pinnedDate, action, date;;

                    if (req.body.type === 'message') {
                        table = 'pinned_messages';
                        pinnedId = 'pinned_message';
                        pinnedBy = 'message_pinned_by';
                        pinnedDate = 'message_pinned_date';
                    } else if (req.body.type === 'job') {
                        table = 'pinned_jobs';
                        pinnedId = 'pinned_job';
                        pinnedBy = 'job_pinned_by';
                        pinnedDate = 'job_pinned_date';
                    }

                    let exist = await db.query(`SELECT * FROM ${table} WHERE ${pinnedId} = $1 AND ${pinnedBy} = $2`, [req.body.id, req.session.user.username]);

                    if (exist && exist.rows.length === 1) {
                        await client.query(`DELETE FROM ${table} WHERE ${pinnedId} = $1 AND ${pinnedBy} = $2`, [req.body.id, req.session.user.username]);
                        date = null;
                        action = 'delete';
                    } else if (exist && exist.rows.length === 0) {
                        date = await client.query(`INSERT INTO ${table} (${pinnedId}, ${pinnedBy}) VALUES ($1, $2) RETURNING ${pinnedDate}`, [req.body.id, req.session.user.username])
                        .then(result => {
                            return result.rows[0].pinned_date;
                        });

                        action = 'pin';
                    }

                    await client.query('COMMIT')
                    .then(() => resp.send({status: 'success', pinnedDate: date, action: action}));
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

app.post('/api/log-error', (req, resp) => {
    let errorObj = {stack: req.body.stack}
    error.log(errorObj, req, resp, req.body.url);
});

app.use(require('./modules/webhooks'));

server.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(process.env.NODE_ENV);
        console.log(`Server running on port ${port}`);
    }
});