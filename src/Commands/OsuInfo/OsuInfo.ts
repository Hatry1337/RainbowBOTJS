import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors, CustomMessageSettings } from "../../Utils";
import CommandsController from "../../CommandsController";
import { OsuAPI, OsuGameMode, OsuMap } from "./OsuAPI";

export default class OsuInfo implements ICommand{
    Name:        string = "OsuInfo";
    Trigger:     string = "!osuinfo";
    Usage:       string = "`!osuinfo <nickname>[ <mode>]`\n\n" +
                          "**Examples:**\n" +
                          "`!osuinfo HatryYT` - Shows HatryYT's osu! profile.\n\n";

    Description: string = "Using this command users can view osu! profiles.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!osuinfo");
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

    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            let args = message.content.split(" ").slice(1);

            if(args.length <= 0){
                return resolve(await Utils.ErrMsg("No player username specified!", message.channel));
            }

            let uname = args[0];
            let mode = Object.values(OsuGameMode)[Object.keys(OsuGameMode).indexOf(args[1])] as OsuGameMode || OsuGameMode.osu;

            let user = await OsuAPI.getOsuUser(uname, mode);
            if(!user){
                return resolve(await Utils.ErrMsg("No user with this username!", message.channel));
            }
            let scores = await OsuAPI.getOsuUserBestScores(uname, mode);
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
                title: `${Utils.OsuModeEmoji(args[1] || "osu")} :flag_${user.country.toLowerCase()}: ${user.username}'s Profile`,
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

            return resolve(await message.channel.send(embd));
        });
    }
}