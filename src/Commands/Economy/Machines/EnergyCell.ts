import Discord from "discord.js";
import { Item } from "../../../Models/Economy/Item";
import { ItemStack } from "../../../Models/Economy/ItemStack";
import { Guild } from "../../../Models/Guild";
import { User } from "../../../Models/User";
import { Colors, Emojis, Utils } from "../../../Utils";
import { IMachine } from "./IMachine";
/*
export class Furnace implements IMachine{
    Name:        string =   "Energy Cell";
    Code:        string =   "energy_cell";
    Description: string =   "This machine can store energy-points(⚡).";

    Actions:     string =   "No actions available.";

    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            await this.Process(user);
            return this.ShowInterface(message.channel, user).then(resolve).catch(reject);
        });
    }

    Process(user: User){
        return new Promise<void>(async (resolve, reject) =>{
            var inventory = await user.fetchInventory();
            var machine = inventory.find(i => i.itemCode === this.Code);
            
            if(!machine){
                return;
            }

            var ts = new Date();
            if(inbuff){
                if(!inbuff.Meta.ProcessingTimeStamp || new Date(inbuff.Meta.ProcessingTimeStamp).getTime() <= 0){
                    inbuff.Meta.ProcessingTimeStamp = new Date().getTime();
                    await ItemStack.update({
                        Meta: inbuff.Meta
                    },{
                        where:{
                            id: inbuff.id
                        }
                    });
                    await inbuff.save();
                }
    
                var processing_time = (inbuff.Item.Meta.MeltTime || 60000);
                var time_delta = ts.getTime() - new Date(inbuff.Meta.ProcessingTimeStamp).getTime();
                var count = Math.floor(time_delta / processing_time);

                if(count > inbuff.Count){
                    inbuff.Container = `inventory#${user.ID}`;
                    inbuff.Meta.ProcessingTimeStamp = undefined;
                    await ItemStack.update({
                        Container: inbuff.Container,
                        Meta: inbuff.Meta
                    },{
                        where:{
                            id: inbuff.id
                        }
                    });
                    await inbuff.save();
                    await inbuff.stackWith(await user.fetchInventory());
                    return;
                }

                if(count > 0){
                    var recipe = recipes.find(r => r.Ingredients.find(ing => ing.itemCode === inbuff!.itemCode));
                    if(!recipe){
                        inbuff.Container = `inventory#${user.ID}`;
                        inbuff.Meta.ProcessingTimeStamp = undefined;
                        await ItemStack.update({
                            Container: inbuff.Container,
                            Meta: inbuff.Meta
                        },{
                            where:{
                                id: inbuff.id
                            }
                        });
                        await inbuff.save();
                        await inbuff.stackWith(await user.fetchInventory());
                    }else{
                        var nstack = await ItemStack.create({
                            Count: recipe.Result.Count * count,
                            itemCode: recipe.Result.itemCode,
                            Container: `machine#${this.Code}#${machine.id}#output`
                        });
                        inbuff.Count -= count;
                        if(inbuff.Count === 0){
                            await inbuff.destroy();
                        }else{
                            inbuff.Meta.ProcessingTimeStamp = new Date().getTime();
                            await ItemStack.update({
                                Count: inbuff.Count,
                                Meta: inbuff.Meta
                            },{
                                where:{
                                    id: inbuff.id
                                }
                            });
                        }
                        await nstack.stackWith(outbuff);
                    }
                }
            }
            resolve();
        });
    }

    ShowInterface(channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) =>{
            var inventory = await user.fetchInventory();
            var machine = inventory.find(i => i.itemCode === this.Code);
            
            if(!machine){
                return resolve(await Utils.ErrMsg(`You don't have \`${this.Name}\`.`, channel));
            }

            var inItem = await ItemStack.findOne({
                where: {
                    Container: `machine#${this.Code}#${machine.id}#input`
                },
                include: [Item]
            });
            var outItems = await ItemStack.findAll({
                where: {
                    Container: `machine#${this.Code}#${machine.id}#output`
                },
                include: [Item]
            });

            var inbuf = "";
            if(inItem){
                var prtime = ((inItem.Item.Meta.MeltTime || 60000) * inItem.Count) - ((new Date()).getTime() - new Date(inItem.Meta?.ProcessingTimeStamp || 0).getTime());
                inbuf += `**${inItem.Item.Name}** (${inItem.Item.Code}) - \`[${inItem.Count}]\` [${Utils.formatTime(Math.floor(prtime / 1000))}]\n`;
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
*/