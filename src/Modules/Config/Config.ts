import Discord, { GuildMember, Message } from "discord.js";
import Module from "../Module";
import ModuleManager from "../../ModuleManager";
import { SlashCommandBuilder } from "@discordjs/builders";
import User from "../../Structures/User";
import { Colors, Utils } from "../../Utils";
import { ConfigDataType } from "../../ConfigManager";

export interface IGlobalConfiguration{
    [key: string]: any;
    guild_specific: {[key: string]: any}
    user_specific: {[key: string]: any}

}

export default class Config extends Module{
    public Name:        string = "Config";
    public Usage:       string = "`/config`\n\n";

    public Description: string = "Using this command Users can change User-Specific options or Admins can change Guild-Specific.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
    }
    
    public async Init(){
        let user_keys = await this.Controller.bot.config.getFields("user");
        let guild_keys = await this.Controller.bot.config.getFields("guild");

        let guild_conf_fields: [name: string, value: string][] = [];
        for(let f of guild_keys){
            guild_conf_fields.push([f, f]);
        }

        let user_conf_fields: [name: string, value: string][] = [];
        for(let f of user_keys){
            user_conf_fields.push([f, f]);
        }

        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addSubcommandGroup(opt => opt
                    .setName("guild")
                    .setDescription("Guild-Specific settings.")
                    .addSubcommand(opt => opt
                        .setName("list")
                        .setDescription("List all Guild-Specific settings.")  
                    )
                    .addSubcommand(opt => opt
                        .setName("set")
                        .setDescription("Set specified field to specified value")    
                        .addStringOption(opt => opt
                            .setName("field")
                            .setDescription("Field to set.")
                            .addChoices(guild_conf_fields)
                        )
                        .addBooleanOption(opt => opt
                            .setName("value_bool")
                            .setDescription("Value if parameter is type of bool.")
                        )
                        .addIntegerOption(opt => opt
                            .setName("value_int")
                            .setDescription("Value if parameter is type of int.")
                        )
                        .addStringOption(opt => opt
                            .setName("value_string")
                            .setDescription("Value if parameter is type of string.")
                        )
                        .addChannelOption(opt => opt
                            .setName("value_channel")
                            .setDescription("Value if parameter is type of channel.")
                        )
                        .addRoleOption(opt => opt
                            .setName("value_role")
                            .setDescription("Value if parameter is type of role.")
                        )
                        .addUserOption(opt => opt
                            .setName("value_user")
                            .setDescription("Value if parameter is type of user.")
                        )
                    )
                    .addSubcommand(opt => opt
                        .setName("get")
                        .setDescription("Get value of specified field.")    
                        .addStringOption(opt => opt
                            .setName("field")
                            .setDescription("Field to get.")
                            .addChoices(guild_conf_fields)
                        )
                    )
                )
                
                .addSubcommandGroup(opt => opt
                    .setName("user")
                    .setDescription("User-Specific settings.")
                    .addSubcommand(opt => opt
                        .setName("list")
                        .setDescription("List all User-Specific settings.")  
                    )
                    .addSubcommand(opt => opt
                        .setName("set")
                        .setDescription("Set specified field to specified value")    
                        .addStringOption(opt => opt
                            .setName("field")
                            .setDescription("Field to set.")
                            .addChoices(guild_conf_fields)
                        )
                        .addBooleanOption(opt => opt
                            .setName("value_bool")
                            .setDescription("Value if parameter is type of bool.")
                        )
                        .addIntegerOption(opt => opt
                            .setName("value_int")
                            .setDescription("Value if parameter is type of int.")
                        )
                        .addStringOption(opt => opt
                            .setName("value_string")
                            .setDescription("Value if parameter is type of string.")
                        )
                        .addChannelOption(opt => opt
                            .setName("value_channel")
                            .setDescription("Value if parameter is type of channel.")
                        )
                        .addRoleOption(opt => opt
                            .setName("value_role")
                            .setDescription("Value if parameter is type of role.")
                        )
                        .addUserOption(opt => opt
                            .setName("value_user")
                            .setDescription("Value if parameter is type of user.")
                        )
                    )
                    .addSubcommand(opt => opt
                        .setName("get")
                        .setDescription("Get value of specified field.")    
                        .addStringOption(opt => opt
                            .setName("field")
                            .setDescription("Field to get.")
                            .addChoices(guild_conf_fields)
                        )
                    )
                ) as SlashCommandBuilder
        );
        this.Controller.bot.PushSlashCommands(this.SlashCommands, process.env.NODE_ENV === "development" ? process.env.MASTER_GUILD : "global");
    }
    
    public Test(interaction: Discord.CommandInteraction){
        return interaction.commandName.toLowerCase() === this.Name.toLowerCase();
    }

    private makeList(fields: { name: string, value: any, type: ConfigDataType }[]){
        let text = "";
        for(let f of fields){
            text += `${f.name}: **${f.type}** = \`${f.value || "[not set]"}\`\n`;
        }
        return text;
    }

    public Run(interaction: Discord.CommandInteraction, user: User){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let values = {
                bool:    interaction.options.getBoolean("value_bool"),
                int:     interaction.options.getInteger("value_int"),
                number:  interaction.options.getNumber("value_number"),
                string:  interaction.options.getString("value_string"),
                channel: interaction.options.getChannel("value_channel"),
                role:    interaction.options.getRole("value_role"),
                user:    interaction.options.getUser("value_user")
            }
            let field = interaction.options.getString("field");
            let target = interaction.options.getSubcommandGroup(true);
            let action = interaction.options.getSubcommand(true);

            if(target === "guild"){
                if(!interaction.member  || !(interaction.member instanceof GuildMember)){
                    return interaction.reply({ embeds: [ Utils.ErrMsg("This command is guild-only.") ] });
                }
                if(user.group !== "Admin" && !interaction.member.permissions.has("ADMINISTRATOR")){
                    return interaction.reply({ embeds: [ Utils.ErrMsg("You don't have access to this command.") ] });
                }
            }

            if(action === "list"){
                if(target === "user" || target === "guild"){
                    let keys = await this.Controller.bot.config.getFields(target);
                    let fields: { name: string, value: any, type: ConfigDataType }[] = [];
                    for(let k of keys){
                        fields.push({
                            name: k,
                            value: (await this.Controller.bot.config.get(target, k) || {})[target === "user" ? interaction.user.id : interaction.guild?.id!],
                            type:  (await this.Controller.bot.config.getType(target, k))!
                        });
                    }
                    let text = this.makeList(fields);
                    var embd = new Discord.MessageEmbed({
                        title: `${target} config`,
                        description: "<field>: <type> = <value>\nAvailable Fields:\n" + text,
                        color: Colors.Noraml,
                    });
                    return resolve(await interaction.reply({ embeds: [ embd ] }).catch(reject));
                }else{
                    return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("This config namespace doesen't exist.") ] }).catch(reject));
                }
            }

            if(action === "set"){
                if(target === "user" || target === "guild"){
                    let keys = await this.Controller.bot.config.getFields(target);
                    if(!field || !keys.includes(field)){
                        return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("This field doesen't exist.") ] }).catch(reject));
                    }

                    let value = values[(await this.Controller.bot.config.getType(target, field))!];
                    
                    if(!value){
                        return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("Incorrect data type selected.") ] }).catch(reject));
                    }

                    if(typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number"){
                        value = value.id;
                    }

                    let old_value = (await this.Controller.bot.config.get(target, field) || {})[target === "user" ? interaction.user.id : interaction.guild?.id!];
                    
                    (await this.Controller.bot.config.get(target, field) || {})[target === "user" ? interaction.user.id : interaction.guild?.id!] = value;

                    var embd = new Discord.MessageEmbed({
                        title: `${target} config`,
                        description: `Successfully changed "${field}" from "${old_value || "`[not set]`"}" to "${value}"`,
                        color: Colors.Noraml,
                    });
                    return resolve(await interaction.reply({ embeds: [ embd ] }).catch(reject));
                }else{
                    return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("This config namespace doesen't exist.") ] }).catch(reject));
                }
            }
        });
    }
}