import { Access, Colors, GlobalLogger, Synergy, SynergyUserError, User } from "synergy3";
import { StorageWrapper } from "../Storage/StorageWrapper";
import Discord from "discord.js";
import Economy, { NumberFormatter } from "../Economy";
import Shop from "../Shop/Shop";
import RainbowBOTUtils, { CEmojis } from "../../../RainbowBOTUtils";
import Control from "./Control";
import { ItemsCTL } from "./ItemsCTL";

export class ShopCTL extends Control {
    public shop: Shop;
    constructor(bot: Synergy, economy: Economy, storage: StorageWrapper){
        super(bot, economy, storage);
        this.shop = new Shop(this.bot, this.storage);

        this.economy.createSlashCommand("shop", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Imagine a place where you can buy something. So here it is.")
        )
        .onExecute(this.handleInteraction.bind(this))
        .commit()
    }

    public async Init(){
        await this.shop.Init();
    }

    public embedMessage(numFormatter?: NumberFormatter){
        let fnum = numFormatter ?? ((n: number) => n.toString());

        let emb = new Discord.EmbedBuilder({
            title: "Shop",
            color: 0xFFFF00
        });

        for(let c in this.shop.categories){
            let cat = this.shop.categories[c]; 
            let txt = "";
            for(let i in cat.entries){
                let item = cat.entries[i];
                let cross = item.stock === 0 ? "~~" : "";
                txt +=  `${cross}**🔸 ${item.item.item.name}** - ` +
                        `${item.item.item.description} x${item.item.size} \n` +
                        `Stock: ${item.stock}/${item.maxStock} 📦, ` +
                        `Cost: ${fnum(item.price)} ${CEmojis.PointCoin}${cross}\n\n`;
            }
            emb.addFields({
                name: cat.name,
                value: txt
            });
        }
    
        return emb;
    }

    public async handleInteraction(interaction: Discord.ChatInputCommandInteraction, user: User){
        let player = await this.storage.get(user.unifiedId);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let fnum = this.economy.numFormatterFactory(user.unifiedId);

        let emb = this.embedMessage(fnum);
        let menu = this.economy.createMessageSelectMenu([ Access.USER(user.unifiedId) ], -1, 300000);
        let items: Discord.SelectMenuOptionBuilder[] = []

        let ci = 0;
        let ii = 0;
        for(let c of this.shop.categories){
            ii = 0;
            for(let i of c.entries){
                if(i.stock !== 0){
                    items.push(
                        new Discord.SelectMenuOptionBuilder()
                            .setLabel(`${c.name} -> ${i.item.item.name} (${fnum(i.price)} points)`)
                            .setValue(`buyitem.${ci}.${ii}`)
                    );
                }
                ii++;
            }
            ci++;
        }
        menu.builder.setOptions(items);
        menu.onExecute(this.handlePreBuyInteraction.bind(this));

        await interaction.reply({
            embeds: [emb],
            components: [
                new Discord.ActionRowBuilder<Discord.SelectMenuBuilder>().setComponents([menu.builder])
            ]
        });
    }

    public async handlePreBuyInteraction(interaction: Discord.SelectMenuInteraction, user: User){
        let player = await this.storage.get(user.unifiedId);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let fnum = this.economy.numFormatterFactory(user.unifiedId);

        let args = interaction.values[0].split(".");
        
        let category_index = parseInt(args[1]);
        let item_index = parseInt(args[2]);

        if(isNaN(category_index) || !isFinite(category_index)) throw new Error("Invalid category index provided via select menu.");
        if(isNaN(item_index) || !isFinite(item_index)) throw new Error("Invalid item index provided via select menu.");

        let shop_category = this.shop.categories[category_index];
        if(!shop_category) throw new Error("Unknown shop category provided via select menu.");

        let shop_item = shop_category.entries[item_index];
        if(!shop_item) throw new Error("Unknown shop item provided via select menu.");

        let emb =  new Discord.EmbedBuilder({
            title: "Buy __" + shop_item.item.item.name + "__",
            color: Colors.Noraml,
            fields: [
                { name: "Price", value: `${fnum(shop_item.price)} ${CEmojis.PointCoin}` },
                { name: "Stock", value: `${shop_item.stock}/${shop_item.maxStock} 📦` },
            ],
            thumbnail: shop_item.item.item.iconUrl ? { url: shop_item.item.item.iconUrl } : undefined
        });
        
        emb = ItemsCTL.generateItemInfo(shop_item.item.item, emb, fnum);

        let actionrow = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();

        let btn1 = this.economy.createMessageButton([ Access.USER(user.unifiedId) ], -1, 300000);
        btn1.builder.setLabel("Buy x1");
        btn1.builder.setStyle(Discord.ButtonStyle.Primary);
        btn1.onExecute(async (int, user) => {
            await this.handleFinalBuyInteraction(int, user, category_index, item_index, 1);
        });

        let btn5 = this.economy.createMessageButton([ Access.USER(user.unifiedId) ], -1, 300000);
        btn5.builder.setLabel("Buy x5");
        btn5.builder.setStyle(Discord.ButtonStyle.Primary);
        btn5.onExecute(async (int, user) => {
            await this.handleFinalBuyInteraction(int, user, category_index, item_index, 5);
        });

        let btn10 = this.economy.createMessageButton([ Access.USER(user.unifiedId) ], -1, 300000);
        btn10.builder.setLabel("Buy x10");
        btn10.builder.setStyle(Discord.ButtonStyle.Primary);
        btn10.onExecute(async (int, user) => {
            await this.handleFinalBuyInteraction(int, user, category_index, item_index, 10);
        });

        actionrow.addComponents([btn1.builder, btn5.builder, btn10.builder]);

        if(actionrow.components.length > 0){
            await interaction.reply({ embeds: [emb], components: [actionrow] });
        }else{
            await interaction.reply({ embeds: [emb] });
        }
    }

    public async handleFinalBuyInteraction(interaction: Discord.ButtonInteraction, user: User, category: number, item: number, amount: number){
        let player = await this.storage.get(user.unifiedId);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let fnum = this.economy.numFormatterFactory(user.unifiedId);

        let shop_category = this.shop.categories[category];
        if(!shop_category) throw new Error("Unknown shop category provided.");

        let shop_item = shop_category.entries[item];
        if(!shop_item) throw new Error("Unknown shop item provided.");


        let status = this.shop.buy(player, category, item, amount);

        if(status === -1){
            throw new SynergyUserError(`Not enough items in stock (${shop_item.stock}, you want to buy ${amount})`);
        }

        if(status === -2){
            throw new SynergyUserError(`Not enough points on your balance (${fnum(player.user.economy.points)}, you want buy for ${fnum(amount * shop_item.price)})`);
        }

        await this.storage.savePlayer(player.user.unifiedId);

        let emb =  new Discord.EmbedBuilder({
            title: `You successfully purchased ${shop_item.item.item.name} x${amount} for ${fnum(amount * shop_item.price)} ${CEmojis.PointCoin}`,
            color: Colors.Noraml
        });

        GlobalLogger.userlog.info(`User ${interaction.user}(${interaction.user.tag}) buyed ${shop_item.item.item.id} x${amount}. Cost: ${amount * shop_item.price}.`);
        await interaction.reply({ embeds: [emb] });
    }
}