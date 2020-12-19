const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");
const {Item: ItemModel, ItemInstance: ItemInstanceModel} = require("../modules/Models");
const AsciiTable = require("ascii-table");

class Farm {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Farm";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!farm`)) {
                await this.execute(message, user);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {User} user
     * @returns {Promise<Discord.Message>}
     */
    execute(message, user) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            if (args[1]) {
                switch(args[1].toLowerCase()){
                    case "build":{
                        if(args[2]){
                            
                        }else{
                            resolve(message.channel.send("Case ID not specified."));
                        }
                    }
                }
            }else{
                if (user) {
                    var itype = await ItemModel.findOne({
                        where: {
                            type: this.rbot.Utils.itemTypes.Farm
                        }
                    });
                    var items = await ItemInstanceModel.findAll({
                        where:{
                            owner_id: user.id,
                            item_id: itype.get("id")
                        }
                    });

                    

                    var output = "";
                    for(var item of items){
                        var f_case = await Database.getItem(item.get("meta").case, this.rbot);
                        output += `\`\`\`yaml\n`;
                        output += "+" + AsciiTable.alignCenter(`Mining Farm ${item.get("id")}`, 26, "=") + "+\n";
                        output += "|" + AsciiTable.alignLeft(` Case: ${f_case.name}`, 26, " ") + "|\n";
                        for(var i in item.get("meta").slots){
                            output += `|${" ".repeat(26)}|\n`;
                            var card = await Database.getItem(item.get("meta").slots[i], this.rbot);
                            var str = ` Slot${i}: [${card.name} ${card.itemMeta.mining_rate}$/h ${card.instMeta.durability}/100]`;
                            var spl = str.match(/.{1,25}/ig).map(item => item.padEnd(25, " "));
                            for(var s of spl){
                                output += "|" + AsciiTable.alignLeft(s, 26, " ") + "|\n";
                            }
                        }
                        output += `+${"=".repeat(26)}+\n`;
                        output += "\`\`\`\n"
                    }

                    var emb = new Discord.MessageEmbed()
                        .setTitle(`Фермы игрока ${user.tag}:`)
                        .setColor(0x2aa198)
                        .setDescription(output);
    
                    if(output !== ""){
                        resolve(message.channel.send(emb));
                    }else{
                        resolve(message.channel.send("You don't have mining farms!"));
                    }
                    Database.writeLog('farm', message.author.id, message.guild.name, {
                        Message: `User '${message.author.tag}' watched farms of user '${user.tag}'. User farms: '${output}'.`
                    });
                }else{
                    resolve(message.channel.send("User with this ID not found."));
                }
            }
        });
    }
}

module.exports = Farm;