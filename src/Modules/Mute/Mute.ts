import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Access, Colors, Emojis, GuildOnlyError, Module, ModuleManager, NoConfigEntryError, RainbowBOT, RainbowBOTUserError, User, Utils } from "rainbowbot-core";

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
    public Description: string = "Using this module admins and mods can mute & unmute users.";
    public Category:    string = "Moderation";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.SERVER_MOD(), Access.SERVER_ADMIN() ];

    private CheckerTimer: NodeJS.Timeout;

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand("mute", this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
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
                )
            )
            .onExecute(this.Run.bind(this))
            .commit(),

            this.bot.interactions.createSlashCommand("unmute", this.Access, this,  this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
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
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
        
        this.CheckerTimer = setInterval(async () => {
            let data = await this.bot.modules.data.getContainer(this.UUID);
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
                    let guild = await this.bot.client.guilds.fetch(mu.guild_id);
                    let user = guild.members.resolve(mu.discord_id);
                    await user?.roles.remove(mu.muted_role_id);
                    this.Logger.Info(`[Checker]`, user?.user.tag, "umuted on", guild.name);
                }
            }
            this.Logger.Info(`[Checker]`, `Checked ${muted_users.length} Muted Users`);
        }, 120 * 1000);
    }
    
    public async Init() {
        await this.bot.config.setIfNotExist("guild", "moderator_role", {}, "role");
        await this.bot.config.setIfNotExist("guild", "muted_role", {}, "role");
    }

    public async UnLoad(){
        this.Logger.Info(`Unloading '${this.Name}' module:`);
        this.Logger.Info("Clearing Mutes Checking Inverval...")
        clearInterval(this.CheckerTimer);
    }
    
    private async mute(interaction: Discord.CommandInteraction, user: User, target_user: Discord.User, reason: string, mod_role_id: string, muted_role_id: string){
        if(!(interaction.inGuild() || interaction.inCachedGuild())  || !interaction.guild || !interaction.member){
            throw new GuildOnlyError();
        }

        if(!(interaction.member instanceof Discord.GuildMember)){
            interaction.member = await interaction.guild.members.fetch(interaction.user.id);
        }

        let member    = interaction.guild.members.resolve(target_user)!;
        let time      = interaction.commandName === "mute" ? Utils.parseShortTime(interaction.options.getString("time", true)) : undefined;
        let is_perm   = interaction.commandName === "mute" ? interaction.options.getString("time", true) === "perm" : false;

        if(is_perm){
            time = 1;
        }

        if(interaction.member.roles.highest.position >= member.roles.highest.position || interaction.member.permissions.has("ADMINISTRATOR")){
            if(!time || time === 0){
                throw new RainbowBOTUserError("Mute time not specified.");
            }
            let data = await this.bot.modules.data.getContainer(this.UUID);
            let muted_users = (data.get("muted_users") || []) as IMutedUser[];

            if(muted_users.find(mu => mu.discord_id === target_user.id && mu.is_muted)){
                throw new RainbowBOTUserError("This User is already muted.");
            }

            await member.roles.add(muted_role_id);

            let ruser_id = this.bot.users.idFromDiscordId(target_user.id);
            if(!ruser_id){
                await this.bot.users.createFromDiscord(target_user);
                ruser_id = this.bot.users.idFromDiscordId(target_user.id)!;
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
                description: `**User ${target_user} muted by ${interaction.user} for ${Utils.formatTime(time)}.\nReason: ${reason}\nUnmute at: ${ is_perm ? "Never" : Utils.ts(muted.unmute_at)}**`,
                color: Colors.Success
            });
            return await interaction.reply({ embeds: [ embd ] });

        }else{
            throw new RainbowBOTUserError("You can't mute user, that upper than your highest role.", "Contact with server administrator/member with higher role.")
        }
    }

    private async unmute(interaction: Discord.CommandInteraction, user: User, reason: string, target_user: Discord.User){
        if(!(interaction.inGuild() || interaction.inCachedGuild())  || !interaction.guild || !interaction.member){
            throw new GuildOnlyError();
        }

        if(!(interaction.member instanceof Discord.GuildMember)){
            interaction.member = await interaction.guild.members.fetch(interaction.user.id);
        }

        let data = await this.bot.modules.data.getContainer(this.UUID);
        let muted_users = (data.get("muted_users") || []) as IMutedUser[];
        let muted = muted_users.find(mu => mu.discord_id === target_user.id && mu.is_muted);
        if(muted){
            muted.is_muted = false;
            let target_member = interaction.guild.members.resolve(target_user);
            await target_member?.roles.remove(muted.muted_role_id);

            this.Logger.Info(`User ${interaction.user.tag}(${interaction.user.id}) unmuted ${target_user.tag}(${target_user.id})`);
            let embd = new Discord.MessageEmbed({
                description: `**User ${target_user} unmuted by ${interaction.user}. Reason: ${reason}**`,
                color: Colors.Success
            });
            return await interaction.reply({ embeds: [ embd ] });
        }else{
            throw new RainbowBOTUserError("This user is not muted.");
        }
    }

    public async Run(interaction: Discord.CommandInteraction, user: User){
        if(!(interaction.inGuild() || interaction.inCachedGuild())  || !interaction.guild){
            throw new GuildOnlyError();
        }

        let mod_role_id = (await this.bot.config.get("guild", "moderator_role"))[interaction.guild.id] as string | undefined;
        let muted_role_id = (await this.bot.config.get("guild", "muted_role"))[interaction.guild.id] as string | undefined;

        if(!mod_role_id){
            throw new NoConfigEntryError("Moderator Role", "/config guild set field:moderator_role value_role:@Role");
        }
        if(!muted_role_id){
            throw new NoConfigEntryError("Muted Role", "/config guild set field:muted_role value_role:@Role")
        }

        let target_user    = interaction.options.getUser("target", true);
        let reason         = interaction.options.getString("reason", true);
        
        if(interaction.commandName === "mute"){
            return await this.mute(interaction, user, target_user, reason, mod_role_id, muted_role_id);
        }else if(interaction.commandName === "unmute"){
            return await this.unmute(interaction, user, reason, target_user);
        }
    }
}