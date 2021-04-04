const rb = require("./RainbowBOT");
const {User: UserModel, Item: ItemModel, ItemInstance: ItemInstanceModel} = require("./Models");
const Item = require("./Item");
const Discord = require("discord.js");

class Inventory{
    
}

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
         * @type {string}
         * @param discord_id User's Discord ID
         */
        this.discord_id = opts.discord_id || "-1";

        /** 
         * @type {string}
         * @param tag User's Discord Tag
         */
        this.tag = opts.tag || "Empty#0000";

        /** 
         * @type {string}
         * @param group User's Group
         */
        this.group = opts.group || "Player";

        /** 
         * @type {number}
         * @param money User's Money
         */
        this.money = opts.money || 0;

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
         * @type {object}
         * @param meta User's Meta-Data
         */
        this.meta = opts.meta || {};

        /** 
         * @type {string}
         * @param lang User's localization
         */
        this.lang = opts.lang;
    };

    /**
     * @returns {Promise<User>}
     */
    sync(){
        /**
         * @type {User}
         */
        return new Promise(async (resolve, reject) => {
            await UserModel.update({
                discord_id: this.discord_id,
                tag: this.tag,
                perm_group: this.group,
                money: this.money,
                lvl: this.lvl,
                xp: this.xp,
                meta: this.meta,
                lang: this.lang
            },{
                where: {
                    discord_id: this.discord_id
                }
            });
            resolve(this);
        });
    }

    /**
     * @returns {Promise<User>}
     */
    setTag(tag, noSync){
        return new Promise(async (resolve, reject) => {
            this.tag = tag;
            if (!noSync) {
                await UserModel.update({
                    tag: this.tag
                },{
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }
            resolve(this);
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setGroup(group, noSync){
        return new Promise(async (resolve, reject) => {
            this.group = group;
            if (!noSync) {
                await UserModel.update({
                    perm_group: this.group
                },{
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }
            resolve(this);
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setMoney(money, noSync){
        return new Promise(async (resolve, reject) => {
            this.money = money;
            if (!noSync) {
                await UserModel.update({
                    money: this.money
                },{
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }
            resolve(this);
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setLvl(lvl, noSync){
        return new Promise(async (resolve, reject) => {
            this.lvl = lvl;
            if (!noSync) {
                await UserModel.update({
                    lvl: this.lvl
                },{
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }
            resolve(this);
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setXp(xp, noSync){
        return new Promise(async (resolve, reject) => {
            this.xp = xp;
            if (!noSync) {
                await UserModel.update({
                    xp: this.xp
                },{
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }
            resolve(this);
        });
    };
    /**
     * @returns {Promise<User>}
     */
    setLang(lng, noSync){
        return new Promise(async (resolve, reject) => {
            this.lang = lng;
            if (!noSync) {
                await UserModel.update({
                    lang: this.lang
                },{
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }
            resolve(this);
        });
    };

    /**
     * @returns {Promise<User>}
     */
    ban(time = 60, reason = "No reason.", banned_by = "System"){
        return new Promise(async (resolve, reject) => {
            this.group = "Banned";
            this.meta.ban = {};
            this.meta.ban.bannedAt = Math.floor(new Date() / 1000);
            this.meta.ban.unbannedAt = Math.floor(this.meta.ban.bannedAt + time); 
            this.meta.ban.reason = reason;
            this.meta.ban.bannedBy = banned_by;
            await UserModel.update({
                perm_group: this.group,
                meta: this.meta
            },{
                where: {
                    discord_id: this.discord_id
                }
            });
            resolve(this);
        });
    };

    /**
     * @returns {Promise<User>}
     */
    unban(reason = "No reason.", unbanned_by = "System"){
        return new Promise(async (resolve, reject) => {
            if(this.meta.ban){
                this.group = "Player";
                this.meta.ban.unban = {};
                this.meta.ban.unban.unbannedAt = Math.floor(new Date() / 1000);
                this.meta.ban.unban.reason = reason;
                this.meta.ban.unban.unbanneBy = unbanned_by;
                await UserModel.update({
                    perm_group: this.group,
                    meta: this.meta
                },{
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }
            resolve(this);
        });
    };
    
    /**
     * @returns {Promise<Discord.Collection<number, Item>>}
     */
    getItems(){
        return new Promise(async (resolve, reject) => {
            /**
             * @type {Discord.Collection<number, Item>}
             */
            var itemsCollection = new Discord.Collection();

            var items = await ItemInstanceModel.findAll({
                where: {
                    owner_id: parseInt(this.id)
                }
            });
            for(var i in items){
                if(items[i]){
                    var item = await ItemModel.findOne({
                        where:{
                            id: items[i].get("item_id")
                        }
                    });
                    var params = {
                        id:             items[i].get("id"),
                        owner_id:       items[i].get("owner_id"),
                        type_id:        items[i].get("item_id"),
                        ctype:          item.get("type"),
                        name:           item.get("name"),
                        description:    item.get("description"),
                        cost:           item.get("cost"),
                        isSellable:     item.get("is_sellable"),
                        itemMeta:       item.get("meta"),
                        instMeta:       items[i].get("meta"),
                    }

                    itemsCollection.set(params.id, new Item(params, this.rbot));
                }
            }
            resolve(itemsCollection);
        });
    };

    /**
     * @returns {Promise<User>}
     */
    fetch(){
        return new Promise(async (resolve, reject) => {
            var usr;
            if(this.id !== -1){
                usr = await UserModel.findOne({
                    where: {
                        id: this.id
                    }
                });
            }else if(this.discord_id !== "-1") {
                usr = await UserModel.findOne({
                    where: {
                        discord_id: this.discord_id
                    }
                });
            }else if(this.tag !== "Empty#0000"){
                usr = await UserModel.findOne({
                    where: {
                        tag: this.tag
                    }
                });
            }else {
                reject(new Error("No valid parameter to search found"));
            }
            if(usr){
                this.id =           usr.get("id");
                this.discord_id =   usr.get("discord_id");
                this.tag =          usr.get("tag");
                this.group =        usr.get("perm_group");
                this.money =        usr.get("money");
                this.lvl =          usr.get("lvl");
                this.xp =           usr.get("xp");
                this.lang =         usr.get("lang");
                resolve(this);
            }else {
                reject(new Error("User not found in database"));
            }
        });
    };
}

module.exports = User;