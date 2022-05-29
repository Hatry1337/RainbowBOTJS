import { Colors, Synergy, SynergyUserError, User } from "synergy3";
import ShopEntry from "./ShopEntry";
import Discord from "discord.js";
import ItemStack from "../Game/ItemStack";
import { ItemsMap } from "../Game/Items/ItemsMap";
import Player from "../Game/Player";
import UTS from "../../UnifiedTestSuite/UTS";
import { CEmojis } from "../../../RainbowBOTUtils";
import { StorageWrapper } from "../Storage/StorageWrapper";

export interface IShopCategory {
    name: string;
    entries: ShopEntry[];
}

export default class Shop {
    public categories: IShopCategory[] = [];
    private watchTimer: NodeJS.Timeout;
    private lastChecked: Date = new Date;
    constructor(public bot: Synergy, public storage: StorageWrapper){
        this.watchTimer = setInterval(() => {
            let cd = new Date();
            if(cd.getDate() !== this.lastChecked.getDate()){
                this.makeMagic();
            }
            this.lastChecked = cd;
        }, 60000);

        this.bot.events.once("Stop", () => {
            clearInterval(this.watchTimer);
        });

        this.categories.push(
            {
                name: "Miners",
                entries: [
                    new ShopEntry(new ItemStack(ItemsMap.get(4)!, 1), 2, 10, 30)
                ]
            },
            {
                name: "Rooms",
                entries: [
                    new ShopEntry(new ItemStack(ItemsMap.get(3)!, 1), 10, 3, 10)
                ]
            }
        )

        UTS.addTestPoint("economy.shop.nextday", "skip one day", async (int) => {
            this.makeMagic();
        });
    }

    private makeMagic() {
        for(let c of this.categories){
            for(let i of c.entries){
                i.calculate();
                i.refill();
            }
        }
    }

    public embedMessage(){
        let emb = new Discord.MessageEmbed({
            title: "Shop",
            description: "/shop buy ...",
            color: 0xFFFF00
        });
        for(let c in this.categories){
            let cat = this.categories[c]; 
            let txt = "";
            for(let i in cat.entries){
                let item = cat.entries[i];
                let cross = item.stock === 0 ? "~~" : "";
                txt += `**${c}.${i}** ${cross}${item.item.item.name} - ${item.item.item.description} x${item.item.size} [${item.price} ${CEmojis.PointCoin}, ${item.stock}/${item.maxStock} 📦]${cross}\n`;
            }
            emb.addField(cat.name, txt);
        }

        return emb;
    }

    public buy(player: Player, category: number, entry: number, count: number = 1){
        let item = this.categories[category].entries[entry];
        
        if(item.stock < item.item.size * count) return;
        if(item.price * count > player.user.economy.points) return;

        item.stock -= item.item.size * count;
        player.user.economy.points -= item.price * count;
        
        let stackflag = false;
        for(let i of player.inventory){
            if(i.item.id === item.item.item.id){
                i.size += item.item.size * count;
                stackflag = true;
                break;
            }
        }
        if(!stackflag){
            player.inventory.push(item.item.copy().setSize(item.item.size * count));
        }
    }

    public async handleInteraction(interaction: Discord.CommandInteraction, user: User){
        let sub = interaction.options.getSubcommand(false);
        if(!sub || sub === "view"){
            let emb = this.embedMessage();
            return await interaction.reply({ embeds: [emb] });
        }

        if(sub === "buy"){
            let slot = interaction.options.getString("slot", true);
            let count = interaction.options.getInteger("count", false) || 1;

            if(!slot || !/^([0-9]+)\.([0-9]+)$/gm.test(slot)) {
                throw new SynergyUserError("Invalid slot number provided.");
            }

            let matches = /^([0-9]+)\.([0-9]+)$/gm.exec(slot)!;
            let c = parseInt(matches[1]);
            let i = parseInt(matches[2]);

            let item = this.categories[c].entries[i];

            if(item.stock === 0){
                throw new SynergyUserError("This item is out of stock.");
            }

            if(item.stock < count){
                throw new SynergyUserError("Not enough items in shop.");
            }

            if(item.price * count > user.economy.points) {
                throw new SynergyUserError(`You don't have enough Points to purchase this. (Needed: ${item.price * count})`);
            }

            let player = await this.storage.getPlayer(user);
            if(!player){
                player = await this.storage.createPlayer(user);
            }

            this.buy(player, c, i, count);

            await this.storage.savePlayer(player);
            
            let emb =  new Discord.MessageEmbed({
                title: 'You are sucessfully purchased "' + item.item.item.name + '" x' + count,
                color: Colors.Noraml
            });
    
            return await interaction.reply({embeds: [emb]});
        }
    }
}