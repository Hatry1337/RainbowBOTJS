const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");
const {Item: ItemModel, ItemInstance: ItemInstanceModel} = require("../modules/Models");
const Item = require("../modules/Items/Item");

class Items {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Items";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!items create`)) {
                if (user.group === "Admin") {
                    await this.execute_creation(message);
                } else {
                    await message.channel.send("У вас нет прав администратора!");
                }
            }else if(message.content.startsWith(`!items`)){
                await this.execute(message);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @returns {Promise<Discord.Message>}
     */
    execute(message) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            var id = message.author.id;
            if (args[1]) {
                id = this.rbot.Utils.parseID(args[1]);
            }
            var user = await Database.getUser(id, this.rbot);

            if (user) {
                var inventory = await user.getInventory();
                
                var output = "";
                for(var i in inventory.RegularSlots){
                    var item = inventory.RegularSlots[i];

                    output += `\`\`\`yaml\n[${item.id}] ${item.name}\n`;
                    switch(item.ctype){
                        case 1:
                            output += `Mining: ${item.itemMeta.mining_rate*60}$/h, Durability: ${item.instMeta.durability}%`;
                            break;
                        
                        case 2:
                            output += `Slots: ${item.itemMeta.slots}`;
                            break;
                    }
                    output += "\`\`\`\n"
                }
                var emb = new Discord.MessageEmbed()
                    .setTitle(`Предметы игрока ${user.tag}:`)
                    .setColor(0x228b22)
                    .setDescription(output);

                resolve(message.channel.send(emb));
                Database.writeLog('items', message.author.id, message.guild.name, {
                    Message: `User '${message.author.tag}' watched items of user '${user.tag}'. User Items: '${output}'.`
                });
            }else{
                resolve(message.channel.send("User with this ID not found."));
            }
        });
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @returns {Promise<Discord.Message>}
     */
    execute_creation(message) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            var id = message.author.id;
            if (!args[2]) {
                resolve(message.channel.send(`\`\`\`Command using:
                !items create <type> ...
                type<vcard>: !items create vcard 
                             <name> 
                             <description> 
                             <cost> 
                             <is_sellable> 
                             <mining_rate>
                type<case>: !items create case 
                             <name> 
                             <description> 
                             <cost> 
                             <is_sellable> 
                             <slots>\`\`\``));
                return;
            }

            var sargs = message.content.split("\n");
            args = sargs[0].split(" ");
            sargs.shift();
            switch(args[2]){
                case "vcard":{
                    await ItemModel.create({
                        name: sargs[0],
                        description: sargs[1],
                        cost: parseInt(sargs[2]),
                        type: this.rbot.Utils.itemTypes.VideoCard,
                        is_sellable: sargs[3] === "1" ? true : false,
                        meta: {
                            mining_rate: parseInt(sargs[4])
                        }
                    });
                    resolve(await message.channel.send("Item created."));
                    break;
                }
                case "case":{
                    await ItemModel.create({
                        name: sargs[0],
                        description: sargs[1],
                        cost: parseInt(sargs[2]),
                        type: this.rbot.Utils.itemTypes.Case,
                        is_sellable: sargs[3] === "1" ? true : false,
                        meta: {
                            slots: parseInt(sargs[4])
                        }
                    });
                    resolve(await message.channel.send("Item created."));
                    break;
                }
                default:{
                    resolve(await message.channel.send("Unknown item type."));
                    break;
                }
            }
        });
    }
}

module.exports = Items;