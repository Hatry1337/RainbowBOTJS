import { Access, Module, SynergyUserError, Synergy, AccessTarget, User } from "synergy3";
import Discord from "discord.js";
import { createCanvas, loadImage, Image } from "canvas";
import got, { HTTPError } from "got/dist/source";
import Sharp from "sharp";
import RainbowBOTUtils from "../../RainbowBOTUtils";
import ContextCategory from "../ContextCategory/ContextCategory";

export default class MkMeme extends Module{
    public Name:        string = "MkMeme";
    public Description: string = "Using this module you can create memes";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

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
                .setDescription("Create meme from text and image.")
                .addAttachmentOption(opt => opt
                    .setName("image")
                    .setDescription("Image to make meme from.")
                    .setRequired(true)
                )
                .addStringOption(opt => opt
                    .setName("upper-text")
                    .setDescription("Upper text of the meme.")
                    .setRequired(false)
                )
                .addStringOption(opt => opt
                    .setName("bottom-text")
                    .setDescription("Bottom text of the meme.")
                    .setRequired(false)
                )
                .addIntegerOption(opt => opt
                    .setName("text-size")
                    .setDescription("Size of the both texts.")
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(256)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
    }

    public async Run(interaction: Discord.ContextMenuCommandInteraction | Discord.ChatInputCommandInteraction, user: User, compInt?: Discord.SelectMenuInteraction){
        let attachment;
        if(interaction.isChatInputCommand()) {
            attachment = interaction.options.getAttachment("image", true);
        } else if(interaction.isMessageContextMenuCommand()) {
            attachment = interaction.targetMessage.attachments.first();
        } else {
            throw new SynergyUserError("This command works only with Message context menu action or /mkmeme slash command.");
        }

        if(!attachment){
            throw new SynergyUserError("Message must contains the Image.");
        }

        let upperText: string | undefined;
        let bottomText: string | undefined;
        let textSize: number | undefined;


        if(interaction.isChatInputCommand()) {
            upperText = interaction.options.getString("upper-text", true);
            bottomText = interaction.options.getString("bottom-text") ?? undefined;
            textSize = interaction.options.getInteger("text-size") ?? undefined;
        } else if(interaction.isMessageContextMenuCommand()) {
            if (interaction.targetMessage.content.length === 0) {
                throw new SynergyUserError("Message must contains text (1 or 2 lines).");
            }
            let txt = interaction.targetMessage.content.split("\n");
            upperText = txt[0];
            bottomText = txt[1];

            if(upperText && !bottomText) {
                bottomText = upperText;
                upperText = undefined;
            }
        } else {
            throw new SynergyUserError("This command works only with Message context menu action or /mkmeme slash command.");
        }

        if(compInt) {
            await compInt.deferReply();
        } else {
            await interaction.deferReply();
        }

        let img;
        try {
            let data = await got<Buffer>(attachment.url);
            let png = await Sharp(data.rawBody).toFormat("png").toBuffer();
            img = await loadImage(png);
        } catch (error: any) {
            if(error instanceof HTTPError){
                throw new SynergyUserError("Can't fetch this image.", `HTTP Error Code: ${error.code}`);
            }
            throw error;
        }

        let memeCanvas = await MkMeme.drawMeme(img, textSize, upperText, bottomText || undefined);
        let meme = memeCanvas.toBuffer("image/png");

        if(compInt) {
            await compInt.editReply({files: [ meme ]});
        } else {
            await interaction.editReply({files: [ meme ]});
        }
    }

    public static async drawMeme(image: Image, textSize?: number, upperText?: string, bottomText?: string){
        let canvas = createCanvas(image.width, image.height);
        let ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0);

        if(!upperText && !bottomText) return canvas;

        if(textSize === undefined) {
            textSize = Math.floor(canvas.height / 10);
        }

        let margin_x = Math.floor(canvas.width / 10);
        let margin_y = Math.floor(textSize / 4);

        if(margin_x < 5){
            margin_x = 10;
        }
        if(margin_y < 5){
            margin_y = 10;
        }

        let maxLineWidth = canvas.width - (2 * margin_x);

        ctx.font = `${textSize}px Impact`;
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = textSize > 48 ? 2 : 1;

        let upperLines: string[] | undefined;
        let bottomLines: string[] | undefined;

        if(upperText) {
            upperLines = RainbowBOTUtils.splitTextToLines(canvas, upperText, maxLineWidth);
        }

        if(bottomText) {
            bottomLines = RainbowBOTUtils.splitTextToLines(canvas, bottomText, maxLineWidth);
        }

        let canvasCenterX = Math.floor(canvas.width / 2);

        if(upperLines) {
            let text_pos = 0; //margin_y;
            for(let l of upperLines){
                ctx.fillText(l, canvasCenterX, text_pos);
                ctx.strokeText(l, canvasCenterX, text_pos);
                text_pos += Math.floor(textSize * 1.125);
            }
        }

        if(bottomLines) {
            let text_pos = canvas.height - margin_y - textSize;
            for(let l of bottomLines.reverse()){
                ctx.fillText(l, canvasCenterX, text_pos);
                ctx.strokeText(l, canvasCenterX, text_pos);
                text_pos -= Math.floor(textSize  * 1.125);
            }
        }

        return canvas;
    }
}