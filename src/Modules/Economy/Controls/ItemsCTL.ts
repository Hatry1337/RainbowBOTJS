import { Access, Colors, GlobalLogger, Synergy, SynergyUserError, User } from "synergy3";
import { StorageWrapper } from "../Storage/StorageWrapper";
import Discord from "discord.js";
import Table from "cli-table";
import Economy, { NumberFormatter } from "../Economy";
import ItemPlaceable from "../Game/Items/ItemPlaceable";
import ItemStack from "../Game/ItemStack";
import ItemMiner from "../Game/Items/ItemMiner";
import ItemPowerConsumer from "../Game/Items/ItemPowerConsumer";
import Control from "./Control";
import Item from "../Game/Items/Item";
import { ItemGroup } from "../Game/Items/ItemGroup";
import { ItemPoints } from "../Game/Items/ItemPoints";

export class ItemsCTL extends Control{
    constructor(bot: Synergy, economy: Economy, storage: StorageWrapper){
        super(bot, economy, storage);

        this.economy.createSlashCommand("items", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Check out your items.")
        )
        .onExecute(this.handleInteraction.bind(this))
        .commit()
    }

    public static generateItemInfo(item: Item, emb: Discord.EmbedBuilder, numFormatter?: NumberFormatter){
        let fnum = numFormatter ?? ((n: number) => n.toString());

        let fields: Discord.APIEmbedField[] = [
            {
                name: "ID",
                value: item.id
            },
            {
                name: "Description",
                value: item.description
            }
        ]

        if(item.isUsable()){
            fields.push({
                name: "Usable",
                value: "Can be used by pressing button below."
            });
        }
        if(item.isTradeable()){
            fields.push({
                name: "Tradeable",
                value: "Can be traded by command `/trade`."
            });
        }
        if(item.isSellable()){
            fields.push({
                name: "Sellable",
                value: "Can be sold on marketplace."
            });
        }
        if(item instanceof ItemMiner){
            fields.push({
                name: "Miner",
                value: `Mine CryptoPoints \nMining Rate: ${fnum(item.miningRate)} CPT/Hour.`
            });
        }
        if(item instanceof ItemPowerConsumer){
            fields.push({
                name: "Power Consumer",
                value: `Consumes electrical power: ${fnum(item.powerConsumption)}W`
            });
        }
        if(item instanceof ItemGroup){
            fields.push({
                name: "Item Group",
                value: `After usage gives you group \`${item.group}\`.`
            });
        }
        if(item instanceof ItemPoints){
            fields.push({
                name: "Item Points",
                value: `After usage gives you \`${fnum(item.pointsAmount)}\` points.`
            });
        }

        emb.addFields(fields);
        return emb;
    }

    public async handleInteraction(interaction: Discord.ChatInputCommandInteraction, user: User){
        let player = await this.storage.get(user.unifiedId);
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

        let emb =  new Discord.EmbedBuilder({
            title: `${user.nickname} Inventory`,
            description: "```elm\n" + inv + "```",
            color: Colors.Noraml
        });

        let options: Discord.InteractionReplyOptions = {
            embeds: [emb]
        }

        if(player.inventory.length !== 0) {
            let select = this.economy.createMessageSelectMenu([ Access.USER(interaction.user.id) ], -1, 300000)
            .build(builder => builder
                .setMaxValues(1)
                .setOptions(player!.inventory.map((i, indx) => ({ label: i.item.name, value: indx.toString() })))
            )
            .onExecute(this.handleInfoInteraction.bind(this));

            let row = new Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>()
                .addComponents(select.builder);

            options.components = [row];
        }

        await interaction.reply(options);
    }

    public async handleInfoInteraction(interaction: Discord.StringSelectMenuInteraction, user: User){
        let player = await this.storage.get(user.unifiedId);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let fnum = this.economy.numFormatterFactory(user.unifiedId);

        let slot = parseInt(interaction.values[0]);
        if(isNaN(slot) || !isFinite(slot)) throw new Error("Item info incorrect slot value error.");

        let item = player.inventory[slot];
        if(!item){
            throw new SynergyUserError("You don't have item in this slot.");
        }

        let emb =  new Discord.EmbedBuilder({
            title: "Item __" + item.item.name + "__",
            color: Colors.Noraml,
            thumbnail: item.item.iconUrl ? { url: item.item.iconUrl } : undefined
        });

        emb = ItemsCTL.generateItemInfo(item.item, emb, fnum);

        let actionrow = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();

        if(item.item.isUsable()){
            let btn_use = this.economy.createMessageButton([ Access.USER(interaction.user.id) ], -1, 300000)
            .build(builder => builder
                .setLabel("Use this Item")
                .setStyle(Discord.ButtonStyle.Primary)
            )
            .onExecute(async (int, user) => {
                await this.handleUseItemInteraction(int, user, slot)
            });

            actionrow.addComponents(btn_use.builder);
        }
        /*
        if(item.item.isPlaceable()){
            let btn_place = this.economy.createMessageButton([ Access.USER(interaction.user.id) ], -1, 300000)
            .build(builder => builder
                .setLabel("Place this Item")
                .setStyle("PRIMARY")
            )
            .onExecute(async (int, user) => {
                await this.handlePlaceItemInteraction(int, user, slot)
            });

            actionrow.addComponents(btn_place.builder);
        }
        */
        if(actionrow.components.length > 0){
            await interaction.reply({ embeds: [emb], components: [actionrow] });
        }else{
            await interaction.reply({ embeds: [emb] });
        }
    }

    public async handleUseItemInteraction(interaction: Discord.ButtonInteraction, user: User, slot: number){
        let player = await this.storage.get(user.unifiedId);
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
        await this.storage.savePlayer(player.user.unifiedId);

        let emb =  new Discord.EmbedBuilder({
            title: 'You are sucessfully used "' + item.item.name + '".',
            color: Colors.Noraml
        });

        GlobalLogger.userlog.info(`User ${interaction.user}(${interaction.user.tag}) used ${item.item.id}.`);
        return await interaction.reply({embeds: [emb]});
    }

    public async handlePlaceItemInteraction(interaction: Discord.ButtonInteraction, user: User, slot: number){
        let player = await this.storage.get(user.unifiedId);
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

        let actionrow = new Discord.ActionRowBuilder<Discord.SelectMenuBuilder>();

        if(player.buildings.length !== 0) {
            let select = this.economy.createMessageSelectMenu([ Access.USER(interaction.user.id) ], -1, 300000)
            .build(builder => builder
                .setMaxValues(1)
                .setOptions(player!.buildings.map((i, indx) => ({ label: `${i.reference.name}, ${i.reference.powerGrid}W power, ${i.getUsedSlots()}/${i.reference.size} slots.`, value: indx.toString() })))
            )
            .onExecute(async (int, user) => {
                await this.handlePlaceItemInRoomInteraction(int, user, slot);
            });

            actionrow.addComponents(select.builder);
        }

        let emb =  new Discord.EmbedBuilder({
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
        let player = await this.storage.get(user.unifiedId);
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

        let room = player.buildings[room_slot];
        if(!room){
            throw new SynergyUserError("You don't have room in this slot.");
        }

        if(room.placeItem(item as ItemStack<ItemPlaceable>) === -1){
            throw new SynergyUserError("Can't place item in this room. Not enough slots or power grid.");
        }

        await this.storage.savePlayer(player.user.unifiedId);

        let emb =  new Discord.EmbedBuilder({
            title: `You are sucessfully placed "${item.item.name}" in room "${room.reference.name}".`,
            color: Colors.Noraml
        });

        return await interaction.reply({ embeds: [emb] });
    }
}