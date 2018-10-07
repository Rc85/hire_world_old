const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = require('express').Router();
const db = require('../db');

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
        cb(null, file.originalname);
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
                        if (err) console.log(err);

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
        let path = `/${req.file.destination.substring(2)}/${req.file.originalname}`;

        db.query('UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2 RETURNING *', [path, req.session.user.user_id])
        .then(result => {
            if (result !== undefined && result.rowCount === 1) {
                req.session.user.avatar_url = result.rows[0].avatar_url;
                
                resp.send({status: 'success', statusMessage: 'Upload successful', user: result.rows[0]});
            } else if (result.rowCount === 0) {
                resp.send({status: 'error', statusMessage: 'Upload failed'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'error', statusMessage: 'An error occurred'});
        });
    }
});

app.post('/api/user/profile-pic/delete', (req, resp) => {
    if (req.session.user) {
        db.query('UPDATE user_profiles SET avatar_url = $1 WHERE user_profile_id = $2 RETURNING avatar_url', ['/src/images/profile.png', req.session.user.user_id])
        .then(result => {
            if (result !== undefined && result.rowCount === 1) {
                req.session.user.avatar_url = result.rows[0].avatar_url;

                resp.send({status: 'Delete successful'});
            } else if (result.rowCount === 0) {
                resp.send({status: 'Delete failed'});
            }
        })
        .catch(err => {
            console.log(err);
            resp.send({status: 'An error occurred'});
        });
    }
});

app.post('/api/user/edit', (req, resp) => {
    if (req.session.user) {
        let type = req.body.type;
        let value = req.body.value;

        db.connect((err, client, done) => {
            if (err) console.log(err);

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
                console.log(err);
                resp.send({status: `edit ${type} fail`});
            });
        });
    } else {
        resp.send({status: 'error', statusMessage: `You're not logged in`});
    }
});

module.exports = app;