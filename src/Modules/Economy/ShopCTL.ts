import { Access, Colors, Synergy, SynergyUserError, User } from "synergy3";
import { StorageWrapper } from "./Storage/StorageWrapper";
import Discord from "discord.js";
import Economy from "./Economy";
import ItemPlaceable from "./Game/Items/ItemPlaceable";
import ItemStack from "./Game/ItemStack";
import Shop from "./Shop/Shop";
import { CEmojis } from "../../RainbowBOTUtils";

export class ShopCTL {
    public shop: Shop;
    constructor(public bot: Synergy, public storage: StorageWrapper, public economy: Economy){
        this.shop = new Shop(this.bot, this.storage);
    }

    public embedMessage(){
        let emb = new Discord.MessageEmbed({
            title: "Shop",
            color: 0xFFFF00
        });
        for(let c in this.shop.categories){
            let cat = this.shop.categories[c]; 
            let txt = "";
            for(let i in cat.entries){
                let item = cat.entries[i];
                let cross = item.stock === 0 ? "~~" : "";
                txt += `${cross}${item.item.item.name} - ${item.item.item.description} x${item.item.size} \nStock: ${item.stock}/${item.maxStock} 📦, Cost: ${item.price} ${CEmojis.PointCoin}${cross}\n`;
            }
            emb.addField(cat.name, txt);
        }
    
        return emb;
    }

    public async handleInteraction(interaction: Discord.CommandInteraction, user: User){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let emb = this.embedMessage();
        let menu = this.economy.createMessageSelectMenu([ Access.USER(user.id) ], -1, 300000);
        let items: Discord.MessageSelectOptionData[] = []

        let ci = 0;
        let ii = 0;
        for(let c of this.shop.categories){
            ii = 0;
            for(let i of c.entries){
                if(i.stock === 0) continue;
                items.push({
                    label: `${c.name} -> ${i.item.item.name} (${i.price} points)`,
                    value: `buyitem.${ci}.${ii}`
                });
                ii++;
            }
            ci++;
        }
        menu.builder.setOptions(items);
        menu.onExecute(this.handlePreBuyInteraction.bind(this));

        return await interaction.reply({embeds: [emb], components: [ new Discord.MessageActionRow().setComponents([menu.builder]) ]});
    }

    public async handlePreBuyInteraction(interaction: Discord.SelectMenuInteraction, user: User){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let args = interaction.values[0].split(".");
        
        let category_index = parseInt(args[1]);
        let item_index = parseInt(args[2]);

        if(isNaN(category_index) || !isFinite(category_index)) throw new Error("Invalid category index provided via select menu.");
        if(isNaN(item_index) || !isFinite(item_index)) throw new Error("Invalid item index provided via select menu.");

        let shop_category = this.shop.categories[category_index];
        if(!shop_category) throw new Error("Unknown shop category provided via select menu.");

        let shop_item = shop_category.entries[item_index];
        if(!shop_item) throw new Error("Unknown shop item provided via select menu.");

        let emb =  new Discord.MessageEmbed({
            title: "Buy " + shop_item.item.item.name,
            description: shop_item.item.item.description,
            fields: [
                { name: "Price", value: `${shop_item.price} ${CEmojis.PointCoin}` },
                { name: "Stock", value: `${shop_item.stock}/${shop_item.maxStock} 📦` },
                { name: "ID", value: shop_item.item.item.id.toString() },
                { name: "Can use?", value: shop_item.item.item.isUsable() ? "Yes" : "No" },
                { name: "Can trade?", value: shop_item.item.item.isTradeable() ? "Yes" : "No" },
                { name: "Can sell?", value: shop_item.item.item.isSellable() ? "Yes" : "No" },
                { name: "Can place in room?", value: shop_item.item.item.isPlaceable() ? "Yes" : "No" },
            ],
            color: Colors.Noraml
        });

        let actionrow = new Discord.MessageActionRow();

        let btn1 = this.economy.createMessageButton([ Access.USER(user.id) ], -1, 300000);
        btn1.builder.setLabel("Buy x1");
        btn1.builder.setStyle("PRIMARY");
        btn1.onExecute(async (int, user) => {
            await this.handleFinalBuyInteraction(int, user, category_index, item_index, 1);
        });

        let btn5 = this.economy.createMessageButton([ Access.USER(user.id) ], -1, 300000);
        btn5.builder.setLabel("Buy x5");
        btn5.builder.setStyle("PRIMARY");
        btn5.onExecute(async (int, user) => {
            await this.handleFinalBuyInteraction(int, user, category_index, item_index, 5);
        });

        let btn10 = this.economy.createMessageButton([ Access.USER(user.id) ], -1, 300000);
        btn10.builder.setLabel("Buy x10");
        btn10.builder.setStyle("PRIMARY");
        btn10.onExecute(async (int, user) => {
            await this.handleFinalBuyInteraction(int, user, category_index, item_index, 10);
        });

        actionrow.addComponents([btn1.builder, btn5.builder, btn10.builder]);

        if(actionrow.components.length > 0){
            return await interaction.reply({ embeds: [emb], components: [actionrow] });
        }else{
            return await interaction.reply({ embeds: [emb] });
        }
    }

    public async handleFinalBuyInteraction(interaction: Discord.ButtonInteraction, user: User, category: number, item: number, amount: number){
        let player = await this.storage.getPlayer(user);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let shop_category = this.shop.categories[category];
        if(!shop_category) throw new Error("Unknown shop category provided.");

        let shop_item = shop_category.entries[item];
        if(!shop_item) throw new Error("Unknown shop item provided.");


        let status = this.shop.buy(player, category, item, amount);

        if(status === -1){
            throw new SynergyUserError(`Not enough items in stock (${shop_item.stock}, you want to buy ${amount})`);
        }

        if(status === -2){
            throw new SynergyUserError(`Not enough points on your balance (${player.user.economy.points}, you want buy for ${amount * shop_item.price})`);
        }

        await this.storage.savePlayer(player);

        let emb =  new Discord.MessageEmbed({
            title: `You successfully purchased ${shop_item.item.item.name} x${amount} for ${amount * shop_item.price} ${CEmojis.PointCoin}`,
            color: Colors.Noraml
        });
        await interaction.reply({ embeds: [emb] });
    }
}