import { Access, AccessTarget, Module, Synergy, SynergyUserError, User } from "synergy3";
import Discord from "discord.js";

export interface ICategory {
    name: string;
    type: Discord.ContextMenuCommandType;
    entries: Map<string, ICategoryEntry>;
}

export interface ICategoryEntry {
    name: string;
    module: string;
    type: Discord.ContextMenuCommandType;
    handler: (interaction: Discord.ContextMenuCommandInteraction, user: User, compInt: Discord.StringSelectMenuInteraction) => Promise<void>;
}

export default class ContextCategory extends Module{
    public Name:        string = "ContextCategory";
    public Description: string = "Internal utility module to manage Context Menu commands.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    private static categories: Map<string, ICategory> = new Map();

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
    }

    private async handleMenuCommand(interaction: Discord.ContextMenuCommandInteraction, user: User) {
        let category = ContextCategory.categories.get(interaction.commandName);
        if(!category) {
            throw new SynergyUserError(`Cannot find ${interaction.commandName} category. Report this issue please.`);
        }

        let selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`${interaction.user.id}-categorySelect-${interaction.commandName}`)
            .addOptions(Array.from(category.entries.values()).map(e => ({ label: e.name, value: e.name })));

        let row = new Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        let response = await interaction.reply({
            content: "Select command to execute",
            components: [ row ],
            ephemeral: true
        });

        let compInt = await response.awaitMessageComponent();
        if(compInt.isSelectMenu()) {
            let commandName = compInt.values[0];

            let command = category.entries.get(commandName);
            if(!command) {
                throw new SynergyUserError(`Cannot find ${commandName} command on this category. Report this issue please.`);
            }

            await command.handler(interaction, user, compInt);
            await interaction.deleteReply();
        }
    }

    public async Init(): Promise<void> {
        this.Logger.Info("Initializing Context categories...");
        for(let category of ContextCategory.categories.values()) {
            this.Logger.Info(`  # Category: ${category.name}`);

            this.createMenuCommand(category.name)
                .build(builder => builder
                    .setType(category.type)
                )
                .onExecute(this.handleMenuCommand.bind(this));

            for(let e of category.entries.values()) {
                this.Logger.Info(`    * : ${e.name} (${e.module})`);
            }
        }
        this.Logger.Info("Context categories initialized.");
    }

    public static addCategoryEntry(categoryName: string, entry: ICategoryEntry) {
        let category = ContextCategory.categories.get(categoryName);
        if(!category) {
            category = {
                name: categoryName,
                type: entry.type,
                entries: new Map<string, ICategoryEntry>()
            }
        }

        if(entry.type !== category.type) {
            throw new Error("Entry with this type is not assignable to specified category.");
        }

        category.entries.set(entry.name, entry);
        ContextCategory.categories.set(categoryName, category);
    }
}