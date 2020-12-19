const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const {Item: ItemModel} = require("../modules/Models");

class Shop {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Shop";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!shop`)) {
                await this.execute(message, user);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @returns {Promise<Discord.Message>}
     */
    execute(message, user) {
        return new Promise(async (resolve, reject) => {
            var cards = await ItemModel.findAll({
                where:{
                    type: this.rbot.Utils.itemTypes.VideoCard
                }
            });

            var cards_field = "";
            for(var i in cards){
                if(cards[i].get("is_sellable")){
                    cards_field += `[${cards[i].get("id")}] ${cards[i].get("name")} - ${cards[i].get("description")}\n`;
                    cards_field += `${this.lng.shop.cost[user.lang]}: ${cards[i].get("cost").toReadable()}$; ${this.lng.shop.speed[user.lang]}: ${cards[i].get("meta").mining_rate*60}$/${this.lng.shop.hour[user.lang]}\n\n`;    
                }
            }

            var cases = await ItemModel.findAll({
                where:{
                    type: this.rbot.Utils.itemTypes.Case
                }
            });

            var cases_field = "";
            for(var i in cases){
                if(cases[i].get("is_sellable")){
                    cases_field += `[${cases[i].get("id")}] ${cases[i].get("name")} - ${cases[i].get("description")}\n`;
                    cases_field += `${this.lng.shop.cost[user.lang]}: ${cases[i].get("cost").toReadable()}$; ${this.lng.shop.slots[user.lang]}: ${cases[i].get("meta").slots}\n\n`;
                }
            }

            var fields = [];
            if(cards_field !== ""){
                fields.push({
                    name: this.lng.shop.fields.videocards.name[user.lang],
                    value: cards_field
                });
            }
            if(cases_field !== ""){
                fields.push({
                    name: this.lng.shop.fields.cases.name[user.lang],
                    value: cases_field
                });
            }

            var emb = new Discord.MessageEmbed()
                .setTitle(this.lng.shop.name[user.lang])
                .setColor(0xFFFF00)
                .setDescription(this.lng.shop.description[user.lang])
                .addFields(fields);

            resolve(message.channel.send(emb));
            Database.writeLog('shop', message.author.id, message.guild.name, {
                Message: `User '${message.author.tag}' watched shop.`
            });
        });
    }
}

module.exports = Shop;