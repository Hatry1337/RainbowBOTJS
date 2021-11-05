import Discord from "discord.js";
import { Op } from "sequelize";
import { Item } from "../../../Models/Economy/Item";
import { ItemStack } from "../../../Models/Economy/ItemStack";
import { Recipe } from "../../../Models/Economy/Recipe";
import { Guild } from "../../../Models/Guild";
import { User } from "../../../Models/User";
import { Colors, Emojis, Utils } from "../../../Utils";
import { IMachine } from "./IMachine";

export class Crusher implements IMachine{
    Name:        string =   "Crusher";
    Code:        string =   "crusher";
    Description: string =   "This machine can crush items.";

    Actions:     string =   "`put <item_code> <amount>` - put items into input buffer\n" +
                            "`stash` - get all items from input buffer\n" + 
                            "`empty` - get all items from output buffer"

    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            await this.Process(user);

            var args = message.content.split(" ").slice(2);

            if(args.length === 0) {
                return this.ShowInterface(message.channel, user).then(resolve).catch(reject);
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

                        
                        var inventory = await user.fetchInventory();
                        var machine = inventory.find(i => i.itemCode === this.Code);
                        
                        if(!machine){
                            return resolve(await Utils.ErrMsg(`You don't have \`${this.Name}\`.`, message.channel));
                        }

                        var inbuff = await ItemStack.findOne({
                            where: {
                                Container: `machine#${this.Code}#${machine.id}#input`
                            },
                            include: [Item]
                        });

                        var ingred = inventory.find(i => i.itemCode === args[1]);
                        if(!ingred){
                            return resolve(await Utils.ErrMsg("You don't have this item.", message.channel));
                        }

                        if(ingred.Count < count){
                            return resolve(await Utils.ErrMsg("Not enough items in your inventory.", message.channel));
                        }

                        if(inbuff && !inbuff.isStackable(ingred)){
                            return resolve(await Utils.ErrMsg("Input buffer is full!", message.channel));
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
                            return resolve(await Utils.ErrMsg("This item cannot be crushed in crusher.", message.channel));
                        }

                        if(ingred.Count === count){
                            ingred.Container = `machine#${this.Code}#${machine.id}#input`;
                            ingred.Meta.ProcessingTimeStamp = inbuff?.Meta.ProcessingTimeStamp || new Date().getTime();
                            await ItemStack.update({
                                Container: ingred.Container,
                                Meta: ingred.Meta
                            },{
                                where:{
                                    id: ingred.id
                                }
                            });
                            await ingred.save();
                            if(inbuff){
                                inbuff.stackWith([ingred]);
                            }
                        }else{
                            ingred.Count -= count;
                            await ingred.save();
                            if(inbuff){
                                inbuff.Count += count;
                                await inbuff.save();
                            }else{
                                await ItemStack.create({
                                    Count: count,
                                    itemCode: ingred.itemCode,
                                    Container: `machine#${this.Code}#${machine.id}#input`,
                                    Meta: {
                                        ProcessingTimeStamp: new Date().getTime()
                                    }
                                });
                            }
                        }
                        await this.Process(user);
                        return this.ShowInterface(message.channel, user).then(resolve).catch(reject);
                    }

                    case "stash":{
                        var inventory = await user.fetchInventory();
                        var machine = inventory.find(i => i.itemCode === this.Code);
                        
                        if(!machine){
                            return resolve(await Utils.ErrMsg(`You don't have \`${this.Name}\`.`, message.channel));
                        }

                        var inbuff = await ItemStack.findOne({
                            where: {
                                Container: `machine#${this.Code}#${machine.id}#input`
                            },
                            include: [Item]
                        });

                        if(!inbuff){
                            return resolve(await Utils.ErrMsg("Input buffer is empty!", message.channel));
                        }

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
                        await inbuff.stackWith(inventory);

                        await this.Process(user);
                        return this.ShowInterface(message.channel, user).then(resolve).catch(reject);
                    }

                    case "empty":{
                        var inventory = await user.fetchInventory();
                        var machine = inventory.find(i => i.itemCode === this.Code);
                        
                        if(!machine){
                            return resolve(await Utils.ErrMsg(`You don't have \`${this.Name}\`.`, message.channel));
                        }

                        var outbuff = await ItemStack.findAll({
                            where: {
                                Container: `machine#${this.Code}#${machine.id}#output`
                            },
                            include: [Item]
                        });

                        for(var i of outbuff){
                            i.Container = `inventory#${user.ID}`;
                            i.Meta.ProcessingTimeStamp = undefined;
                            await ItemStack.update({
                                Container: i.Container,
                                Meta: i.Meta
                            },{
                                where:{
                                    id: i.id
                                }
                            });
                            await i.save();
                            await i.stackWith(inventory);                        
                        }
                        await this.Process(user);
                        return this.ShowInterface(message.channel, user).then(resolve).catch(reject);
                    }
                }
            }
        });
    }

    Process(user: User){
        return new Promise<void>(async (resolve, reject) =>{
            var inventory = await user.fetchInventory();
            var machine = inventory.find(i => i.itemCode === this.Code);
            
            if(!machine){
                return;
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
            var inbuff = await ItemStack.findOne({
                where: {
                    Container: `machine#${this.Code}#${machine.id}#input`
                },
                include: [Item]
            });
            var outbuff = await ItemStack.findAll({
                where: {
                    Container: `machine#${this.Code}#${machine.id}#output`
                },
                include: [Item]
            });

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
                title: `Crusher:`,
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