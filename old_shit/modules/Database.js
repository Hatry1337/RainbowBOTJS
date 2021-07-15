const User = require("./User")
const Item = require("./Items/Item");
const RainbowBOT = require("./RainbowBOT");

const {User: UserModel, Item: ItemModel, Log: LogModel, ItemInstance: ItemInstanceModel} = require("./Models");
const { Message } = require("discord.js");

module.exports = {
    /**
     * 
     * @param {string} resolvable Discord ID or Discord Tag
     * @param {number} resolvable User ID
     * @param {RainbowBOT} rbot RainbowBOT Object 
     * @returns {Promise<User>}
     */
    getUser(resolvable, rbot) {
        return new Promise(async (resolve, reject) => {
            if(!rbot) reject(new Error("No RainbowBOT object provided."));

            var usr;
            if(typeof resolvable === "string"){
                if(/.*#....$/.test(resolvable)){
                    usr = await UserModel.findOne({
                        where: {
                            tag: resolvable
                        }
                    });
                }else if(resolvable.length === 18){
                    usr = await UserModel.findOne({
                        where: {
                            discord_id: resolvable
                        }
                    });
                }else {
                    reject(new Error("Invalid resolvable specified"));
                }
            }else if(typeof resolvable === "number"){
                usr = await UserModel.findOne({
                    where: {
                        id: parseInt(resolvable)
                    }
                });
            }else {
                reject(new Error("Invalid resolvable specified"));
            }
            if(usr){
                var params = {
                    id:             usr.get("id"),
                    discord_id:     usr.get("discord_id"),
                    tag:            usr.get("tag"),
                    group:          usr.get("perm_group"),
                    money:          usr.get("money"),
                    lvl:            usr.get("lvl"),
                    xp:             usr.get("xp"),
                    items:          usr.get("items"),
                    meta:           usr.get("meta"),
                    lang:           usr.get("lang")
                };
                resolve(new User(params, rbot));
            }else {
                resolve(null);
            }
        });
    },
    /**
     * 
     * @param {number} id Item ID
     * @param {RainbowBOT} rbot RainbowBOT Object 
     * @returns {Promise<Item>}
     */
    getItem(id, rbot) {
        return new Promise(async (resolve, reject) => {
            var item_instance = await ItemInstanceModel.findOne({
                where: {
                    id: parseInt(id)
                }
            });
            if(item_instance){
                var item = await ItemModel.findOne({
                    where:{
                        id: item_instance.get("item_id")
                    }
                });
                var params = {
                    id:             item_instance.get("id"),
                    owner_id:       item_instance.get("owner_id"),
                    type_id:        item_instance.get("item_id"),
                    ctype:          item.get("type"),
                    name:           item.get("name"),
                    description:    item.get("description"),
                    cost:           item.get("cost"),
                    isSellable:     item.get("is_sellable"),
                    itemMeta:       item.get("meta"),
                    instMeta:       item_instance.get("meta"),
                }
                resolve(new Item(params, rbot));
            }else {
                resolve(null);
            }
        });
    },
    /**
     * 
     * @param {Message} id Message
     * @param {RainbowBOT} rbot RainbowBOT Object 
     * @returns {Promise<User>}
     */
    registerUser(message, rbot) {
        return new Promise(async (resolve, reject) => {
            var meta = {
                lolilic: {
                    create_d:0,
                    void_d:0,
                    pid: "undefined"
                },
                hentai: {
                    last:0,
                    count:0
                },
                isNewsSubbed: true
            }

            await UserModel.create({
                discord_id: message.author.id,
                tag: message.author.tag,
                meta: meta
            })
            resolve(await this.getUser(message.author.id, rbot));
        });
    },
    async writeLog(type, user, server, data) {
        await LogModel.create({
            type: type,
            user: user,
            server: server,
            data: data,
            timestamp: new Date(),
            unixtime: Math.floor((new Date()) / 1000)
        })
    }
}