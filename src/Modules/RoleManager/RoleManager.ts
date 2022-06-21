import { Access, AccessTarget, GuildOnlyError, Module, NoConfigEntryError, Synergy, Utils } from "synergy3";
import Discord from "discord.js";
import _ from "lodash";

export default class RoleManager extends Module{
    public Name:        string = "RoleManager";
    public Description: string = "Using this module you can manage your roles.";
    public Category:    string = "Moderation";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

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
    }

    public async Init(){
        await this.bot.config.setIfNotExist("guild", "getrole_rolelist", {}, "string");
    }

    public async Run(interaction: Discord.CommandInteraction){
        if(!interaction.inGuild()){
            throw new GuildOnlyError();
        }

        let action = interaction.options.getSubcommand(true);

        let role_ids = await this.bot.config.get("guild", "getrole_rolelist") as { [key: string]: string };
        if(!role_ids || !role_ids[interaction.guildId]){
            throw new NoConfigEntryError("getrole_rolelist", "/config guild set field:getrole_rolelist value_string:roleid1,roleid2,roleid3...");
        }

        let raw_ids = role_ids[interaction.guildId].replace(/\s/g, "").split(",").map(r => Utils.parseID(r));
        let mpd_r = await raw_ids.map(r => interaction.guild!.roles.resolve(r));
        let roles = _.compact(mpd_r);

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
        if(action === "get"){
            await interaction.reply({ content: "Select wanted roles:", components: [ new Discord.MessageActionRow().addComponents(menu.builder) ], ephemeral: true });
        } else {
            await interaction.reply({ content: "Select roles to delete:", components: [ new Discord.MessageActionRow().addComponents(menu.builder) ], ephemeral: true });
        }
    }
}