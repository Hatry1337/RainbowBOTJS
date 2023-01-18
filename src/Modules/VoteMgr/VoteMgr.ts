import { Access, AccessTarget, Colors, Module, Synergy, User } from "synergy3";
import Discord from "discord.js";
import { Api as TopGGApi } from "@top-gg/sdk";
import { GrpMgrSharedMethods } from "../GrpMgr/GrpMgr";

export default class VoteMgr extends Module{
    public Name:        string = "VoteMgr";
    public Description: string = "Vote for RainbowBOT on top.gg and get rewards for this!";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER(), Access.BANNED() ]

    private timer?: NodeJS.Timeout;
    public topggApi: TopGGApi = new TopGGApi(process.env.TOPGG_TOKEN);

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.createSlashCommand("vote", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
        )
        .onExecute(this.Run.bind(this))
        .commit()
    }

    public async Init(){
        if(!process.env.TOPGG_TOKEN) {
            this.Logger.Warn("Top.GG Token was not provided via env var 'TOPGG_TOKEN'. Stats will not be updated.")
            return
        }

        this.timer = setInterval(this.postTopGGStats.bind(this), 150000);
    }

    public async UnLoad(){
        if(this.timer){
            clearInterval(this.timer);
        }
    }

    public async postTopGGStats(){
        await this.topggApi.postStats({
            serverCount: this.bot.client.guilds.cache.size,
            shardCount: 1
        });
    }

    public async Run(interaction: Discord.ChatInputCommandInteraction, user: User){
        await interaction.deferReply();
        let emb = new Discord.EmbedBuilder({
            title: "Vote for our BOT on top.gg!",
            color: Colors.Noraml
        });

        if(await this.topggApi.hasVoted(interaction.user.id) && user.groups.includes("voter")){
            emb.setDescription("You alredy voted. Thanks for your support! ❤️");
        }else if(await this.topggApi.hasVoted(interaction.user.id) && !user.groups.includes("voter")){
            emb.setDescription("You received `voter` group. Thanks for your support! ❤️");
            await (this.bot.modules.GetModuleCommonInfo("GrpMgr")[0].sharedMethods as unknown as GrpMgrSharedMethods)?.addTempGroup("voter", user, 43200);
        }else{
            emb.setDescription(`You can vote [here](https://top.gg/bot/571948993643544587). After voting type this command again and you will get \`voter\` group.`);
        }

        await interaction.editReply({ embeds: [emb] });
    }
}