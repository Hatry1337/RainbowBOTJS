import Discord, { Message } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Access, Colors, Emojis, Module, ModuleManager, Synergy, Utils } from "synergy3";
import { OsuAPI, OsuMap } from "./OsuAPI";


export default class OsuInfo extends Module{
    public Name:        string = "OsuInfo";
    public Description: string = "Using this command users can view osu! profiles.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ];

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder    
                .setDescription(this.Description)
                .addStringOption(opt => opt
                    .setName("nickname")
                    .setDescription("osu! player nickname.")
                    .setRequired(true)
                ) 
                .addNumberOption(opt => opt
                    .setName("mode")
                    .setDescription("osu! game mode.")
                    .setRequired(false)
                    .addChoice("Standard", 0)
                    .addChoice("Mania",    3)
                    .addChoice("Taiko",    1)
                    .addChoice("Catch",    2)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }

    public Run(interaction: Discord.CommandInteraction){
        return new Promise<void>(async (resolve, reject) => {
            let nickname = interaction.options.getString("nickname", true);
            let mode = interaction.options.getNumber("mode") || 0;

            await interaction.deferReply().catch(reject);

            let user = await OsuAPI.getOsuUser(nickname, mode);
            if(!user){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} No osu! player with this nickname!`,
                    color: Colors.Error
                });
                await interaction.editReply({ embeds: [embd] }).catch(reject);
                return resolve();
            }
            let scores = await OsuAPI.getOsuUserBestScores(nickname, mode);
            let maps: OsuMap[] = [];
            for(let s of scores){
                maps.push(await OsuAPI.getOsuMap(s.beatmap_id) as OsuMap);
            }
            
            let bscrs = "";
            let end = 5 > scores.length ? scores.length : 5;
            for(let i = 0; i < end; i++){
                let s = scores[i];
                let m = maps[i];
                bscrs += `[${m.difficultyrating.toFixed(2)}★] ${Utils.OsuRankEmoji(s.rank)} [**${m.title}** by **${m.artist}**](https://osu.ppy.sh/b/${m.beatmap_id}) ${s.pp.toFixed(0)}pp\n`;
            }

            if(!bscrs) bscrs = "No scores.";

            var embd = new Discord.MessageEmbed({
                title: `${Utils.OsuModeEmoji(mode)} :flag_${user.country.toLowerCase()}: ${user.username}'s Profile`,
                color: 0xff669c,
                thumbnail: { url: `https://a.ppy.sh/${user.user_id}` },
                fields: [
                    {name: "World Rank", value: `#${user.pp_rank}`, inline: true},
                    {name: "Country Rank", value: `#${user.pp_country_rank}`, inline: true},
                    {name: "Profile", value: `[${user.username}](https://osu.ppy.sh/users/${user.user_id})`, inline: true},
                    {name: "PP", value: `${user.pp_raw}`, inline: true},
                    {name: "Accuracy", value: `${user.accuracy.toFixed(2)}%`, inline: true},
                    {name: "Ranked Score", value: `${user.ranked_score}`, inline: true},
                    {name: "Total Score", value: `${user.total_score}`, inline: true},
                    {name: "Level", value: `${user.level.toFixed(0)}`, inline: true},                    
                    {name: "Join Date", value: `${user.join_date.toDateString()}`, inline: true},
                    {name: "Plays Count", value: `${user.playcount}`, inline: true},
                    {
                        name: "Time Played",
                        value: `${this.timeConversionOsu(user.total_seconds_played * 1000)}`,
                        inline: true
                    },
                    {name: "Ranks", value:  `${Emojis.OsuRankA} - ${user.count_rank_a}\n` +
                                            `${Emojis.OsuRankS} - ${user.count_rank_s}\n` +
                                            `${Emojis.OsuRankSH} - ${user.count_rank_sh}\n` +
                                            `${Emojis.OsuRankSS} - ${user.count_rank_ss}\n` +
                                            `${Emojis.OsuRankSSH} - ${user.count_rank_ssh}`, inline: true},
                    {name: "Best Scores", value: bscrs, inline: false}
                ]
            });

            await interaction.editReply({ embeds: [embd] }).catch(reject);
            return resolve();
        });
    }

    private timeConversionOsu(millisec: number) {
        var seconds = Math.floor(millisec / 1000);
        var minutes = Math.floor(millisec / (1000 * 60));
        var hours = Math.floor(millisec / (1000 * 60 * 60));
        var days = Math.floor(millisec / (1000 * 60 * 60 * 24));

        var stime;
        if (seconds < 60) {
            stime = `${seconds}s`;
        } else if (minutes < 60) {
            stime = `${minutes}m ${seconds - minutes * 60}s`;
        } else if (hours < 24) {
            stime = `${hours}h ${minutes - hours * 60}m ${seconds - minutes * 60}s`;
        } else {
            stime = `${days}d ${hours - days * 24}h ${minutes - hours * 60}m ${seconds - minutes * 60}s`;
        }
        return stime;
    };
}