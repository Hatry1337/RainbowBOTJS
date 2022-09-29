import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import got from "got";
import IgniRender from "./IgniRender/IgniRender";
import GIFEncoder from "gifencoder";
import Camera from "./IgniRender/Scene/Camera";
import { v3zero } from "./IgniRender/Utils3D";
import { Access, AccessTarget, Colors, Module, ModuleManager, Synergy } from "synergy3";
import { Scene } from "./IgniRender/Scene/Scene";

export default class OBJRender extends Module{
    public Name:        string = "OBJRender";
    public Description: string = "Using this command you can render your .obj model file into image.";
    public Category:    string = "Graphics";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];
    
    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
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
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }

    public Run(interaction: Discord.CommandInteraction){
        return new Promise<void>(async (resolve, reject) => {
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
                await interaction.editReply({ embeds: [embd] }).catch(reject);
                return resolve(); 
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
                    
                    let scene = new Scene();
                    let model = IgniRender.LoadOBJModel(scene, data.body);
                    scene.addObject(model);

                    let cam = new Camera(scene, {
                        x: cam_x,
                        y: cam_y,
                        z: cam_z
                    }, v3zero());
                    scene.addObject(cam);

                    cam.renderResolution.Width = 960;
                    cam.renderResolution.Height = 540;
                    
                    model.Move({
                        x: off_x,
                        y: off_y,
                        z: off_z
                    });

                    model.SetRotation({
                        x: rot_x,
                        y: rot_y,
                        z: rot_z
                    });

                    if(!gif_anim){
                        let img = await cam.Render();
                        await message!.reply({ files: [ { attachment: img.toBuffer("image/png"), name: "render.png" } ]}).catch(reject);
                        return resolve();
                    }else{
                        let encoder = new GIFEncoder(960, 540);
                        encoder.setDelay(100);
                        encoder.setRepeat(0);
                        encoder.start();
                        for(let i = 0; i < 30; i++){
                            model.SetRotation({
                                x: model.rotation.x,
                                y: i*12 * 0.0174533,
                                z: model.rotation.z
                            });
                            let f = await cam.Render();
                            encoder.addFrame(f.getContext("2d"));
                        }
                        encoder.finish();
                        await message!.reply({ files: [ { attachment: encoder.out.getData(), name: "out.gif" } ]}).catch(reject);
                        return resolve();
                    }
                }).catch(reject);
            }
        });
    }
}