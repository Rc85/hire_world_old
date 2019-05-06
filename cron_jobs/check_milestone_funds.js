require('dot-env').config();
const db = require('../modules/db');

db.query(`INSERT INTO user_view_count (viewing_user, view_count) VALUES ('roger85', 1) ON CONFLICT (viewing_user) DO UPDATE SET view_count = user_view_count.view_count + 1`);