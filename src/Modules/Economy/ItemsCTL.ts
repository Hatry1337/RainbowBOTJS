import { Access, Colors, InteractiveComponent, Synergy, SynergyUserError, User } from "synergy3";
import { StorageWrapper } from "./Storage/StorageWrapper";
import Discord from "discord.js";
import Table from "cli-table";
import Economy from "./Economy";
import Player from "./Game/Player";
import ItemPlaceable from "./Game/Items/ItemPlaceable";
import ItemStack from "./Game/ItemStack";

export class ItemsCTL {
    constructor(public bot: Synergy, public storage: StorageWrapper, public economy: Economy){

    }

    public async handleInteraction(interaction: Discord.CommandInteraction, user: User){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }
        
        let inv = "Your inventory is empty.";

        if(player.inventory.length !== 0){
            let table = new Table({
                head: ["NAME", "COUNT"]
            });
            let rows = player.inventory.map(item => [`"`+item.item.name+`"`, item.size.toString()]);
            for(let r of rows){
                table.push(r);
            }
            inv = table.toString();
        }

        let emb =  new Discord.MessageEmbed({
            title: `${user.nickname} Inventory`,
            description: "```elm\n" + inv + "```",
            color: Colors.Noraml
        });

        let options: Discord.InteractionReplyOptions = {embeds: [emb]}

        if(player.inventory.length !== 0) {
            let select = this.bot.interactions.getComponent(`items_menu:${player.user.id}`);
            if(select && !select.isMenu()){
                select.destroy();
                select = undefined;
            }
            if(!select){
                select = this.bot.interactions.createSelectMenu(`items_menu:${player.user.id}`,
                                                                [ Access.USER(player.user.id) ], 
                                                                this.economy
                ).build(builder => builder
                    .setMaxValues(1)
                )
            }
            if(!select.isMenu()){
                throw Error("WTF IS GOING ON?!?!?!?");
            }

            select.builder.setOptions(player!.inventory.map((i, indx) => ({ label: i.item.name, value: indx.toString() })));
            select.onExecute(this.handleInfoInteraction.bind(this));

            options.components = [ 
                new Discord.MessageActionRow().addComponents(select.builder)
            ]
        }

