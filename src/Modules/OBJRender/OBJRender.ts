import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import got, { HTTPError } from "got";
import IgniRender from "./IgniRender/IgniRender";
import GIFEncoder from "gifencoder";
import Camera from "./IgniRender/Scene/Camera";
import { v3zero } from "./IgniRender/Utils3D";
import { Access, AccessTarget, Colors, Module, ModuleManager, Synergy, SynergyUserError } from "synergy3";

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
                .addAttachmentOption(opt => opt
                    .setName("model")
                    .setDescription(".obj model file")
                    .setRequired(true)
                )
                .addNumberOption(opt => opt
                    .setName("scale")
                    .setDescription("Model scale multiplier")
                ) 
                .addNumberOption(opt => opt
                    .setName("offset_x")
                    .setDescription("Model position offset on X axis")
                )
                .addNumberOption(opt => opt
                    .setName("offset_y")
                    .setDescription("Model position offset on Y axis")
                )
                .addNumberOption(opt => opt
                    .setName("offset_z")
                    .setDescription("Model position offset on Z axis")
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

    public async Run(interaction: Discord.ChatInputCommandInteraction) {
        let attachment = interaction.options.getAttachment("model", true);

        if (!attachment.url.endsWith(".obj")) {
            throw new SynergyUserError("File must have `.obj` extension.");
        }

        if (attachment.size > 3 * 1024 * 1024 * 1024) {
            throw new SynergyUserError("File must be under 3 MB in size.");
        }

        await interaction.deferReply();

        let data: string;

        try {
            let {body} = await got(attachment.url);
            data = body;
        } catch (e) {
            if (e instanceof HTTPError) {
                throw new SynergyUserError(`File fetching error. HTTP Code: ${e.code}.`);
            }
            throw e;
        }

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
        let model = igni.LoadOBJModel(data);

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

        if (!gif_anim) {
            let img = await cam.Render();
            await interaction.editReply({files: [{attachment: img.toBuffer("image/png"), name: "render.png"}]});
            return;
        } else {
            let encoder = new GIFEncoder(960, 540);
            encoder.setDelay(100);
            encoder.setRepeat(0);
            encoder.start();
            for (let i = 0; i < 30; i++) {
                model.Rotation.y = i * 12 * 0.0174533;
                let f = await cam.Render();
                //FIXME canvas type issue
                encoder.addFrame(f.getContext("2d") as any);
            }
            encoder.finish();
            await interaction.editReply({files: [{attachment: encoder.out.getData(), name: "out.gif"}]});
            return;
        }
    }
}