import Discord from "discord.js";
import { Access, AccessTarget, Colors, Module, Synergy, SynergyUserError } from "synergy3";
import { AnekAPI, Anek as AAnek } from "./AnekAPI";

export default class Anek extends Module{
    public Name:        string = "Anek";
    public Description: string = "Using this command you can enjoy some aneks of B category.";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addStringOption(opt => opt
                    .setName("tag")
                    .setDescription("BAnek query tag. Use \"List\" to list all tags.")
                    .setRequired(false)
                )
                .addIntegerOption(opt => opt
                    .setName("id")
                    .setDescription("BAnek query id.")
                    .setRequired(false)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }
    
    private makeEmbed(anek: AAnek){
        let embd = new Discord.MessageEmbed({
            title: `Anek of B category number ${anek.id}`,
            description: `${anek.anek}\n\nSource: ${anek.source}${anek.tags.length > 0 ? `, Tags: \`${anek.tags.join("`, `")}\`` : ""}`,
            color: Colors.Noraml
        });
        return embd;
    }

    public async Run(interaction: Discord.CommandInteraction){
        let tag = interaction.options.getString("tag");
        let id = interaction.options.getInteger("id");

        let anek: AAnek;

        if(tag){
            if(tag === "List"){
                let tags: string[];

                try {
                    tags = await AnekAPI.GetTags();
                } catch (err) {
                    this.Logger.Error("Anek.Tags.RequestFailedError:", err);
                    throw new SynergyUserError("Cannot get aneks tags. Please try again later, or contact with support.");
                }

                let embd = new Discord.MessageEmbed({
                    title: `Aneks of B category tags`,
                    description: `Existing tags: \`${tags.join("`, `")}\``,
                    color: Colors.Noraml
                });
                
                return await interaction.reply({ embeds: [embd] });
            }else{
                try {
                    anek = await AnekAPI.GetTaggedRandomAnek(tag);
                } catch (err) {
                    this.Logger.Error("Anek.AnekID.RequestFailedError:", err);
                    throw new SynergyUserError("Cannot get this anek. Is it exist? If you're sure, contact with support.");
                }
            }
        }else if(id){
            try {
                anek = await AnekAPI.GetAnek(id);
            } catch (err) {
                this.Logger.Error("Anek.AnekID.RequestFailedError:", err);
                throw new SynergyUserError("Cannot get this anek. Is it exist? If you're sure, contact with support.");
            }
        }else{
            try {
                anek = await AnekAPI.GetRandomAnek();
            } catch (err) {
                this.Logger.Error("Anek.RandomAnek.RequestFailedError:", err);
                throw new SynergyUserError("Cannot get this anek. Is it exist? If you're sure, contact with support.");
            }
        }

        return await interaction.reply({ embeds: [this.makeEmbed(anek)] });
    }
}