        return await interaction.reply(options);
    }

    public async handleInfoInteraction(interaction: Discord.SelectMenuInteraction, user: User){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let slot = parseInt(interaction.values[0]);
        if(isNaN(slot) || !isFinite(slot)) throw new Error("Item info incorrect slot value error.");

        let item = player.inventory[slot];
        if(!item){
            throw new SynergyUserError("You don't have item in this slot.");
        }

        let emb =  new Discord.MessageEmbed({
            title: "Item Info: " + item.item.name,
            description: item.item.description,
            fields: [
                { name: "ID", value: item.item.id.toString() },
                { name: "Can use?", value: item.item.isUsable() ? "Yes" : "No" },
                { name: "Can trade?", value: item.item.isTradeable() ? "Yes" : "No" },
                { name: "Can sell?", value: item.item.isSellable() ? "Yes" : "No" },
                { name: "Can place in room?", value: item.item.isPlaceable() ? "Yes" : "No" },
            ],
            color: Colors.Noraml
        });

        let actionrow = new Discord.MessageActionRow();

        if(item.item.isUsable()){
            let btn_use = this.bot.interactions.getComponent(`items_info_btn-use:${player.user.id}`);
            if(btn_use && !btn_use.isButton()){
                btn_use.destroy();
                btn_use = undefined;
            }
            if(!btn_use){
                btn_use = this.bot.interactions.createButton(`items_info_btn-use:${player.user.id}`, 
                    [ Access.USER(player.user.id) ], 
                    this.economy
                ).build(builder => builder
                    .setLabel("Use this Item")
                    .setStyle("PRIMARY")
                );
            }
            if(!btn_use.isButton()){
                throw Error("WTF IS GOING ON?!?!?!?");
            }
            btn_use.onExecute(async (int, user) => {
                await this.handleUseItemInteraction(int, user, slot)
            });

            actionrow.addComponents(btn_use.builder);
        }
        
        if(item.item.isPlaceable()){
            let btn_place = this.bot.interactions.getComponent(`items_info_btn-place:${player.user.id}`);
            if(btn_place && !btn_place.isButton()){
                btn_place.destroy();
                btn_place = undefined;
            }
            if(!btn_place){
                btn_place = this.bot.interactions.createButton(`items_info_btn-place:${player.user.id}`, 
                    [ Access.USER(player.user.id) ], 
                    this.economy
                ).build(builder => builder
                    .setLabel("Place this Item")
                    .setStyle("PRIMARY")
                );
            }
            if(!btn_place.isButton()){
                throw Error("WTF IS GOING ON?!?!?!?");
            }
            btn_place.onExecute(async (int, user) => {
                await this.handlePlaceItemInteraction(int, user, slot)
            });

            actionrow.addComponents(btn_place.builder);
        }

        if(actionrow.components.length > 0){
            return await interaction.reply({ embeds: [emb], components: [actionrow] });
        }else{
            return await interaction.reply({ embeds: [emb] });
        }
    }

    public async handleUseItemInteraction(interaction: Discord.ButtonInteraction, user: User, slot: number){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let item = player.inventory[slot];
        if(!item){
            throw new SynergyUserError("You don't have item in this slot.");
        }

        if(!item.item.isUsable()){
            throw new SynergyUserError("This item is not usable.");
        }

        if(!item.item.canUse(item, player)){
            throw new SynergyUserError("You can't use this item.");
        }

        await item.item.use(item, player);
        await this.storage.savePlayer(player);

        let emb =  new Discord.MessageEmbed({
            title: 'You are sucessfully used "' + item.item.name + '".',
            color: Colors.Noraml
        });

        return await interaction.reply({embeds: [emb]});
    }

    public async handlePlaceItemInteraction(interaction: Discord.ButtonInteraction, user: User, slot: number){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let item = player.inventory[slot];
        if(!item){
            throw new SynergyUserError("You don't have item in this slot.");
        }

        if(!item.item.isPlaceable()){
            throw new SynergyUserError("This item is not placeable.");
        }

        let actionrow = new Discord.MessageActionRow();

        if(player.rooms.length !== 0) {
            let select = this.bot.interactions.getComponent(`items_info_place_menu:${player.user.id}`);
            if(select && !select.isMenu()){
                select.destroy();
                select = undefined;
            }
            if(!select){
                select = this.bot.interactions.createSelectMenu(`items_info_place_menu:${player.user.id}`,
                                                                [ Access.USER(player.user.id) ], 
                                                                this.economy
                ).build(builder => builder
                    .setMaxValues(1)
                )
            }
            if(!select.isMenu()){
                throw Error("WTF IS GOING ON?!?!?!?");
            }

            select.builder.setOptions(player.rooms.map((i, indx) => ({ label: `${i.reference.name}, ${i.reference.powerGrid}W power, ${i.getUsedSlots()}/${i.reference.slots} slots.`, value: indx.toString() })));
            select.onExecute(async (int, user) => {
                await this.handlePlaceItemInRoomInteraction(int, user, slot);
            });

            actionrow.addComponents(select.builder);
        }

        let emb =  new Discord.MessageEmbed({
            title: `Select room where to place item "${item.item.name}":`,
            color: Colors.Noraml
        });

        if(actionrow.components.length > 0){
            return await interaction.reply({ embeds: [emb], components: [actionrow] });
        }else{
            return await interaction.reply({ embeds: [emb] });
        }
    }

    public async handlePlaceItemInRoomInteraction(interaction: Discord.SelectMenuInteraction, user: User, item_slot: number){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let item = player.inventory[item_slot];
        if(!item){
            throw new SynergyUserError("You don't have item in this slot.");
        }

        if(!item.item.isPlaceable()){
            throw new SynergyUserError("This item is not placeable.");
        }

        let room_slot = parseInt(interaction.values[0]);
        if(isNaN(room_slot) || !isFinite(room_slot)) throw new Error("Item info incorrect slot value error.");

        let room = player.rooms[room_slot];
        if(!room){
            throw new SynergyUserError("You don't have room in this slot.");
        }

        if(room.placeItem(item as ItemStack<ItemPlaceable>) === -1){
            throw new SynergyUserError("Can't place item in this room. Not enough slots or power grid.");
        }

        await this.storage.savePlayer(player);

        let emb =  new Discord.MessageEmbed({
            title: `You are sucessfully placed "${item.item.name}" in room "${room.reference.name}".`,
            color: Colors.Noraml
        });

        return await interaction.reply({ embeds: [emb] });
    }
}