const Discord = require("discord.js");
const User = require("./User");
const RainbowBOT = require("./RainbowBOT");

class Database {
    constructor() {
        /**
         * @type {RainbowBOT}
         */
        this.rbot;
        this.mysql = require('mysql');
        this.connection = this.mysql.createConnection({
            //database: 'rbot_dev',
            host: "82.146.55.116",
            database: 'rbot',
            //host: "127.0.0.1",
            port: 3306,
            user: "rbot",
            password: "ILikeLolis800",
            charset: "utf8mb4_general_ci"
        });
        this.connection.connect(function (err) {
            if (err) throw err;
            console.log("Connected to Database!");
        });
    };
    /**
     * @param {object} user
     * @returns {object}
     */
    parseJsons(user){
        if(user){
            if(user.lolilic && typeof user.lolilic === "string"){
                user.lolilic = JSON.parse(user.lolilic);
            }
            if(user.hent_uses && typeof user.hent_uses === "string"){
                user.hent_uses = JSON.parse(user.hent_uses);
            }
        }
        return user;
    };

    /**
     * @param {Discord.Message} message
     * @returns {Promise<User>}
     */
    registerUser = function(message) {
        /**
         * @type {Database}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            var loli = `{"create_d":0,"void_d":0,"pid":"undefined"}`;
            var hent = `{"last":0,"count":0}`;
            var sql_template = "INSERT INTO `users_info`(`user`, `user_points`, `user_group`, `user_lvl`, `user_xp`, `bitminer1`, `bitminer2`, `bitminer_rack`, `bitm_dc`, `solar_station`, `bm1_time`, `bm2_time`, `bmr_time`, `bitm_dc_time`, `ss_time`, `ban_reason`, `ban_time`, `vip_time`, `discord_id`, `news_sub`, `damage`, `lolilic`, `hent_uses`, `lang`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            var replaces = [message.author.tag, 50000, "Player", 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, message.author.id, "True", 1, loli, hent, "$undef"];
            var sql = this.mysql.format(sql_template, replaces);

            this.connection.query(sql, function (err, rows, fields) {
                if (err) reject(err);
                othis.getUser(message.author.id).then(user => resolve(user));
            });
        });
    };

    update(table, col, value, where_col, where_val){
        /**
         * @type {Database}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            var sql_template = "UPDATE ? SET ?=? WHERE ?=?";
            var replaces = [table, col, value, where_col, where_val];
            var sql = othis.mysql.format(sql_template, replaces);
            othis.db.connection.query(sql, function (err, rows, fields) {
                if (err) reject(err);
                resolve();
            });
        });
    }
    /**
     * @returns {Promise<Discord.Collection<string, User>>}
     */
    getAllUsers(){
        /**
         * @type {Database}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            var coll = new Discord.Collection();
            var sql_template = "SELECT * FROM `users_info`";
            var replaces = [];
            var sql = this.mysql.format(sql_template, replaces);
            this.connection.query(sql, function (err, rows, fields) {
                if (err) reject(err);
                rows.forEach((v, i, a) => {
                    var rw_usr = othis.parseJsons(v);
                    var params = {
                        id: rw_usr.num,
                        discord_id: rw_usr.discord_id,
                        tag: rw_usr.user,
                        group: rw_usr.user_group,
                        points: rw_usr.user_points,
                        lvl: rw_usr.user_lvl,
                        xp: rw_usr.user_xp,
                        miners: {
                            bitminer1: rw_usr.bitminer1,
                            bitminer2: rw_usr.bitminer2,
                            bitminer_rack: rw_usr.bitminer_rack,
                            bitm_dc: rw_usr.bitm_dc,
                            solarStation: rw_usr.solarStation
                        },
                        miners_ts: rw_usr.bm1_time,
                        ban_reason: rw_usr.ban_reason,
                        ban_ts: rw_usr.ban_time,
                        vip_ts: rw_usr.vip_time,
                        isNewsSubbed: rw_usr.news_sub === "True",
                        damage: rw_usr.damage,
                        lolilic: rw_usr.lolilic,
                        hent_uses: rw_usr.hent_uses,
                        lang: rw_usr.lang
                    };
                    coll.set(v.discord_id, new RBotUser(params, othis));
                    if(i === rows.length-1){
                        resolve(coll);
                    }
                });
            });
        });
    };
    /**
     * 
     * @param {string} resolvable Discord ID or Discord Tag
     * @param {number} resolvable User ID
     * @returns {Promise<User>}
     */
    getUser(resolvable) {
        /**
         * @type {Database}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            var sql_template;
            if(typeof resolvable === "string"){
                if(/.*#....$/.test(resolvable)){
                    sql_template = "SELECT * FROM `users_info` WHERE `user` = ?";
                }else if(resolvable.length === 18){
                    sql_template = "SELECT * FROM `users_info` WHERE `discord_id` = ?";
                }else {
                    reject(new Error("Invalid resolvable specified"));
                }
            }else if(typeof resolvable === "number"){
                sql_template = "SELECT * FROM `users_info` WHERE `num` = ?";
            }else {
                reject(new Error("Invalid resolvable specified"));
            }

            var replaces = [resolvable];
            var sql = this.mysql.format(sql_template, replaces);
            this.connection.query(sql, function (err, rows, fields) {
                if (err) throw err;
                if(rows[0]){
                    var rw_usr = othis.parseJsons(rows[0]);
                    var params = {
                        id: rw_usr.num,
                        discord_id: rw_usr.discord_id,
                        tag: rw_usr.user,
                        group: rw_usr.user_group,
                        points: rw_usr.user_points,
                        lvl: rw_usr.user_lvl,
                        xp: rw_usr.user_xp,
                        miners: {
                            bitminer1: rw_usr.bitminer1,
                            bitminer2: rw_usr.bitminer2,
                            bitminer_rack: rw_usr.bitminer_rack,
                            bitm_dc: rw_usr.bitm_dc,
                            solarStation: rw_usr.solarStation
                        },
                        miners_ts: rw_usr.bm1_time,
                        ban_reason: rw_usr.ban_reason,
                        ban_ts: rw_usr.ban_time,
                        vip_ts: rw_usr.vip_time,
                        isNewsSubbed: rw_usr.news_sub === "True",
                        damage: rw_usr.damage,
                        lolilic: rw_usr.lolilic,
                        hent_uses: rw_usr.hent_uses,
                        lang: rw_usr.lang
                    };
                    resolve(new User(params, othis.rbot));
                }else {
                    resolve(null);
                }
            });
        });
    };

    getHentaiPicture = function(id, done) {
        var sql_template = "SELECT * FROM `hentai` WHERE `num` = ?";
        var replaces = [id];
        var sql = this.mysql.format(sql_template, replaces);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows[0]);
        });
    };
    getAllHentai = function(done) {
        var sql_template = "SELECT * FROM `hentai` WHERE 1";
        var replaces = [];
        var sql = this.mysql.format(sql_template, replaces);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows);
        });
    };
    getLastHentai = function (done) {
        var sql_template = "SELECT MAX(num) FROM `hentai`";
        var replaces = [];
        var sql = this.mysql.format(sql_template, replaces);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows[0]["MAX(num)"]);
        });
    };
    getHentaiRange = function (from, to, done) {
        var sql_template = "SELECT * FROM `hentai` WHERE `num` >= ? AND `num` < ?";
        var replaces = [from, to];
        var sql = this.mysql.format(sql_template, replaces);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows);
        });
    };
    getHentaiNums = function (done) {
        var sql_template = "SELECT group_concat(num, '') FROM `hentai`";
        var sql = this.mysql.format(sql_template, []);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows[0]["group_concat(num, '')"].split(",").sort(function (a, b) { return a - b }));
        });
    };
    addHentai = function (hentai, done) {
        var sql_template = "INSERT INTO `hentai` (`num`, `url`, `views`, `likes`, `user`) VALUES(?, ?, ?, ?, ?)";
        var replaces = [hentai.num, hentai.url, 0, 0, hentai.author];
        var sql = this.mysql.format(sql_template, replaces);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done();
        });
    };
    delHentai = function (id, done) {
        var sql_template = "DELETE FROM `hentai` WHERE `num` = ?";
        var replaces = [id];
        var sql = this.mysql.format(sql_template, replaces);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done();
        });
    };
    updateHentai = function (id, hentai, done) {
        var sql_template = "UPDATE `hentai` SET `num`=?,`url`=?,`views`=?,`likes`=?,`user`=? WHERE num=?";
        var replaces = [hentai.num, hentai.url, hentai.views, hentai.likes, hentai.user, id];
        var sql = this.mysql.format(sql_template, replaces);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done();
        });
    };
    getHentaiStats = function (done) {
        var sql_template = "SELECT SUM(likes) FROM `hentai` UNION SELECT SUM(views) FROM `hentai`";
        var sql = this.mysql.format(sql_template, []);
        var othis = this;
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            sql_template = "SELECT * FROM `hentai` WHERE `likes` = (SELECT MAX(likes) FROM `hentai`) UNION SELECT * FROM `hentai` WHERE `views` = (SELECT MAX(views) FROM `hentai`)";
            sql = othis.mysql.format(sql_template, []);
            othis.connection.query(sql, function (err, rows1, fields) {
                if (err) throw err;
                done({
                    likes: rows[0]["SUM(likes)"],
                    views: rows[1]["SUM(likes)"],
                    maxLikes: rows1[0],
                    maxViews: rows1[1]
                });
            });
        });
    };
    writeLog = async function (type, user, server, data, done) {
        var sql_template = "INSERT INTO `logs` (`type`, `user`, `server`, `data`, `unixtime`) VALUES(?, ?, ?, ?, ?)";
        var sql = this.mysql.format(sql_template, [type, user, server, data, Math.floor(new Date() / 1000)]);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            if (done) { done(); }
        });
    };
    getCountLogs = function (type, done) {
        var sql_template = "SELECT COUNT(*) FROM `logs` WHERE `type`=?";
        var sql = this.mysql.format(sql_template, [type]);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows[0]['COUNT(*)']);
        });
    };
    getCountLogsRange = function (type, from, to, done) {
        var sql_template = "SELECT COUNT(*) FROM `logs` WHERE `type`=? AND `unixtime` BETWEEN ? AND ?";
        var sql = this.mysql.format(sql_template, [type, Math.floor(from), Math.floor(to)]);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows[0]['COUNT(*)']);
        });
    };
    getLogsByUser = function (id, done) {
        var sql_template = "SELECT * FROM `logs` WHERE `user`=?";
        var sql = this.mysql.format(sql_template, [id]);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows);
        });
    };
    getLogsCustom = function (params, done) {
        var sql_template = "SELECT * FROM `logs` WHERE 1 ";
        var template = [];
        if(params.id){
            sql_template += "AND `id`=? ";
            template.push(params.id);
        }
        if(params.uid){
            sql_template += "AND `user`=? ";
            template.push(params.uid);
        }
        if(params.server){
            sql_template += "AND `server`=? ";
            template.push(params.server);
        }
        if(params.type !== "all"){
            sql_template += "AND `type`=? ";
            template.push(params.type);
        }
        if(params.from === "last"){
            sql_template += "ORDER BY `id` DESC ";
        }else {
            sql_template += "ORDER BY `id` ";
        }
        sql_template += "LIMIT "+params.count;
        sql_template += " OFFSET "+params.page*params.count;
        var sql = this.mysql.format(sql_template, template);
        this.connection.query(sql, function (err, rows, fields) {
            if (err) throw err;
            done(rows);
        });
    }
    getDBLength = function(done) {
        this.connection.query(`SELECT COUNT(*) FROM \`users_info\` WHERE 1`, function (err, rows, fields) {
            if (err) throw err;
            done(rows[0]["COUNT(*)"]);
        });
    };
}


module.exports = Database;