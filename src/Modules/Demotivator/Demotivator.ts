import { Access, Module, SynergyUserError, Synergy, AccessTarget, User } from "synergy3";
import Discord from "discord.js";
import { createCanvas, loadImage, registerFont, Image } from "canvas";
import got, { HTTPError } from "got/dist/source";
import Sharp from "sharp";
import RainbowBOTUtils from "../../RainbowBOTUtils";
/*
registerFont("./assets/fonts/arimobold.ttf", {
    family: "Arimo",
    weight: "700",
    style: "normal"
});
registerFont("./assets/fonts/heuristicaregular.ttf", {
    family: "Heuristica",
    weight: "400",
    style: "normal"
});
*/
export default class Demotivator extends Module{
    public Name:        string = "Demotivator";
    public Description: string = "Using this module you can create demotivators from messages (Click RMB on message -> Applications -> Demotivator)";
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

        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription("Create demotivator from text and image.")
                .addAttachmentOption(opt => opt
                    .setName("image")
                    .setDescription("Image to make demotivator from.")
                    .setRequired(true)
                )
                .addStringOption(opt => opt
                    .setName("primary-text")
                    .setDescription("Primary text in demotivator.")
                    .setRequired(true)
                )
                .addStringOption(opt => opt
                    .setName("secondary-text")
                    .setDescription("Secondary text in demotivator.")
                    .setRequired(false)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
    }

    public async Run(interaction: Discord.ContextMenuCommandInteraction | Discord.ChatInputCommandInteraction, user: User){
        let attachment;
        if(interaction.isChatInputCommand()) {
            attachment = interaction.options.getAttachment("image", true);
        } else if(interaction.isMessageContextMenuCommand()) {
            attachment = interaction.targetMessage.attachments.first();
        } else {
            throw new SynergyUserError("This command works only with Message context menu action or /ascii slash command.");
        }

        if(!attachment){
            throw new SynergyUserError("Message must contains the Image.");
        }

        let textPrimary: string;
        let textSecondary: string | undefined;

        if(interaction.isChatInputCommand()) {
            textPrimary = interaction.options.getString("primary-text", true);
            textSecondary = interaction.options.getString("secondary-text") ?? undefined;
        } else if(interaction.isMessageContextMenuCommand()) {
            if (interaction.targetMessage.content.length === 0) {
                throw new SynergyUserError("Message must contains text (1 or 2 lines).");
            }
            let txt = interaction.targetMessage.content.split("\n");
            textPrimary = txt[0];
            textSecondary = txt[1];
        } else {
            throw new SynergyUserError("This command works only with Message context menu action or /ascii slash command.");
        }

        await interaction.deferReply();

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

        let demot_canv = await Demotivator.drawDemotivator(img, textPrimary, textSecondary || undefined);
        let demot = demot_canv.toBuffer("image/png");
        await interaction.editReply({files: [ demot ]});
    }

    public static async drawDemotivator(image: Image, bigText: string, smallText?: string){
        let ratio = image.width / image.height;

        let res_width = 600;
        let res_height = Math.floor(res_width / ratio);

        let canvas = createCanvas(res_width, res_height);
        let ctx = canvas.getContext("2d");

        let margin_x = Math.floor(res_width / 10);
        let margin_y = Math.floor(res_height / 10);

        if(margin_x < 20){
            margin_x = 40;
        }
        if(margin_y < 20){
            margin_y = 40;
        }

        canvas.width += 2 * margin_x;
        canvas.height += 2 * margin_y;

        let max_line_big = canvas.width - (2 * margin_x);
        let max_line_smol = canvas.width - (3 * margin_x);

        //Split text to lines
        ctx.font = "48px Heuristica";
        let big_lines = RainbowBOTUtils.splitTextToLines(canvas, bigText, max_line_big);

        if(big_lines.length === 0){
            big_lines.push(bigText);
        }

        let small_lines: string[] | undefined;
        if(smallText){
            ctx.font = "24px Arimo";
            small_lines = RainbowBOTUtils.splitTextToLines(canvas, smallText, max_line_smol);

            if(small_lines.length === 0){
                small_lines.push(smallText);
            }
        }

        canvas.height = canvas.height + (big_lines.length * 48 * 1.5);
        if(small_lines){
            canvas.height = canvas.height + (small_lines.length * 24 * 1.5);
        }

        //Fill bg
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //Draw main rect and pic
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.strokeRect(margin_x - 5, margin_y - 5, res_width + 10, res_height + 10);
        ctx.drawImage(image, margin_x, margin_y, res_width, res_height);

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = "48px Heuristica";
        ctx.fillStyle = "#ffffff";

        let text_pos = 24;
        for(let t of big_lines){
            ctx.fillText(t, Math.floor(canvas.width / 2), res_height + margin_y + text_pos);
            text_pos += 48 * 1.5;
        }

        ctx.font = "24px Arimo";
        for(let t of small_lines || []){
            ctx.fillText(t, Math.floor(canvas.width / 2), res_height + margin_y + text_pos);
            text_pos += 24 * 1.5;
        }

        return canvas;
    }
}