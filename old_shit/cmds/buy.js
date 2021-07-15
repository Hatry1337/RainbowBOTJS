const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");
const {Item: ItemModel, ItemInstance: ItemInstanceModel} = require("../modules/Models");


class Buy {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Buy";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!buy`)) {
                await this.execute(message, user);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {User} user RainbowBOT User object
     * @returns {Promise<Discord.Message>}
     */
    execute(message, user) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");

            if (args[1]) {
                if (!isNaN(args[1]) && parseInt(args[1]) > 0) {
                    var item = await ItemModel.findOne({
                        where:{
                            id: parseInt(args[1])
                        }
                    });
                    if(item){
                        if(item.get("is_sellable")){
                            if(user.money - item.get("cost") >= 0){
                                await user.setMoney(user.money - item.get("cost"));
                                await ItemInstanceModel.create({
                                    owner_id: user.id,
                                    item_id: item.get("id"),
                                    meta: {
                                        durability: 100
                                    }
                                });
                                resolve(message.channel.send(`${this.lng.Buy.buyedSuc[user.lang]} ${item.get("name")} ${this.lng.Buy.buyedFor[user.lang]} ${item.get("cost")}$`));
                            }else{
                                resolve(message.channel.send(`${this.lng.Buy.notEnoughMoney[user.lang]} ${Math.abs(user.money - item.get("cost")).toReadable()}$`));
                            }
                        }else{
                            resolve(message.channel.send(this.lng.Buy.errors.NotSellable[user.lang]));
                        }
                    }else{
                        resolve(message.channel.send(this.lng.Buy.errors.UnknItem[user.lang]));
                    }
                }else{
                    resolve(message.channel.send(this.lng.Buy.errors.InvID[user.lang]));
                }
            }else{
                resolve(message.channel.send(this.lng.Buy.errors.NoID[user.lang]));
            }
        });
    }
}

module.exports = Buy;