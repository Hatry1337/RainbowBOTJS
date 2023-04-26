import { Access, Colors, GlobalLogger, Synergy, SynergyUserError, User } from "synergy3";
import Economy from "../Economy";
import { StorageWrapper } from "../Storage/StorageWrapper";
import Discord from "discord.js";
import ItemStack from "../Game/ItemStack";
import Control from "./Control";
import { ItemsRegistry } from "../Game/Items/ItemsRegistry";

export default class EconomyCTL extends Control{
    constructor(bot: Synergy, economy: Economy, storage: StorageWrapper){
        super(bot, economy, storage);
        
        this.economy.createSlashCommand("economyctl", [ Access.ADMIN() ], this.economy.bot.moduleGlobalLoading ? undefined : this.economy.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Control Economy module stuff. Admins only.")

            .addSubcommand(sub => sub
                .setName("set")
                .setDescription("Set some parameters or smth")    
                
                .addStringOption(opt => opt
                    .setName("field")
                    .setDescription("Field to set")
                    .addChoices({ name: "points", value: "points" })
                    .addChoices({ name: "xp", value: "xp" })   
                    .addChoices({ name: "lvl", value: "lvl" })  
                    .setRequired(true)
                )
                .addNumberOption(opt => opt
                    .setName("value")
                    .setDescription("Value to set to the field.")    
                    .setRequired(true)
                )
                .addUserOption(opt => opt
                    .setName("user")
                    .setDescription("Target user to set field to.")   
                    .setRequired(true) 
                )
            )
            .addSubcommand(sub => sub
                .setName("give")
                .setDescription("Give some items to user.")
                
                .addStringOption(opt => opt
                    .setName("item_id")
                    .setDescription("Literal ID of item to give.")  
                    .setRequired(true)
                )
                .addIntegerOption(opt => opt
                    .setName("amount")
                    .setDescription("How much items give to user.")    
                    .setRequired(true)
                )
                .addUserOption(opt => opt
                    .setName("user")
                    .setDescription("Target user to give item to.")  
                    .setRequired(true)  
                )
            )
            .addSubcommand(sub => sub
                .setName("itemdel")
                .setDescription("Delete some items from user.")

                .addStringOption(opt => opt
                    .setName("item_id")
                    .setDescription("Literal ID of item to delete.")  
                    .setRequired(true)
                )
                .addIntegerOption(opt => opt
                    .setName("amount")
                    .setDescription("How much items delete from user.")  
                    .setRequired(true)  
                )
                .addUserOption(opt => opt
                    .setName("user")
                    .setDescription("Target user to delte items from.")   
                    .setRequired(true) 
                )
            )
        )
        .onSubcommand("set", this.handleSetCommand.bind(this))
        .onSubcommand("give", this.handleGiveCommand.bind(this))
        .onSubcommand("itemdel", this.handleItemDelCommand.bind(this))
    }

    public async handleSetCommand(interaction: Discord.ChatInputCommandInteraction, user: User){
        let target_user = await this.economy.bot.users.fetchOne(interaction.user.id);
        if(!target_user) throw new SynergyUserError("Target user doesn't exist.");

        let field = interaction.options.getString("field", true);
        let value = interaction.options.getNumber("value", true);

        let old_val: number;

        switch(field){
            case "points":{
                old_val = target_user.economy.points;
                target_user.economy.points = value;
                break;
            }
            case "lvl":{
                old_val = target_user.economy.lvl;
                target_user.economy.lvl = value;
                break;
            }
            case "xp":{
                old_val = target_user.economy.xp;
                target_user.economy.xp = value;
                break;
            }
            default:{
                throw new SynergyUserError("This field doesn't exist.");
            }
        }

        let emb = new Discord.EmbedBuilder({
            title: `Successfully setted field "${field}" from "${old_val}" to ${value}.`,
            color: Colors.Noraml
        });

        GlobalLogger.userlog.info(`User ${interaction.user}(${interaction.user.tag}) setted "${field}" from "${old_val}" to ${value} on ${target_user.unifiedId}(${target_user.nickname}).`);
        await interaction.reply({ embeds: [emb] });
    }

    public async handleGiveCommand(interaction: Discord.ChatInputCommandInteraction, user: User){
        let target_user = await this.economy.bot.users.fetchOne(interaction.user.id);
        if(!target_user) throw new SynergyUserError("Target user doesn't exist.");

        let target_player = await this.storage.getPlayer(target_user);
        if(!target_player) throw new SynergyUserError("Target player doesn't exist.");

        let item_id = interaction.options.getString("item_id", true);
        let amount = interaction.options.getInteger("amount", true);

        let item = ItemsRegistry.getItem(item_id);
        if(!item) throw new SynergyUserError("Item with this id doesn't exist.");

        target_player.tryStackItem(new ItemStack(item, amount));
        await this.storage.savePlayer(target_player);

        let emb = new Discord.EmbedBuilder({
            title: `Successfully gived "${item.name}" x${amount} to ${target_user.nickname}.`,
            color: Colors.Noraml
        });

        GlobalLogger.userlog.info(`User ${interaction.user}(${interaction.user.tag}) gived "${item.name}" x${amount} to ${target_user.unifiedId}(${target_user.nickname}).`);
        await interaction.reply({ embeds: [emb] });
    }

    public async handleItemDelCommand(interaction: Discord.ChatInputCommandInteraction, user: User){
        let target_user = await this.economy.bot.users.fetchOne(interaction.user.id);
        if(!target_user) throw new SynergyUserError("Target user doesn't exist.");

        let target_player = await this.storage.getPlayer(target_user);
        if(!target_player) throw new SynergyUserError("Target player doesn't exist.");

        let item_id = interaction.options.getString("item_id", true);
        let amount = interaction.options.getInteger("amount", true);

        let item = target_player.inventory.findIndex(i => i.item.id === item_id);
        if(item === -1) throw new SynergyUserError("This player don't have item with this id.");

        let final_amount = target_player.inventory[item].size - amount;
        let deleted_item = target_player.inventory[item];
        if(final_amount === 0){
            target_player.deleteItem(deleted_item);
        }else{
            deleted_item.setSize(final_amount);
        }
        target_player.updateInventory();
        await this.storage.savePlayer(target_player);

        let emb = new Discord.EmbedBuilder({
            title: `Successfully deleted "${deleted_item.item.name}" x${amount} from ${target_user.nickname}.`,
            color: Colors.Noraml
        });

        GlobalLogger.userlog.info(`User ${interaction.user}(${interaction.user.tag}) deleted "${deleted_item.item.name}" x${amount} from ${target_user.unifiedId}(${target_user.nickname}).`);
        await interaction.reply({ embeds: [emb] });
    }
}