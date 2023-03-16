import { Access, Module, SynergyUserError, Synergy, AccessTarget, User } from "synergy3";
import Discord from "discord.js";
import got, { HTTPError } from "got";
import Sharp from "sharp";

export default class Shakalize extends Module{
    public Name:        string = "Shakalize";
    public Description: string = "Using this module you can 'shakalize' (make low quality) any image!";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.bot.interactions.createMenuCommand(this.Name, this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setType(3)
            )
            .onExecute(this.Run.bind(this))
            .commit()

        this.bot.interactions.createMenuCommand(this.Name + " Ultra", this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setType(3)
            )
            .onExecute(this.Run.bind(this))
            .commit()

        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription("Shakalize attached image.")
                .addAttachmentOption(image =>
                    image
                        .setName("image")
                        .setDescription("Image to shakalize.")
                        .setRequired(true)
                )
                .addIntegerOption(quality =>
                    quality
                        .setName("quality")
                        .setDescription("Output image quality value (1-100)")
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(100)
                )
                .addNumberOption(blur =>
                    blur
                        .setName("blur")
                        .setDescription("Output image blur value (0.3-1000)")
                        .setRequired(false)
                        .setMinValue(0.3)
                        .setMaxValue(1000)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
    }

    public async Run(interaction: Discord.ContextMenuCommandInteraction | Discord.ChatInputCommandInteraction, user: User){
        let attachment;
        let quality = 10;
        let blur = 3;

        if(interaction.isChatInputCommand()) {
            attachment = interaction.options.getAttachment("image", true);
            quality = interaction.options.getInteger("quality") ?? quality;
            blur = interaction.options.getNumber("blur") ?? blur;
        } else if(interaction.isMessageContextMenuCommand()) {
            switch (interaction.commandName) {
                case this.Name + " Ultra": {
                    quality = 2;
                    blur = 3;
                    break;
                }
            }
            attachment = interaction.targetMessage.attachments.first();
        } else {
            throw new SynergyUserError("This command works only with Message context menu action or /shakalize slash command.");
        }

        if(!attachment){
            throw new SynergyUserError("Message must contains the Image.");
        }

        await interaction.deferReply();

        let image;
        try {
            let data = await got<Buffer>(attachment.url);
            image = data.rawBody;
        } catch (error: any) {
            if(error instanceof HTTPError){
                throw new SynergyUserError("Can't fetch this image.", `HTTP Error Code: ${error.code}`);
            }
            throw error;
        }

        let shakaledImage;
        try {
            shakaledImage = await Sharp(image).blur(blur).jpeg({ quality }).toBuffer();
        } catch (e) {
            throw new SynergyUserError("Cannot process attached file. Is it supported format image?");
        }
        await interaction.editReply({files: [ shakaledImage ]});
    }
}