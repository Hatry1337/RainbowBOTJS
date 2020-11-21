const rb = require("./RainbowBOT");

class User{
    /**
     * 
     * @param {object} opts object with RainbowBOT User Options
     * @param {rb} rbot RainbowBOT Object
     */
    constructor(opts, rbot) {
        /**
         * @type {rb}
         * @param rbot RainbowBOT Object
         */
        this.rbot = rbot;

        /** 
          * @type {number}
          * @param id User's ID
          */
        this.id = opts.id || -1;

        /** 
         * @type {number}
         * @param discord_id User's Discord ID
         */
        this.discord_id = opts.discord_id || "-1";

        /** 
         * @type {number}
         * @param tag User's Discord Tag
         */
        this.tag = opts.tag || "Empty#0000";

        /** 
         * @type {number}
         * @param group User's Group
         */
        this.group = opts.group || "Player";

        /** 
         * @type {number}
         * @param points User's Points
         */
        this.points = opts.points || 0;

        /** 
         * @type {number}
         * @param lvl User's Lvl
         */
        this.lvl = opts.lvl || 1;

        /** 
         * @type {number}
         * @param xp User's XP
         */
        this.xp = opts.xp || 0;

        /** 
         * @param {object} miners User's Miners object
         */
        this.miners = opts.miners || {
            bitminer1: 0,
            bitminer2: 0,
            bitminer_rack: 0,
            bitm_dc: 0,
            solarStation: 0
        };

        /** 
         * @type {number}
         * @param miners_ts Mining started timestamp
         */
        this.miners_ts = opts.miners_ts || 0;

        /** 
         * @type {string}
         * @param ban_reason User's Ban reason
         */
        this.ban_reason = opts.ban_reason || 0;

        /** 
         * @type {number}
         * @param ban_ts User's Ban timestamp
         */
        this.ban_ts = opts.ban_ts || 0;

        /** 
         * @type {number}
         * @param vip_ts User's VIP timestamp
         */
        this.vip_ts = opts.vip_ts || 0;

        /** 
         * @type {boolean}
         * @param isNewsSubbed is User subbed on news
         */
        this.isNewsSubbed = opts.isNewsSubbed || true;

        /** 
         * @type {number}
         * @param damage User's Damage
         */
        this.damage = opts.damage || 1;

        /** 
         * @type {object}
         * @param lolilic User's lolilic object
         */
        if(opts.lolilic){
            if(typeof  opts.lolilic === "string"){
                this.lolilic = JSON.parse(opts.lolilic);
            }else {
                this.lolilic = opts.lolilic;
            }
        }

        /** 
         * @type {object}
         * @param hent_uses User's hent_uses object
         */
        if(opts.hent_uses){
            if(typeof  opts.hent_uses === "string"){
                this.hent_uses = JSON.parse(opts.hent_uses);
            }else {
                this.hent_uses = opts.hent_uses;
            }
        }

        /** 
         * @type {string}
         * @param lang User's localization
         */
        this.lang = opts.lang || "en";
    };

    /**
     * @returns {Promise<User>}
     */
    sync(){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            var sql_template = "UPDATE `users_info` SET `user`=?,`user_points`=?,`user_group`=?,`user_lvl`=?,`user_xp`=?,`bitminer1`=?,`bitminer2`=?,`bitminer_rack`=?,`bitm_dc`=?,`solar_station`=?,`bm1_time`=?,`bm2_time`=?,`bmr_time`=?,`bitm_dc_time`=?,`ss_time`=?,`ban_reason`=?,`ban_time`=?,`vip_time`=?,`discord_id`=?,`news_sub`=?,`damage`=?,`lolilic`=?,`hent_uses`=?,`lang`=? WHERE `discord_id`=?";
            var hent = JSON.stringify(othis.hent_uses);
            var loli = JSON.stringify(othis.lolilic);
            var replaces = [othis.tag, othis.points, othis.group, othis.lvl, othis.xp, othis.miners.bitminer1, othis.miners.bitminer2, othis.miners.bitminer_rack, othis.miners.bitm_dc, othis.miners.solar_station, othis.miners_ts, 0, 0, 0, 0, othis.ban_reason, othis.ban_ts, othis.vip_ts, othis.discord_id, othis.news_sub, othis.damage, loli, hent, othis.lang, othis.discord_id];
            var sql = othis.rbot.Database.mysql.format(sql_template, replaces);
            othis.rbot.Database.connection.query(sql, function (err, rows, fields) {
                if (err) reject(err);
                resolve(othis);
            });
        });
    }

    /**
     * @returns {Promise<User>}
     */
    setTag(tag, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.tag = tag;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setGroup(group, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.group = group;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setPoints(points, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.points = points;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setLvl(lvl, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.lvl = lvl;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setXp(xp, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.xp = xp;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setBitm1(count, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.bitminer1 = count;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setBitm2(count, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.bitminer2 = count;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setBitmRack(count, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.bitminer_rack = count;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setBitmDC(count, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.bitm_dc = count;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setSolars(count, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.solarStations = count;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };

    /**
     * @returns {Promise<User>}
     */
    setLang(lng, noSync){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {
            othis.lang = lng;
            if (!noSync) {
                othis.sync().then(usr => resolve(usr));
            }else {
                resolve(othis);
            }
        });
    };

    /**
     * @returns {Promise<User>}
     */
    fetch(){
        /**
         * @type {User}
         */
        var othis = this;
        return new Promise((resolve, reject) => {

            var sql_template;
            var replaces;
            if(othis.id !== -1){
                sql_template = "SELECT * FROM `users_info` WHERE `num` = ?";
                replaces= [othis.id];
            }else if(othis.discord_id !== "-1") {
                sql_template = "SELECT * FROM `users_info` WHERE `discord_id` = ?";
                replaces= [othis.discord_id];
            }else if(othis.tag !== "Empty#0000"){
                sql_template = "SELECT * FROM `users_info` WHERE `user` = ?";
                replaces= [othis.tag];
            }else {
                reject(new Error("No valid parameter to search found"));
            }

            var sql = othis.rbot.Database.mysql.format(sql_template, replaces);
            othis.rbot.Database.connection.query(sql, function (err, rows, fields) {
                if (err) reject(err);
                if(rows[0]){
                    var user = othis.parseJsons(rows[0]);
                    othis.id = user.num;
                    othis.discord_id = user.discord_id;
                    othis.tag = user.user;
                    othis.group = user.user_group;
                    othis.points = user.user_points;
                    othis.lbl = user.user_lvl;
                    othis.xp = user_xp;
                    othis.miners = {
                        bitminer1: user.bitminer1,
                        bitminer2: user.bitminer2,
                        bitminer_rack: user.bitminer_rack,
                        bitm_dc: user.bitm_dc,
                        solarStation: user.solarStation
                    };
                    othis.miners_ts = user.bm1_time;
                    othis.ban_reason = user.ban_reason;
                    othis.ban_ts = user.ban_time;
                    othis.vip_ts = user.vip_time;
                    othis.isNewsSubbed = user.news_sub === "True";
                    othis.damage = user.damage;
                    othis.lolilic = user.lolilic;
                    othis.hent_uses = user.hent_uses;
                    othis.lang = user.lang;
                    resolve(othis);
                }else {
                    reject(new Error("User not found in database"));
                }
            });
        });
    };
}

module.exports = User;