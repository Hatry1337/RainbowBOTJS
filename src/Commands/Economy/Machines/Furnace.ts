import Discord from "discord.js";
import { Op } from "sequelize";
import { Item } from "../../../Models/Economy/Item";
import { ItemStack } from "../../../Models/Economy/ItemStack";
import { Recipe } from "../../../Models/Economy/Recipe";
import { Guild } from "../../../Models/Guild";
import { User } from "../../../Models/User";
import { Colors, Emojis, Utils } from "../../../Utils";
import { IMachine } from "./IMachine";

export class Furnace implements IMachine{
    Name:        string =   "Furnace";
    Code:        string =   "furnace";
    Description: string =   "This machine can melt items.";

    Actions:     string =   "`put <item_code> <amount>` - put items to input buffer\n" +
                            "`stash` - get all items from input buffer\n" + 
                            "`empty` - get all items from output buffer"

    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            await this.Process(user);

            var args = message.content.split(" ").slice(2);

            if(args.length === 0) {
                return this.ShowInterface(message.channel).then(resolve).catch(reject);
            }else{
                switch(args[0]){
                    case "put":{
                        if(!args[1]){
                            return resolve(await Utils.ErrMsg("Item code not specified.", message.channel));
                        }
                        
                        var count = parseInt(args[2]) || 1;
                        
                        if(isNaN(count) || !isFinite(count) || count <= 0){
                            return resolve(await Utils.ErrMsg("Incorrect amount specified.", message.channel));
                        }

                        var inventory = user.Inventory.filter(i => i.Container === "inventory");
                        var itemstack = inventory.find(i => i.Item.Code === args[1]);

                        if(!itemstack){
                            return resolve(await Utils.ErrMsg("You don't have this item.", message.channel));
                        }

                        if(itemstack.Count < count){
                            return resolve(await Utils.ErrMsg("Not enough items in your inventory.", message.channel));
                        }

                        var recipes = await Recipe.findAll({
                            where: {
                                Type: `machine#${this.Code}`
                            },
                            include: [
                                {
                                    model: ItemStack, 
                                    as: 'Result', 
                                    include: [Item]
                                }, 
                                {
                                    model: ItemStack,
                                    as: 'Ingredients', 
                                    include: [Item]
                                }
                            ]
                        });
                        var recipe = recipes.find(r => r.Ingredients.find(i => i.Item.Code === args[1]));

                        if(!recipe){
                            return resolve(await Utils.ErrMsg("This item cannot be melted in furnace.", message.channel));
                        }

                        if(itemstack.Count === count){
                            itemstack.Container = `machine#${this.Code}#input`;
                            await itemstack.save();
                        }else{
                            itemstack.Count -= count;
                            await itemstack.save();
                            await ItemStack.create({
                                Count: count,
                                itemCode: itemstack.itemCode,
                                ownerId: itemstack.ownerId,
                                Container: `machine#${this.Code}#input`
                            });
                        }
                        return this.ShowInterface(message.channel).then(resolve).catch(reject);
                    }
                }
            }
        });
    }

    Process(user: User){
        return new Promise<void>(async (resolve, reject) =>{
            var items = await ItemStack.findAll({
                where: {
                    ownerId: user.ID,
                    Container: `machine#${this.Code}#input`
                },
                include: [Item]
            });
            var recipes = await Recipe.findAll({
                where: {
                    Type: `machine#${this.Code}`
                },
                include: [
                    {
                        model: ItemStack, 
                        as: 'Result', 
                        include: [Item]
                    }, 
                    {
                        model: ItemStack,
                        as: 'Ingredients', 
                        include: [Item]
                    }
                ]
            });
            var ts = new Date();
            var i = items[0];
            if(i){
                if(!i.Meta.ProcessingTimeStamp){
                    i.Meta.ProcessingTimeStamp = new Date();
                    await i.save();
                }
                i.Meta.ProcessingTimeStamp = new Date(i.Meta.ProcessingTimeStamp);
    
                var time = (i.Item.Meta.MeltTime || 60000) * i.Count;
                
                if(ts.getTime() - i.Meta.ProcessingTimeStamp.getTime() > time){
                    var recipe = recipes.find(r => r.Ingredients.find(ing => ing.Item.Code === i.Item.Code));
                    if(!recipe){
                        i.Container = "inventory";
                        i.Meta.ProcessingTimeStamp = undefined;
                        await i.save();
                    }else{
                        await ItemStack.create({
                            Count: recipe.Result.Count * i.Count,
                            itemCode: recipe.Result.itemCode,
                            ownerId: user.ID,
                            Container: `machine#${this.Code}#output`
                        });
                        await i.destroy();
                    }
                }
            }
            resolve();
        });
    }

    ShowInterface(channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel){
        return new Promise<Discord.Message>(async (resolve, reject) =>{
            var inItems = await ItemStack.findAll({
                where: {
                    Container: `machine#${this.Code}#input`
                },
                include: [Item]
            });
            var outItems = await ItemStack.findAll({
                where: {
                    Container: `machine#${this.Code}#output`
                },
                include: [Item]
            });

            var inbuf = "";
            if(inItems[0]){
                inItems[0].Meta.ProcessingTimeStamp = new Date(inItems[0].Meta.ProcessingTimeStamp || 0);
                var prtime = ((inItems[0].Item.Meta.MeltTime || 60000) * inItems[0].Count) - ((new Date()).getTime() - (inItems[0].Meta.ProcessingTimeStamp.getTime()));
                inbuf += `**${inItems[0].Item.Name}** (${inItems[0].Item.Code}) - \`[${inItems[0].Count}]\` [${Utils.formatTime(Math.floor(prtime / 1000))}]\n`;
            }
            inItems.shift();
            for(var i of inItems){
                inbuf += `**${i.Item.Name}** (${i.Item.Code}) - \`[${i.Count}]\`\n`;
            }

            var outbuf = "";
            for(var i of outItems){
                outbuf += `**${i.Item.Name}** (${i.Item.Code}) - \`[${i.Count}]\`\n`;
            }

            var embd = new Discord.MessageEmbed({
                title: `Furnace:`,
                fields: [
                    { name: "Input Buffer", value: inbuf || "Empty" },
                    { name: "Output Buffer", value: outbuf || "Empty" },
                    { name: "Allowed actions", value: this.Actions }
                ],
                color: Colors.Noraml
            });
            return resolve(await channel.send(embd));
        });
    }
}