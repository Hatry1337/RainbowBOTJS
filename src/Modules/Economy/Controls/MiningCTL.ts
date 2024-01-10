import { Colors, CommonConfigEntry, GlobalLogger, Synergy, SynergyUserError, User, Utils } from "synergy3";
import { StorageWrapper } from "../Storage/StorageWrapper";
import Discord from "discord.js";
import Economy, { ECONOMY_CONSTANTS } from "../Economy";
import Control from "./Control";
import ItemMiner from "../Game/Items/ItemMiner";
import ItemStack from "../Game/ItemStack";
import { CEmojis } from "../../../RainbowBOTUtils";

export class MiningCTL extends Control{
    constructor(bot: Synergy, economy: Economy, storage: StorageWrapper){
        super(bot, economy, storage);

        this.economy.createSlashCommand("getmoney", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Redeem Points from CPT Miners.")
        )
        .onExecute(this.handleMinersRedeem.bind(this))
        .commit()
    }

    public async handleMinersRedeem(interaction: Discord.ChatInputCommandInteraction, user: User){
        let player = await this.storage.get(user.unifiedId);
        if(!player){
            player = await this.storage.createPlayer(user);
        }

        let miners = player.inventory.filter(i => i.item instanceof ItemMiner) as ItemStack<ItemMiner>[];

        if(miners.length === 0) throw new SynergyUserError("You don't have any CPT Miners!", "Buy some using `/shop` command.");

        let totalRate = 0;
        let totalPower = 0;

        let totalPoints = 0;
        let totalPowerConsumed = 0;

        let minstart = new Date();

        let redeemedAt = new Date();

        for(let m of miners){
            totalRate += m.item.miningRate * m.size;
            totalPower += m.item.powerConsumption * m.size;

            if(m.meta.lastRedeem){
                m.meta.lastRedeem = new Date(m.meta.lastRedeem);

                let res = m.item.redeemPoints(m.meta.lastRedeem);
                totalPoints += res.points * m.size;
                totalPowerConsumed += res.power * m.size;

                if(m.meta.lastRedeem < minstart){
                    minstart = m.meta.lastRedeem;
                }
            }
            m.meta.lastRedeem = redeemedAt;
        }

        player.restackInventory();
        await this.storage.savePlayer(player.user.unifiedId);

        let elec_bill = totalPowerConsumed * ECONOMY_CONSTANTS.wattHourCost;
        let total_earn = totalPoints - elec_bill;

        user.economy.points += totalPoints;
        user.economy.points -= elec_bill;

        const fnum = (num: number) => {
            if(this.economy.configShortNumbers.getValue(user.unifiedId)) {
                return Intl.NumberFormat('en-US', {
                    notation: "compact",
                    maximumFractionDigits: 3
                }).format(num);
            }

            return num.toFixed(5).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        }

        let miningTime = Utils.formatTime(Math.floor((new Date().getTime() - minstart.getTime()) / 1000));

        let emb = new Discord.EmbedBuilder({
            title: `Mining redeem [${miningTime}]`,
            description:`Total Mining Rate: ${fnum(totalRate)} CPT/Hour\n` +
                        `Total Power Load: ${fnum(totalPower)}W\n` +
                        `\n` +
                        `Total Points Earned: ${fnum(totalPoints)} ${CEmojis.PointCoin}\n` +
                        `Total Power Consumed: ${fnum(totalPowerConsumed)} W*Hours\n` +
                        `Electricity Bill: ${fnum(elec_bill)}\n` +
                        `----------------------------------\n` +
                        `Total Earned: ${fnum(total_earn)}`,
            color: Colors.Noraml
        });

        GlobalLogger.userlog.info(`User ${interaction.user}(${interaction.user.tag}) redeemed ${total_earn} points. Time: ${miningTime}.`);
        await interaction.reply({ embeds: [emb] });
    }
}