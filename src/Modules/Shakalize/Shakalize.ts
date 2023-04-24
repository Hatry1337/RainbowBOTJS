import {
    Access,
    Module,
    SynergyUserError,
    Synergy,
    AccessTarget,
    User,
    EphemeralConfigEntry
} from "synergy3";
import Discord from "discord.js";
import got, { HTTPError } from "got";
import Sharp from "sharp";
import ContextCategory from "../ContextCategory/ContextCategory";

export default class Shakalize extends Module{
    public Name:        string = "Shakalize";
    public Description: string = "Using this module you can 'shakalize' (make low quality) any image!";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    private defaultPresetConf: EphemeralConfigEntry<"string">;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        ContextCategory.addCategoryEntry("Image Utils", {
            name: this.Name,
            module: this.Name,
            type: 3,
            handler: this.Run.bind(this)
        });

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
                .addStringOption(preset =>
                    preset
                        .setName("preset")
                        .setDescription("Shakalization preset to use")
                        .setRequired(false)
                        .addChoices(
                            { name: "default", value: "default" },
                            { name: "super", value: "super" },
                            { name: "ultra", value: "ultra" },
                            { name: "blurry", value: "blurry" },
                            { name: "jpegify", value: "jpegify" }
                        )
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()

        this.defaultPresetConf = this.bot.config.defaultConfigEntry("user", this.Name,
            new EphemeralConfigEntry(
                "shakalize_default_preset",
                "Default Shakalize context menu command preset. Values: 'super', 'ultra', 'blurry', 'jpegify'.",
                "string",
                false
            )
        );
    }

    public async Run(interaction: Discord.ContextMenuCommandInteraction | Discord.ChatInputCommandInteraction, user: User, compInt?: Discord.SelectMenuInteraction){
        let attachment;
        let quality = 10;
        let blur = 3;
        let preset;

        if(interaction.isChatInputCommand()) {
            attachment = interaction.options.getAttachment("image", true);
            preset = interaction.options.getString("preset", false);
            quality = interaction.options.getInteger("quality") ?? quality;
            blur = interaction.options.getNumber("blur") ?? blur;
        } else if(interaction.isMessageContextMenuCommand()) {
            attachment = interaction.targetMessage.attachments.first();
            preset = this.defaultPresetConf.getValue(interaction.user.id);
        } else {
            throw new SynergyUserError("This command works only with Message context menu action or /shakalize slash command.");
        }

        if(!attachment){
            throw new SynergyUserError("Message must contains the Image.");
        }

        if(compInt) {
            await compInt.deferReply();
        } else {
            await interaction.deferReply();
        }

        if(preset) {
            switch (preset) {
                case "super": {
                    quality = 6;
                    blur = 3;
                    break;
                }
                case "ultra": {
                    quality = 2;
                    blur = 3;
                    break;
                }
                case "blurry": {
                    quality = 100;
                    blur = 3;
                    break;
                }
                case "jpegify": {
                    quality = 3;
                    blur = 0;
                    break;
                }

                default: {
                    quality = 10;
                    blur = 3;
                    break;
                }
            }
        }

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
            let sharp = Sharp(image);
            if(blur !== 0) {
                sharp = sharp.blur(blur);
            }
            if(quality !== 100) {
                sharp = sharp.jpeg({ quality });
            }

            shakaledImage = await sharp.toBuffer();
        } catch (e) {
            throw new SynergyUserError("Cannot process attached file. Is it supported format image?");
        }

        if(compInt) {
            await compInt.editReply({files: [ shakaledImage ]});
        } else {
            await interaction.editReply({files: [ shakaledImage ]});
        }
    }
}