import {
    Access,
    AccessTarget, ArrayConfigEntry, EphemeralArrayConfigEntry,
    EphemeralConfigEntry,
    GlobalLogger,
    GuildOnlyError,
    Module,
    NoConfigEntryError,
    Synergy,
    Utils
} from "synergy3";
import Discord from "discord.js";
import _ from "lodash";

export default class RoleManager extends Module{
    public Name:        string = "RoleManager";
    public Description: string = "Using this module you can manage your roles.";
    public Category:    string = "Moderation";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    private rolesGetConf!: EphemeralArrayConfigEntry<"role">;
    private autorolesConf!: EphemeralArrayConfigEntry<"role">

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand("role", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            .addSubcommand(sub => sub
                .setName("get")
                .setDescription("Take role on this server.")    
            )
            .addSubcommand(sub => sub
                .setName("delete")
                .setDescription("Delete role from your roles on this server.")    
            )
        )
        .onExecute(this.Run.bind(this))
        .commit()

        this.rolesGetConf = this.bot.config.defaultConfigEntry("guild", this.Name,
            new EphemeralArrayConfigEntry(
                "role_get_roles",
                "Roles that users can obtain through /role command",
                "role",
                false
            )
        );
        this.autorolesConf = this.bot.config.defaultConfigEntry("guild", this.Name,
            new EphemeralArrayConfigEntry(
                "autoroles",
                "Roles that automatically assigned to users when they join your server",
                "role",
                false
            )
        );
    }

    public async Init(){
        this.bot.client.on("guildMemberAdd", async (member) => {
            let roles = this.autorolesConf.getValues(member.guild.id);
            if(!roles || roles.length === 0) return;
            
            await member.roles.add(roles.map(r => r.id));
            GlobalLogger.userlog.info(`Added autoroles to ${member}(${member.user.tag}) on ${member.guild}`);
        });
    }

    public async Run(interaction: Discord.ChatInputCommandInteraction){
        if(!interaction.inGuild() || !interaction.guild){
            throw new GuildOnlyError();
        }

        let action = interaction.options.getSubcommand(true);

        let roleIds = this.rolesGetConf.getValues(interaction.guildId);
        if(roleIds.length === 0){
            throw new NoConfigEntryError("role_get_roles", "/config guild set field:getrole_rolelist value_string:roleid1,roleid2,roleid3...");
        }

        let configRoles = this.rolesGetConf.getValues(interaction.guild.id);
        let roles: Discord.Role[] = [];
        for(let cr of configRoles) {
            let role = interaction.guild.roles.resolve(cr.id);
            if(role){
                roles.push(role);
            }
        }

        let menu = this.bot.interactions.createSelectMenu(`${interaction.id}-getrole-selector`, [ Access.USER(interaction.user.id) ], this);
        menu.builder.addOptions(roles.map(r => ({ label: r.name, value: r.id })));
        menu.onExecute(async int => {
            if(!(int.member instanceof Discord.GuildMember)){
                int.member = await int.guild!.members.fetch(int.user.id);
            }
            if(action === "get"){
                await int.member.roles.add(int.values);
                await int.reply({content: `You now have <@&${int.values.join(">, <@&")}> roles!`, ephemeral: true});
            }else{
                await int.member.roles.remove(int.values);
                await int.reply({content: `Role <@&${int.values.join(">, <@&")}> is removed from your roles!`, ephemeral: true});
            }
        });
        let row = new Discord.ActionRowBuilder<Discord.SelectMenuBuilder>()
            .addComponents(menu.builder);
        if(action === "get"){
            await interaction.reply({ content: "Select wanted roles:", components: [ row ], ephemeral: true });
        } else {
            await interaction.reply({ content: "Select roles to delete:", components: [ row ], ephemeral: true });
        }
    }
}