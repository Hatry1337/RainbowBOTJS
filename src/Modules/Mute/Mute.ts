import Discord, { GuildMember } from "discord.js";
import { Utils, Emojis, Colors } from "../../Utils";
import Module from "../Module";
import ModuleManager from "../../ModuleManager";
import { SlashCommandBuilder } from "@discordjs/builders";
/*
export interface IMutedUser{
    user_id: number;
    discord_id: string;
    discord_tag: string;
    
    muter_id: number;
    muter_discord_id: string

    mute_reason: string;
    unmute_reason?: string;
    muted_at: Date;
    unmute_at?: Date;
    guild_id: string;
    muted_role_id: string;
    is_perm_muted: boolean;
    is_muted: boolean;
}

export default class Mute extends Module{
    public Name:        string = "Mute";
    public Trigger:     string = "!mute";
    public Usage:       string = "`!mute @user <time> <reason>`\n\n" +
                          "**Time:**\n" +
                          "`1d`, `1h`, `1m`, `1s`, `perm`\n\n" +
                          "**Reason:**\n" +
                          "`any string`\n\n" +
                          "**Example:**\n" +
                          "`!mute @BadBoy 2h Don't be bad ^^\n\n";

    public Description: string = "Using this module admins and mods can mute & unmute users.";
    public Category:    string = "Moderation";
    public Author:      string = "Thomasss#9258";

    private CheckerTimer: NodeJS.Timeout;

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName("mute")
                .setDescription("Using this command admins and mods can mute users.")
                .addUserOption(opt => opt
                    .setName("target")
                    .setDescription("Bad boy")
                    .setRequired(true)    
                )
                .addStringOption(opt => opt
                    .setName("reason")
                    .setDescription("Reason of mute.")
                    .setRequired(true)    
                )
                .addNumberOption(opt => opt
                    .setName("secs")
                    .setDescription("Seconds of mute time.")
                    .setMinValue(1)
                ) 
                .addNumberOption(opt => opt
                    .setName("mins")
                    .setDescription("Minutes of mute time.")
                    .setMinValue(1)
                ) 
                .addNumberOption(opt => opt
                    .setName("hours")
                    .setDescription("Hours of mute time.")
                    .setMinValue(1)
                ) 
                .addNumberOption(opt => opt
                    .setName("days")
                    .setDescription("Days of mute time.")
                    .setMinValue(1)
                ) 
                .addBooleanOption(opt => opt
                    .setName("permanent")
                    .setDescription("Mute user permanently")
                    
                ) as SlashCommandBuilder,

                new SlashCommandBuilder()
                .setName("unmute")
                .setDescription("Using this command admins and mods can unmute users.")
                .addUserOption(opt => opt
                    .setName("target")
                    .setDescription("Good boy")
                    .setRequired(true)    
                ) 
                .addStringOption(opt => opt
                    .setName("reason")
                    .setDescription("Reason of unmute.")
                    .setRequired(true)  
                ) as SlashCommandBuilder,
        );
        
        this.CheckerTimer = setInterval(async () => {
            this.Logger.Info(`[Checker]`, "Muted users checking...");
            let data = await this.Controller.dataManager.getContainer(this.UUID);
            let muted_users = data.get("muted_users") as IMutedUser[] | undefined;
            if(!muted_users){
                this.Logger.Info(`[Checker]`, "No muted users. Skip check.");
                return;
            }
            muted_users = muted_users.filter(u => u.is_muted);

            for(let mu of muted_users){
                if(!mu.is_perm_muted && (mu.unmute_at || new Date()) < new Date()){
                    mu.is_muted = false;
                    let guild = await this.Controller.bot.client.guilds.fetch(mu.guild_id);
                    let user = guild.members.resolve(mu.discord_id);
                    await user?.roles.remove(mu.muted_role_id);
                    this.Logger.Info(`[Checker]`, user?.user.tag, "umuted on", guild.name);
                }
            }
            this.Logger.Info(`[Checker]`, `Checked ${muted_users.length} Muted Users`);
        }, 120 * 1000);
    }
    
    public async UnLoad(){
        this.Logger.Info(`Unloading '${this.Name}' module:`);
        this.Logger.Info("Clearing Mutes Checking Inverval...")
        clearInterval(this.CheckerTimer);
    }

    public Test(interaction: Discord.CommandInteraction){
        return  interaction.commandName.toLowerCase() === "mute" ||
                interaction.commandName.toLowerCase() === "unmute";
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            if(!interaction.member  || !(interaction.member instanceof GuildMember)){
                return interaction.reply({ embeds: [ Utils.ErrMsg("This command is guild-only.") ] });
            }
            let cfg = this.Controller.bot.Config;

            if(!(interaction.member.permissions.has("ADMINISTRATOR") || interaction.member.roles.cache.get( || ""))){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Only administrators or moderators can use this command.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }


            var args = message.content.split(" ").slice(1);
            if(args.length < 3){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Not enough parameters.`,
                    description: `Command Usage: \n${this.Usage}`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }

            var user_id = Utils.parseID(args[0]);
            var time    = Utils.parseShortTime(args[1]);
            var reason  = message.content.slice(this.Trigger.length + args[0].length + args[1].length + 2);
            var is_perm = args[1].toLowerCase() === "perm"; 

            if(is_perm){
                time = 1;
            }

            if(user_id && user_id.length === 18){
                var user = message.guild?.members.cache.get(user_id);
                if(!user){
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }

                if(message.member.roles.highest.position >= user.roles.highest.position || message.member?.hasPermission("ADMINISTRATOR")){
                    if(!time || time === 0){
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Mute time not specified.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    
                    if(!reason){
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Mute reason not specified.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }

                    if(!guild.MutedRoleID){
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} No mute role configured.`,
                            description: "Plese contact with your server's administrator to configure muted role.",
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }

                    await user.roles.add(guild.MutedRoleID);

                    MutedUser.findOrCreate({
                        where: {
                            DsID: user.id,
                            GuildID: message.guild?.id
                        },
                        defaults: {
                            DsID: user.id,
                            Tag: user.user.tag,
                            GuildID: message.guild?.id,
                            MuterID: message.author.id,
                            Reason: reason,
                            MuteDate: new Date(),
                            UnmuteDate: new Date(new Date().getTime() + time * 1000),
                            IsMuted: true,
                            IsPermMuted: is_perm,
                            MuteRoleID: guild.MutedRoleID
                        }
                    }).then(async res => {
                        var muser = res[0];
                        if(!muser || !user){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Something went wrong. Try again`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        if(!guild.MutedRoleID){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} No mute role configured.`,
                                description: "Please contact with your server's administrator to configure muted role.",
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        if(!res[1]){
                            muser.Tag = user.user.tag;
                            muser.MuterID = message.author.id;
                            muser.Reason = reason;
                            muser.MuteDate = new Date();
                            muser.UnmuteDate = new Date(new Date().getTime() + time * 1000);
                            muser.IsMuted = true;
                            muser.IsPermMuted = is_perm;
                            muser.MuteRoleID = guild.MutedRoleID;
                            await muser.save();
                        }

                        logger.info(`[${this.Name}]`, `User ${message.author.tag}(${message.author.id}) muted ${user.user.tag}(${user.id}). Unmute at: ${Utils.ts(muser.UnmuteDate)}`);
                        var embd = new Discord.MessageEmbed({
                            description: `**User ${message.author} muted ${user} on ${args[1]}.\nReason: ${reason}\nUnmute at: ${ is_perm ? "Never" : Utils.ts(muser.UnmuteDate)}**`,
                            color: Colors.Success
                        });
                        await message.delete();
                        return resolve(await message.channel.send(embd));
                    }).catch(async res => {
                        logger.error(`[${this.Name}]`, res);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });
                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} You can't mute user, that upper than your highest role.`,
                        description: `Contact with server administrator/member with higher role.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }

            }else{
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} User ID is invalid. Please, check it, and try again.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }
        });
    }
}

export = Mute;
*/