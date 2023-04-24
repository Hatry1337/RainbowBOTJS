import { Access, AccessTarget, Colors, Module, Synergy, SynergyUserError, User } from "synergy3";
import Discord from "discord.js";
import figlet from "figlet";
import got, { HTTPError } from "got";
import imageToAscii from "image-to-ascii";
import ContextCategory from "../ContextCategory/ContextCategory";

export default class ASCII extends Module{
    public Name:        string = "ASCII";
    public Description: string = "Draw text or images with ASCII characters.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Draw specified text with ASCII characters.")

            .addSubcommand(sub => sub
                .setName("fonts")
                .setDescription("Show list of available fonts.")    
            )
            .addSubcommand(sub => sub
                .setName("draw")
                .setDescription("Draw specified text with ASCII characters.")

                .addStringOption(opt => opt
                    .setName("text")
                    .setDescription("Text to draw with ASCII characters.")    
                    .setRequired(true)
                )
                .addStringOption(opt => opt
                    .setName("font")
                    .setDescription("Font to draw this text.")
                    .setRequired(false)
                )
            )
            .addSubcommand(sub => sub
                .setName("art")
                .setDescription("Draw specified image with ASCII characters.")

                .addAttachmentOption(opt => opt
                    .setName("image")
                    .setDescription("Image to draw with ASCII characters.")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub => sub
                .setName("art_file")
                .setDescription("Draw specified image with ASCII characters to file.")

                .addAttachmentOption(opt => opt
                    .setName("image")
                    .setDescription("Image to draw with ASCII characters.")
                    .setRequired(true)
                )
            )
        )
        .onExecute(this.handleDrawText.bind(this))
        .commit()

        ContextCategory.addCategoryEntry("Image Utils", {
            name: "ASCII Art",
            module: this.Name,
            type: 3,
            handler: this.handleDrawPicture.bind(this)
        });

        ContextCategory.addCategoryEntry("Image Utils", {
            name: "ASCII Art to File",
            module: this.Name,
            type: 3,
            handler: this.handleDrawPicture.bind(this)
        });
    }

    public async handleDrawText(int: Discord.ChatInputCommandInteraction, user: User){
        let fonts = await this.getFontsList();
        let subc = int.options.getSubcommand();

        if(subc === "art" || "art_file") {
            await this.handleDrawPicture(int, user);
            return;
        }

        if(subc === "fonts"){
            let messages = [];
            let msg = "";
            for(let f of fonts){
                if(msg.length + f.length + 4 > 1024){
                    messages.push(msg);
                    msg = "";
                }
                msg += `\`${f}\`, `;
            }
            if(msg.length !== 0){
                messages.push(msg.slice(0, msg.length - 2));
            }

            let emb = new Discord.EmbedBuilder({
                title: "Available ASCII fonts",
                color: Colors.Noraml,
                fields: messages.map((m, i) => ({ name: `Page ${i+1}`, value: m }))
            });

            await int.reply({ embeds: [emb] });
            return;

        }else if(subc === "draw"){
            let text = int.options.getString("text", true);
            let font = int.options.getString("font", false) || "Doom";

            if(fonts.indexOf(font as figlet.Fonts) === -1) throw new SynergyUserError("This font does not exist!");
            let result = await this.drawText(text, font as figlet.Fonts);

            await int.reply("```" + result + "```");
            return;
        }else{
            throw new SynergyUserError("This subcommand is not implemented!");
        }
    }

    public async handleDrawPicture(interaction: Discord.ContextMenuCommandInteraction | Discord.ChatInputCommandInteraction, user: User, compInt?: Discord.SelectMenuInteraction){
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

        let img: Buffer;
        try {
            let resp = await got<Buffer>(attachment.url);
            img = resp.rawBody;
        } catch (error: any) {
            if(error instanceof HTTPError){
                throw new SynergyUserError("Can't fetch this image.", `HTTP Error Code: ${error.code}`);
            }
            throw error;
        }

        if(compInt) {
            await compInt.deferReply();
        } else {
            await interaction.deferReply();
        }

        let file_flag = false;

        if(compInt) {
            file_flag = compInt.values[0] === "ASCII Art to File";
        } else if(interaction.isChatInputCommand()) {
            file_flag = interaction.options.getSubcommand() === "art_file";
        } else if(interaction.isMessageContextMenuCommand()) {
            file_flag = interaction.commandName === "ASCII Art to File";
        }

        if(file_flag){
            let result = await this.drawImage(img, 60);
            if(compInt) {
                await compInt.editReply({files: [ { attachment: Buffer.from(result, "utf-8"), name: "artwork.txt" } ]});
            } else {
                await interaction.editReply({files: [ { attachment: Buffer.from(result, "utf-8"), name: "artwork.txt" } ]});
            }
            return;
        }

        let result = await this.drawImage(img);

        if(result.length + 6 > 2000){
            throw new SynergyUserError("Cannot send this art as message! Try to use `ASCII Art to File` instead.");
        }

        if(compInt) {
            await compInt.editReply("```" + result + "```");
        } else {
            await interaction.editReply("```" + result + "```");
        }
    }

    public drawImage(img: Buffer, max_w: number = 30){
        return new Promise<string>((res, rej) => {
            imageToAscii(img, {
                colored: false,
                size: {
                    width: max_w
                },
                pixels: "##XXxxx+++===---;;,,...    ".split("").reverse()
            }, (err, converted) => {
                if(err || !converted){
                    return rej(err);
                }
                res(converted);
            });
        });
    }

    public getFontsList() {
        return new Promise<figlet.Fonts[]>((res, rej) => {
            figlet.fonts((err, fonts) => {
                if(err || !fonts){
                    return rej(err);
                }
                res(fonts);
            });
        });
    }

    public drawText(text: string, font?: figlet.Fonts){
        return new Promise<string>((res, rej) => {
            figlet(text, { font: font || "Doom", horizontalLayout: "fitted" }, (err, result) => {
                if(err || !result){
                    return rej(err);
                }
                res(result);
            });
        });
    }
}