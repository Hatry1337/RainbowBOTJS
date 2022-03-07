import { SlashCommandBuilder } from "@discordjs/builders";
import Discord, { Message } from "discord.js";
import got from "got";
import ModuleManager from "../../ModuleManager";
import { Emojis, Colors } from "../../Utils";
import Module from "../Module";
import IgniRender from "./IgniRender/IgniRender";
import GIFEncoder from "gifencoder";
import { createCanvas } from "canvas";
import Camera from "./IgniRender/Scene/Camera";
import { v3zero } from "./IgniRender/Utils3D";

export default class OBJRender extends Module{
    public Name:        string = "OBJRender";
    public Usage:       string = "`!rhelp [<page> <category>] `\n\n" +
                          "**Examples:**\n" +
                          "`!rhelp` - Shows first page of help menu.\n\n" +
                          "`!rhelp 2` - Shows second page of help menu.\n\n" +
                          "`!rhelp 1 Info` - Shows first page of \`Info\` category commands.\n\n";

    public Description: string = "Using this command you can render your .obj model file into image.";
    public Category:    string = "Graphics";
    public Author:      string = "Thomasss#9258";
    
    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addNumberOption(opt => opt
                    .setName("scale")
                    .setDescription("Model scale multiplier")
                ) 
                .addNumberOption(opt => opt
                    .setName("offset_x")
                    .setDescription("Model position offset on X axis")
                    .setMaxValue(1)
                )
                .addNumberOption(opt => opt
                    .setName("offset_y")
                    .setDescription("Model position offset on Y axis")
                    .setMaxValue(1)
                )
                .addNumberOption(opt => opt
                    .setName("offset_z")
                    .setDescription("Model position offset on Z axis")
                    .setMaxValue(1)
                )
                .addNumberOption(opt => opt
                    .setName("rot_x")
                    .setDescription("Model rotation on X axis")
                )
                .addNumberOption(opt => opt
                    .setName("rot_y")
                    .setDescription("Model rotation on Y axis")
                )
                .addNumberOption(opt => opt
                    .setName("rot_z")
                    .setDescription("Model rotation on Z axis")
                )
                .addNumberOption(opt => opt
                    .setName("cam_x")
                    .setDescription("Cam position on X axis")
                )
                .addNumberOption(opt => opt
                    .setName("cam_y")
                    .setDescription("Cam position on Y axis")
                )
                .addNumberOption(opt => opt
                    .setName("cam_z")
                    .setDescription("Cam position on Z axis")
                )
                .addBooleanOption(opt => opt
                    .setName("gif_rot")
                    .setDescription("Render as rotation gif animation.")
                ) as SlashCommandBuilder
        );
    }

    public async Init(){
        this.Controller.bot.PushSlashCommands(this.SlashCommands, process.env.NODE_ENV === "development" ? process.env.MASTER_GUILD : "global");
    }

    public Test(interaction: Discord.CommandInteraction){
        return interaction.commandName.toLowerCase() === this.Name.toLowerCase();
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let embd = new Discord.MessageEmbed({
                title: `OBJ Model Render`,
                description: "Reply with attached model file on this message. `(size < 1.5MB, .obj extension)`",
                color: Colors.Noraml
            });
            await interaction.reply({ embeds: [embd] }).catch(reject);
            let messages = await interaction.channel?.awaitMessages({ max: 1, time: 60000, 
                filter: (msg) => {
                    let flag: boolean = 
                        msg.mentions.repliedUser?.id === interaction.client.user?.id &&
                        msg.attachments.find(a => (a.name?.endsWith(".obj") && a.size < 1.5 * 1024 * 1024 * 1024) ? true : false ) ? true : false &&
                        msg.author.id === interaction.user.id;
                    
                    return flag;
                } 
            });
            let message = messages?.first();
            if(!message){
                embd = new Discord.MessageEmbed({
                    title: `OBJ Model Render`,
                    description: "Reply timedout or incorrect file provided.",
                    color: Colors.Noraml
                });
                return resolve(await interaction.editReply({ embeds: [embd] }).catch(reject) as Message); 
            }else{
                let attachment = message.attachments.find(a => (a.name?.endsWith(".obj") && a.size < 100 * 1024 * 1024) ? true : false )!;
                got(attachment.url).then(async data => {
                    let scale = interaction.options.getNumber("scale");

                    let off_x = interaction.options.getNumber("offset_x") || 0;
                    let off_y = interaction.options.getNumber("offset_y") || 0;
                    let off_z = interaction.options.getNumber("offset_z") || 0;

                    let rot_x = interaction.options.getNumber("rot_x") || 0;
                    let rot_y = interaction.options.getNumber("rot_y") || 0;
                    let rot_z = interaction.options.getNumber("rot_z") || 0;

                    let cam_x = interaction.options.getNumber("cam_x") || 0;
                    let cam_y = interaction.options.getNumber("cam_y") || 0;
                    let cam_z = interaction.options.getNumber("cam_z") || -2;

                    let gif_anim = interaction.options.getBoolean("gif_rot") || false;
                    
                    let igni = new IgniRender();
                    let model = igni.LoadOBJModel(data.body);

                    let cam = new Camera({
                        x: cam_x,
                        y: cam_y,
                        z: cam_z
                    }, v3zero(), igni);
                    cam.RenderResolution.Width = 960;
                    cam.RenderResolution.Height = 540;
                    cam.Width = 0.9;
                    cam.Height = 1.6;

                    igni.Scene.push(cam);
                    igni.Scene.push(model);

                    model.Position.x += off_x;
                    model.Position.y += off_y;
                    model.Position.z += off_z;

                    model.Rotation.x = rot_x;
                    model.Rotation.y = rot_y;
                    model.Rotation.z = rot_z;

                    if(!gif_anim){
                        let img = await cam.Render();
                        return resolve(message!.reply({ files: [ { attachment: img.toBuffer("image/png"), name: "render.png" } ]}).catch(reject));
                    }else{
                        let encoder = new GIFEncoder(960, 540);
                        encoder.setDelay(100);
                        encoder.setRepeat(0);
                        encoder.start();
                        for(let i = 0; i < 30; i++){
                            model.Rotation.y = i*12 * 0.0174533;
                            let f = await cam.Render();
                            encoder.addFrame(f.getContext("2d"));
                        }
                        encoder.finish();
                        return resolve(await message!.reply({ files: [ { attachment: encoder.out.getData(), name: "out.gif" } ]}).catch(reject));
                    }
                }).catch(reject);
            }
        });
    }
}