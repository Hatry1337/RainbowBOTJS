class Database {
    constructor() {
        this.sqlite = require('sqlite3').verbose();
        this.db = new this.sqlite.Database('./database.db');
    };
    getDBLength = function(done) {
        this.db.all(`SELECT * FROM users_info`, [], (err, rows) => {
            if (err) {
                throw err;
            }
            done(rows.length);
            return rows.length;
        });
    };
    registerUser = function(message, done) {
        var othis = this;
        this.getDBLength(function (dbLength) {
            othis.db.run(`INSERT INTO users_info VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [message.author.tag, 50000, "Player", 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, dbLength + 1, message.author.id, "True", 1, null, null, null], function (err) {
                if (err) {
                    return console.log(err.message);
                }
                done();
            });
        });
    };
    getAllUsers = function(done) {
        this.db.all(`SELECT * FROM users_info`, [], (err, rows) => {
            if (err) {
                throw err;
            }
            done(rows);
            return rows;
        });
    };
    getUserByDiscordID = function(id, done) {
        this.db.all(`SELECT * FROM users_info WHERE discord_id = ?`, [id], (err, rows) => {
            if (err) {
                throw err;
            }
            done(rows[0]);
            return rows[0];
        });
    };
    getUserByLocalID = function(id, done) {
        this.db.all(`SELECT * FROM users_info WHERE num = ?`, [id], (err, rows) => {
            if (err) {
                throw err;
            }
            done(rows[0]);
            return rows[0];
        });
    };
    getUserByName = function(name, done) {
        this.db.all(`SELECT * FROM users_info WHERE user = ?`, [name], (err, rows) => {
            if (err) {
                throw err;
            }
            done(rows[0]);
            return rows[0];
        });
    };
    updateUser = function(id, newUser, done) {
        this.db.run(`UPDATE users_info SET user=?, user_points=?, user_group=?, user_lvl=?, user_xp=?, bitminer1=?, bitminer2=?, bitminer_rack=?, bitm_dc=?, solar_station=?, bm1_time=?, bm2_time=?, bmr_time=?, bitm_dc_time=?, ss_time=?, ban_reason=?, ban_time=?, vip_time=?, num=?, discord_id=?, news_sub=?, damage=?, lolilic=?, hent_uses=?, lang=? WHERE discord_id = ?`, [newUser.user, newUser.user_points, newUser.user_group, newUser.user_lvl, newUser.user_xp, newUser.bitminer1, newUser.bitminer2, newUser.bitminer_rack, newUser.bitm_dc, newUser.solar_station, newUser.bm1_time, 0, 0, 0, 0, newUser.ban_reason, newUser.ban_time, newUser.vip_time, newUser.num, newUser.discord_id, newUser.news_sub, newUser.damage, newUser.lolilic, newUser.hent_uses, newUser.lang, id], function (err) {
            if (err) {
                return console.log(err.message);
            }
            done();
        });
    };
}

module.exports.Database = Database;