const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = require('express').Router();
const db = require('../db');
const error = require('../utils/error-handler');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = `./user_files/${req.session.user.user_id}`;

        if (fs.existsSync(dir)) {
            cb(null, dir);
        } else {
            return cb(new Error('DIR_NOT_EXIST'));
        }
    },
    filename: (req, file, cb) => {
        cb(null, `profile_pic.jpg`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2000000
    },
    fileFilter: (req, file, cb) => {
        let extension = path.extname(file.originalname);
        let extCheck = /.(jpg|jpeg|png|gif)$/;
        let filesize = parseInt(req.headers['content-length']);
        let dir = `./user_files/${req.session.user.user_id}`;

        if (extCheck.test(extension)) {
            if (filesize < 2000000) {
                if (fs.existsSync(dir)) {
                    cb(null, true);
                } else {
                    fs.mkdir(dir, (err) => {
                        if (err) error.log({name: err.name, message: err.message, origin: 'fs Creating Directory', url: req.url});

                        return cb(null, true);
                    })
                }
            } else {
                return cb(new Error('FILE_SIZE_EXCEEDED'));
            }
        } else {
            return cb(new Error('INVALID_FILE_TYPE'));
        }
    }
});

app.post('/api/user/profile-pic/upload', upload.single('profile_pic'), (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({err: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            let filePath = `/${req.file.destination.substring(2)}/profile_pic.jpg`;

            (async() => {
                try {
                    await client.query('BEGIN');
                    await client.query(`UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2`, [filePath, req.session.user.user_id]);

                    let user = await client.query(`SELECT users.username, users.user_email, users.user_last_login, user_profiles.* FROM users LEFT JOIN user_profiles ON user_profiles.user_profile_id = users.user_id WHERE user_id = $1`, [req.session.user.user_id]);

                    await client.query('COMMIt')
                    .then(() => resp.send({status: 'success', user: user.rows[0]}));
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    done();
                }
            })()
            .catch(err => {
                error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            });
        });
    }
});

app.post('/api/user/profile-pic/delete', (req, resp) => {
    if (req.session.user) {
        db.query('UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2 RETURNING *', ['/src/images/profile.png', req.session.user.user_id])
        .then(result => {
            if (result !== undefined && result.rowCount === 1) {
                req.session.user.avatar_url = result.rows[0].avatar_url;

                resp.send({status: 'success', user: result.rows[0]});
            } else if (result.rowCount === 0) {
                resp.send({status: 'error', statusMessage: 'An error occurred'});
            }
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    }
});

app.post('/api/user/edit', (req, resp) => {
    if (req.session.user) {
        let type = req.body.type;
        let value = req.body.value;
        let valueCheck = /[a-zA-Z0-9/'".:]*/;

        if (valueCheck.test(value)) {
            db.connect((err, client, done) => {
                if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

                (async() => {
                    try {
                        await client.query(`BEGIN`);
                        await client.query(`UPDATE user_profiles SET ${type} = $1 WHERE user_profile_id = $2`, [value, req.session.user.user_id]);

                        let user = await client.query(`SELECT * FROM users
                        LEFT JOIN user_profiles ON users.user_id = user_profiles.user_profile_id
                        LEFT JOIN user_settings ON users.user_id = user_settings.user_setting_id
                        WHERE users.user_id = $1`, [req.session.user.user_id]);

                        await client.query(`COMMIT`)
                        .then(() => resp.send({status: `edit ${type} success`, user: user.rows[0]}));
                    } catch (e) {
                        await client.query(`ROLLBACK`);
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    resp.send({status: `edit ${type} fail`});
                });
            });
        } else {
            resp.send({status: 'error', statusMessage: 'Invalid characters'});
        }
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/search/titles', async(req, resp) => {
    //let searchValue = new RegExp('\\b' + req.body.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');

    await db.query(`SELECT user_title FROM user_profiles WHERE user_title ILIKE $1`, [`%${req.body.value}%`])
    .then(result => {
        if (result) {
            let titles = [];

            if (result.rows.length > 0) {
                for (let title of result.rows) {
                    titles.push(title.user_title);
                }
            }

            resp.send({status: 'success', titles: titles});
        }
    })
    .catch(err => {
        error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
        resp.send({status: 'error', statusMessage: 'An error occurred'});
    });
});

app.post('/api/user/business_hours/save', (req, resp) => {
    if (req.session.user) {
        db.connect((err, client, done) => {
            if (err) error.log({name: err.name, message: err.message, origin: 'Database Connection', url: '/'});

            delete req.body.status;
            delete req.body.showSettings;

            let timeCheck = /^([0-9]|[1-2][0-4]):[0-5][0-9](\s?(AM|am|PM|pm))?(\s[A-Za-z]{3,5})?$/;
            let invalidFormat = false;

            for (let key in req.body) {
                if (req.body[key] !== 'Closed') {
                    let times = req.body[key].split(' - ');

                    if (times.length !== 2) {
                        invalidFormat = true;
                        break;
                    } else {
                        for (let time of times) {
                            if (!timeCheck.test(time)) {
                                invalidFormat = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (invalidFormat) {
                resp.send({status: 'error', statusMessage: 'Invalid time format'});
            } else {
                (async() => {
                    try {
                        await client.query('BEGIN');

                        await client.query(`INSERT INTO business_hours (monday, tuesday, wednesday, thursday, friday, saturday, sunday, business_owner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (business_owner) DO UPDATE SET monday = $1, tuesday = $2, wednesday = $3, thursday = $4, friday = $5, saturday = $6, sunday = $7`, [req.body.mon, req.body.tue, req.body.wed, req.body.thu, req.body.fri, req.body.sat, req.body.sun, req.session.user.username]);

                        await client.query('COMMIT')
                        .then(() => resp.send({status: 'success', statusMessage: 'Business hours saved'}));
                    } catch (e) {
                        await client.query('ROLLBACK');
                        throw e;
                    } finally {
                        done();
                    }
                })()
                .catch(err => {
                    error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
                    resp.send({status: 'error', statusMessage: 'An error occurred'});
                });
            }
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

app.post('/api/user/notifications/viewed', async(req, resp) => {
    if (req.session.user) {
        await db.query(`UPDATE notifications SET notification_status = 'Viewed' WHERE notification_recipient = $1`, [req.session.user.username])
        .then(result => {
            if (result) {
                resp.send({status: 'success'});
            }
        })
        .catch(err => {
            error.log({name: err.name, message: err.message, origin: 'Database Query', url: req.url});
            resp.send({status: 'error'});
        });
    }
});

module.exports = app;