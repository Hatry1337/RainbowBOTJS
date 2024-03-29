import { Colors, Synergy, User } from "synergy3";
import Economy from "../Economy";
import { StorageWrapper } from "../Storage/StorageWrapper";
import Control from "./Control";
import Discord from "discord.js";

export default class TopCTL extends Control {
    constructor(bot: Synergy, economy: Economy, storage: StorageWrapper){
        super(bot, economy, storage);

        this.economy.createSlashCommand("top", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Top players by points.")
        )
        .onExecute(this.handleTop.bind(this))
        .commit()
    }

    public async handleTop(interaction: Discord.CommandInteraction, user: User){
        await interaction.deferReply();

        let players = await this.storage.getPlayersData();

        let fnum = this.economy.numFormatterFactory(user.unifiedId);

        let users: User[] = [];
        for(let p of players){
            if(!p.userDiscordId) {
                let dId = this.bot.users.discordIdFromUnifiedId(p.userId);
                if(!dId) {
                    continue;
                }
                p.userDiscordId = dId;
                await this.storage.setPlayerData(p.userId, p);
            }
            let u = await this.bot.users.get(p.userId);
            if(u) users.push(u);
        }

        users = users.sort((a, b) => b.economy.points - a.economy.points).filter(u => u);
        let uindex = users.findIndex(u => u.unifiedId === user.unifiedId);

        let stat = "";
        let i = 1;
        for(let u of users){
            stat += `${i}. ${u.nickname}${u.discord ? `(<@${u.discord.id}>)` : ""} - ${fnum(u.economy.points)} Points.\n`;
            if(i >= 10){
                break;
            }
            i++;
        }

        let emb = new Discord.EmbedBuilder({
            title: `Top RainbowBOT Players by Points`,
            description: stat || "There is no users right now.",
            color: Colors.Noraml
        });

        if(uindex !== -1){
            emb.setFooter({
                text: `You're on the ${uindex + 1} place. (${fnum(user.economy.points)} Points.)`,
                iconURL: interaction.user.avatarURL() || undefined
            });
        }

        await interaction.editReply({ embeds: [emb] });
    }
}