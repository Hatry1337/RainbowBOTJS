import Discord, { GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Colors, Emojis, Module, ModuleManager, User, Utils } from "rainbowbot-core";

export interface IMutedUser{
    user_id: number;
    discord_id: string;
    discord_tag: string;
    
    muter_id: number;
    muter_discord_id: string

    mute_reason: string;
    unmute_reason?: string;
    muted_at: Date;
    unmute_at: Date;
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
                .addStringOption(opt => opt
                    .setName("time")
                    .setDescription("Mute time (`1d` `1h` `1m` `1s` `perm`).")
                    .setRequired(true)    
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
            let data = await this.Controller.data.getContainer(this.UUID);
            let muted_users = data.get("muted_users") as IMutedUser[] | undefined;
            if(!muted_users){
                return;
            }
            muted_users = muted_users.filter(u => u.is_muted);
            if(muted_users.length === 0){
                return;
            }

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
    
    public async Init() {
        await this.Controller.bot.config.setIfNotExist("guild", "moderator_role", {}, "role");
        await this.Controller.bot.config.setIfNotExist("guild", "muted_role", {}, "role");

        this.Controller.bot.PushSlashCommands(this.SlashCommands, this.Controller.bot.moduleGlobalLoading ? "global" : this.Controller.bot.masterGuildId);
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
    
    private mute(interaction: Discord.CommandInteraction, user: User, target_user: Discord.User, reason: string, mod_role_id: string, muted_role_id: string){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            if(!interaction.guild  || !(interaction.guild instanceof Discord.Guild) || !interaction.member  || !(interaction.member instanceof GuildMember)){
                return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("This command is guild-only.") ] }));
            }

            let member = interaction.guild.members.resolve(target_user)!;
            let time           = interaction.commandName === "mute" ? Utils.parseShortTime(interaction.options.getString("time", true)) : undefined;
            let is_perm        = interaction.commandName === "mute" ? interaction.options.getString("time", true) === "perm" : false;

            if(is_perm){
                time = 1;
            }

            if(interaction.member.roles.highest.position >= member.roles.highest.position || interaction.member.permissions.has("ADMINISTRATOR")){
                if(!time || time === 0){
                    return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("Mute time not specified.") ] }));
                }
                let data = await this.Controller.data.getContainer(this.UUID);
                let muted_users = (data.get("muted_users") || []) as IMutedUser[];

                if(muted_users.find(mu => mu.discord_id === target_user.id)){
                    return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("This User is already muted.") ] }));
                }

                await member.roles.add(muted_role_id);

                let ruser_id = this.Controller.bot.users.idFromDiscordId(target_user.id);
                if(!ruser_id){
                    await this.Controller.bot.users.createFromDiscord(target_user);
                    ruser_id = this.Controller.bot.users.idFromDiscordId(target_user.id)!;
                }
                
                let muted = {
                    user_id: ruser_id,
                    discord_id: target_user.id,
                    discord_tag: target_user.tag,
                    
                    muter_id: user.id,
                    muter_discord_id: interaction.user.id,

                    mute_reason: reason,
                    muted_at: new Date(),
                    unmute_at: new Date(new Date().getTime() + time * 1000),
                    guild_id: interaction.guild.id,
                    muted_role_id: muted_role_id,
                    is_perm_muted: is_perm,
                    is_muted: true
                };
                muted_users.push(muted);
                data.set("muted_users", muted_users);

                this.Logger.Info(`User ${interaction.user.tag}(${interaction.user.id}) muted ${target_user.tag}(${target_user.id}). Unmute at: ${Utils.ts(muted.unmute_at)}`);
                let embd = new Discord.MessageEmbed({
                    description: `**User ${interaction.user} muted ${target_user} on ${interaction.options.getString("time", true)}.\nReason: ${reason}\nUnmute at: ${ is_perm ? "Never" : Utils.ts(muted.unmute_at)}**`,
                    color: Colors.Success
                });
                return resolve(await interaction.reply({ embeds: [ embd ] }));

            }else{
                let embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} You can't mute user, that upper than your highest role.`,
                    description: `Contact with server administrator/member with higher role.`,
                    color: Colors.Error
                });
                return resolve(await interaction.reply({ embeds: [ embd ] }));
            }

        });
    }

    private unmute(interaction: Discord.CommandInteraction, user: User, reason: string, target_user: Discord.User){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            if(!interaction.guild  || !(interaction.guild instanceof Discord.Guild) || !interaction.member  || !(interaction.member instanceof GuildMember)){
                return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("This command is guild-only.") ] }));
            }

            let data = await this.Controller.data.getContainer(this.UUID);
            let muted_users = (data.get("muted_users") || []) as IMutedUser[];
            let muted = muted_users.find(mu => mu.discord_id === target_user.id);
            if(muted && muted.is_muted){
                muted.is_muted = false;
                let target_member = interaction.guild.members.resolve(target_user);
                await target_member?.roles.remove(muted.muted_role_id);

                this.Logger.Info(`User ${interaction.user.tag}(${interaction.user.id}) unmuted ${target_user.tag}(${target_user.id})`);
                let embd = new Discord.MessageEmbed({
                    description: `**User ${interaction.user} unmuted ${target_user}. Reason: ${reason}**`,
                    color: Colors.Success
                });
                return resolve(await interaction.reply({ embeds: [ embd ] }));
            }else{
                return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("This user not muted.") ] }));
            }
        });
    }

    public Run(interaction: Discord.CommandInteraction, user: User){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            if(!interaction.guild  || !(interaction.guild instanceof Discord.Guild) || !interaction.member  || !(interaction.member instanceof GuildMember)){
                return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("This command is guild-only.") ] }));
            }

            let mod_role_id = (await this.Controller.bot.config.get("guild", "moderator_role"))[interaction.guild.id] as string | undefined;
            let muted_role_id = (await this.Controller.bot.config.get("guild", "muted_role"))[interaction.guild.id] as string | undefined;

            if(!(interaction.member.permissions.has("ADMINISTRATOR") || interaction.member.roles.cache.get(mod_role_id || ""))){
                return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("Only administrators or moderators can use this command.") ] }));
            }

            if(!mod_role_id){
                return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("Moderator Role is not configured. Configure them with command `/config guild set field:moderator_role value_role:@Role`") ] }));
            }
            if(!muted_role_id){
                return resolve(await interaction.reply({ embeds: [ Utils.ErrMsg("Muted Role is not configured. Configure them with command `/config guild set field:moderator_role value_role:@Role`. Or generate with `/rolegen mute`") ] }));
            }

            let target_user    = interaction.options.getUser("target", true);
            let reason         = interaction.options.getString("reason", true);
            
            if(interaction.commandName === "mute"){
                return resolve(await this.mute(interaction, user, target_user, reason, mod_role_id, muted_role_id));
            }else if(interaction.commandName === "unmute"){
                return resolve(await this.unmute(interaction, user, reason, target_user));
            }
        });
    }
}