import { Access, AccessTarget, Module, Synergy, SynergyUserError } from "synergy3";
import Discord from "discord.js";
import { createCanvas, Image, loadImage } from "canvas";
import got, { HTTPError } from "got/dist/source";
import RainbowBOTUtils from "../../RainbowBOTUtils";

export default class Quote extends Module{
    public Name:        string = "Quote";
    public Description: string = "Using this module you can create quotes from messages (Click RMB on message -> Applications -> Quote)";
    public Category:    string = "Utility";
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
    }

    public async Run(interaction: Discord.ContextMenuCommandInteraction){
        if(!interaction.isMessageContextMenuCommand()){
            throw new SynergyUserError("This command works only with User context menu action.");
        }

        if(interaction.targetMessage.content.length === 0){
            throw new SynergyUserError("Message must contains text.");
        }

        await interaction.deferReply();

        let img;
        try {
            let url;
            if(interaction.inCachedGuild()){
                url = interaction.targetMessage.author.displayAvatarURL({
                    extension: "png",
                    size: 512
                });
            }else{
                url = `https://cdn.discordapp.com/avatars/${interaction.targetMessage.author.id}/${interaction.targetMessage.author.avatar}.png?size=512`;
            }
            let data = await got<Buffer>(url || interaction.user.defaultAvatarURL);
            img = await loadImage(data.rawBody);
        } catch (error: any) {
            if(error?.message?.startsWith("Unsupported image type")){
                throw new SynergyUserError("This type of images is not supported. Sorry :'(");
            }
            if(error instanceof HTTPError){
                throw new SynergyUserError("Can't fetch user's avatar.", `HTTP Error Code: ${error.code}`);
            }
            throw error;
        }

        let quote = await Quote.drawQuoteCard(img, 1200, 300, interaction.targetMessage.content, interaction.targetMessage.author.username + "#" + interaction.targetMessage.author.discriminator);
        await interaction.editReply({files: [quote.toBuffer("image/png")]});
    }

    public static drawQuoteCard(image: Image, width: number, height: number, text: string, author: string){
        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext("2d");

        let ratio = image.width / image.height;
        let res_height = canvas.height;
        let res_width = Math.floor(ratio * res_height);

        let half_width = Math.floor(canvas.width / 2);
        let margin_right = Math.floor(canvas.width / 32);
        let margin_y = Math.floor(canvas.height / 8);

        let pic_fact_x = res_width > half_width ? -(res_width - half_width) : 0;
        let pic_fact_width = res_width + pic_fact_x;
        
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.drawImage(image, pic_fact_x, 0, res_width, res_height);
        
        let gradient = ctx.createLinearGradient(0,0, pic_fact_width , margin_y);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, pic_fact_width, canvas.height)

        ctx.textDrawingMode = "glyph";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = "24px Comfortaa";
        ctx.fillStyle = "#ffffff";

        let big_lines = RainbowBOTUtils.splitTextToLines(canvas, text, canvas.width - pic_fact_width - margin_right);
        
        let line_height = 24 * 1.5;
        let fact_area = canvas.height - (2*margin_y);

        let overflow_flag = false;
        while(((big_lines.length + 1) * line_height) > fact_area && big_lines.length !== 0){
            big_lines.pop();
            overflow_flag = true;
        }

        if(overflow_flag){
            big_lines[big_lines.length-1] += "...";
        }
        
        let text_height = (big_lines.length + 1) * line_height;

        let text_pos = text_height < fact_area ? (fact_area - text_height) / 2 : 0;
        
        for(let t of big_lines.slice(0, 6)){
            ctx.fillText(t, half_width + (pic_fact_width / 2) - (margin_right / 2), margin_y + text_pos);
            text_pos += 24 * 1.5;
        }
        
        ctx.font = "italic 24px Comfortaa";
        ctx.fillText("- " + author, half_width + (pic_fact_width / 2) - (margin_right / 2), margin_y + text_pos);
        return canvas;
    }
}