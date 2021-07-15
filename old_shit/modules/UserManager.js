const User = require("./User")
const Item = require("./Items/Item");
const RainbowBOT = require("./RainbowBOT");

const {User: UserModel, Item: ItemModel, Log: LogModel, ItemInstance: ItemInstanceModel} = require("./Models");
const Discord = require("discord.js");


class UserManager {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.rbot = rbot;
    }

    /**
     * 
     * @param {string | number} resolvable User resolvable
     * @returns {Promise<User>}
     */
    FetchUser(resolvable){
        return new Promise(async (resolve, reject) => {
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
                resolve(new User(params, this.rbot));
            }else {
                resolve(null);
            }
        });
    }

    /**
     * 
     * @param {Discord.User} user Discord user
     * @returns {Promise<User>}
     */
    RegisterUser(user){
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
                isNewsSubbed: true,
                mining: {
                    btc: 0,
                    eth: 0,
                    power: 0,
                    power_enabled: true
                }
            }

            await UserModel.create({
                discord_id: user.id,
                tag: user.tag,
                meta: meta
            });
            resolve(await this.FetchUser(user.id, this.rbot));
        });
    }
}

module.exports = UserManager;