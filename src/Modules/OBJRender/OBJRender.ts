import Discord from "discord.js";
import got from "got";
import IgniRender from "./IgniRender/IgniRender";
import Camera from "./IgniRender/Scene/Camera";
import { v3zero, vec3 } from "./IgniRender/Utils3D";
import {
    Access,
    AccessTarget,
    CallbackTypeOf,
    Module,
    Synergy,
    SynergyUserError,
    User
} from "synergy3";
import { Scene } from "./IgniRender/Scene/Scene";
import AxesMarker from "./IgniRender/Scene/AxesMarker";
import PolyObject from "./IgniRender/Scene/PolyObject";
import SceneObject from "./IgniRender/Scene/SceneObject";

export default class OBJRender extends Module{
    public Name:        string = "OBJRender";
    public Description: string = "Using this command you can render your .obj model file into image.";
    public Category:    string = "Graphics";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    //FIXME do something with unexpected cache cleaning
    public scenes: WeakMap<User, Scene> = new WeakMap<User, Scene>();

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)

                .addSubcommandGroup(opt => opt
                    .setName("scene")
                    .setDescription("Commands to configure scene")

                    .addSubcommand(opt => opt
                        .setName("create")
                        .setDescription("Create new scene")
                    )

                    .addSubcommand(opt => opt
                        .setName("load")
                        .setDescription("Load scene from json format")

                        .addStringOption(opt => opt
                            .setName("json")
                            .setDescription("Scene json data")
                            .setRequired(true)
                        )
                    )

                    .addSubcommand(opt => opt
                        .setName("export")
                        .setDescription("Export scene to json format")
                    )

                    .addSubcommand(opt => opt
                        .setName("objects")
                        .setDescription("List all objects in scene.")
                    )

                    .addSubcommand(opt => opt
                        .setName("remove_object")
                        .setDescription("Remove object with specified name from scene")
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of object to remove")
                            .setRequired(true)
                        )
                    )

                    .addSubcommand(opt => opt
                        .setName("add_axes_marker")
                        .setDescription("Add axes marker to the scene.")
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of new axes marker to refer later")
                            .setRequired(true)
                        )
                    )

                    .addSubcommand(opt => opt
                        .setName("add_model")
                        .setDescription("Add new .obj model to the scene.")
                        .addAttachmentOption(opt => opt
                            .setName("model")
                            .setDescription("Wavefront model file (.obj)")
                            .setRequired(true)
                        )
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of new model to refer later")
                            .setRequired(true)
                        )
                    )

                    .addSubcommand(opt => opt
                        .setName("add_camera")
                        .setDescription("Add new camera to the scene.")
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of new camera to refer later")
                            .setRequired(true)
                        )
                    )
                )

                .addSubcommandGroup(opt => opt
                    .setName("object")
                    .setDescription("Commands related to scene objects")

                    .addSubcommand(opt => opt
                        .setName("move")
                        .setDescription("Move object in scene")
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of object to move")
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("offset_x")
                            .setDescription("Object position offset on X axis")
                        )
                        .addNumberOption(opt => opt
                            .setName("offset_y")
                            .setDescription("Object position offset on Y axis")
                        )
                        .addNumberOption(opt => opt
                            .setName("offset_z")
                            .setDescription("Object position offset on Z axis")
                        )
                    )

                    .addSubcommand(opt => opt
                        .setName("rotate")
                        .setDescription("Set object rotation in scene")
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of object to rotate")
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("rot_x")
                            .setDescription("Object rotation on X axis")
                        )
                        .addNumberOption(opt => opt
                            .setName("rot_y")
                            .setDescription("Object rotation on Y axis")
                        )
                        .addNumberOption(opt => opt
                            .setName("rot_z")
                            .setDescription("Object rotation on Z axis")
                        )
                    )

                    .addSubcommand(opt => opt
                        .setName("scale")
                        .setDescription("Set object scale in scene")
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of object to scale")
                            .setRequired(true)
                        )
                        .addNumberOption(opt => opt
                            .setName("scale_x")
                            .setDescription("Object scale on X axis")
                        )
                        .addNumberOption(opt => opt
                            .setName("scale_y")
                            .setDescription("Object scale on Y axis")
                        )
                        .addNumberOption(opt => opt
                            .setName("scale_z")
                            .setDescription("Object scale on Z axis")
                        )
                    )
                )

                .addSubcommandGroup(opt => opt
                    .setName("camera")
                    .setDescription("Cameras related commands")

                    .addSubcommand(opt => opt
                        .setName("get_viewport")
                        .setDescription("Get viewport of specified camera")
                        .addStringOption(opt => opt
                            .setName("name")
                            .setDescription("Name of object to scale")
                            .setRequired(true)
                        )
                    )
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }

    //--------------------------------------------------------------------------------------------------

    public async handleSceneCommands(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let subcommandHandlers: {
            [key: string]:  CallbackTypeOf<Discord.SlashCommandBuilder>
        } = {
            "create": this.handleSceneCreate,
            "load": this.handleSceneLoad,
            "export": this.handleSceneExport,
            "objects": this.handleSceneObjects,
            "remove_object": this.handleSceneRemoveObject,
            "add_axes_marker": this.handleSceneAddAxesMarker,
            "add_model": this.handleSceneAddModel,
            "add_camera": this.handleSceneAddCamera,
        }

        let subcommand = interaction.options.getSubcommand(true);

        await subcommandHandlers[subcommand].bind(this)(interaction, user);
        return;
    }

    public async handleSceneLoad(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = new Scene();
        this.scenes.set(user, scene);

        await interaction.deferReply();

        let json = interaction.options.getString("json", true);
        let data: {
            id: string,
            name: string,
            type: string,
            position: vec3,
            rotation: vec3,
            visible: boolean,
            size: vec3 | undefined,
            reference: string | undefined,
        }[];
        try {
            data = JSON.parse(json);
        } catch (e) {
            throw new SynergyUserError("Cannot parse your json data.");
        }

        for(let o of data) {
            let obj = scene.objects.find(of => of.name === o.name);
            if(obj) {
                throw new SynergyUserError(`Object with name ${o.name} defined more than once.`);
            }

            let newObj!: SceneObject;
            switch (o.type) {
                case "AxesMarker": {
                    newObj = new AxesMarker(o.name, o.position, o.rotation);
                    break;
                }
                case "Camera": {
                    newObj = new Camera(o.name, o.position, o.rotation);
                    break;
                }
                case "PolyObject": {
                    if(!o.reference) continue;

                    if(!o.reference.endsWith(".obj")){
                        throw new SynergyUserError("Model reference file is not .obj extension.");
                    }
                    let data = await got(o.reference);
                    if(data.rawBody.length > 3 * 1024 * 1024) {
                        throw new SynergyUserError("Model reference file is too large.");
                    }

                    let model = IgniRender.LoadOBJModel(o.name, data.body, o.reference);
                    if(o.size) {
                        model.size = o.size;
                    }
                    model.reference = o.reference;
                    newObj = model;
                    break;
                }
                default: {
                    throw new SynergyUserError(`Unknown object type \`${o.type}\` of \`${o.name}\``);
                }
            }

            newObj.id = o.id;
            newObj.name = o.name;
            newObj.position = o.position;
            newObj.rotation = o.rotation;
            newObj.visible = o.visible;
            scene.addObject(newObj);
        }

        await interaction.editReply("You successfully loaded Scene.");
    }

    public async handleSceneExport(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;

        let json_data = scene.objects.map(o => ({
            id: o.id,
            name: o.name,
            type: o.constructor.name,
            position: o.position,
            rotation: o.rotation,
            visible: o.visible,
            size: o instanceof PolyObject ? o.size : undefined,
            reference: o instanceof PolyObject ? o.reference : undefined,
        }));

        await interaction.reply("```json\n" + JSON.stringify(json_data) + "```");
    }

    public async handleSceneCreate(interaction: Discord.ChatInputCommandInteraction, user: User) {
        this.scenes.set(user, new Scene());
        await interaction.reply("You successfully created new Scene.");
    }

    public async handleSceneObjects(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;

        let text = "```yml\nObjects in scene:\n\n"

        for(let o of scene.objects) {
            text += `${o.name}: ${o.constructor.name}\n`;
        }

        await interaction.reply(text + "```");
    }

    public async handleSceneRemoveObject(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let obj = scene.objects.find(o => o.name === name);
        if(!obj) {
            throw new SynergyUserError(
                `Can't find object with name \`${name}\` in your scene.`,
                "Use `/objrender scene objects` to list all objects in scene."
            );
        }

        scene.removeObject(obj);
        await interaction.reply(`You successfully removed object \`${name}\` from your scene.`);
    }

    public async handleSceneAddAxesMarker(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let obj = scene.objects.find(o => o.name === name);
        if(obj) {
            throw new SynergyUserError("Object with this name already exist.");
        }

        scene.addObject(new AxesMarker(name, v3zero(), v3zero()));

        await interaction.reply("You successfully added axes marker to your scene. ");
    }

    public async handleSceneAddModel(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let obj = scene.objects.find(o => o.name === name);
        if(obj) {
            throw new SynergyUserError("Object with this name already exist.");
        }

        let model = interaction.options.getAttachment("model", true);

        if(!model.url.endsWith(".obj") || model.size > 3 * 1024 * 1024){
            throw new SynergyUserError("Your file is not .obj extension file or bigger than 3 MB.");
        }

        await interaction.deferReply();

        let data = await got(model.url);
        let model3d = IgniRender.LoadOBJModel(name, data.body, model.url);
        scene.addObject(model3d);

        await interaction.editReply("You successfully added model to your scene. ");
    }

    public async handleSceneAddCamera(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let obj = scene.objects.find(o => o.name === name);
        if(obj) {
            throw new SynergyUserError("Object with this name already exist.");
        }

        scene.addObject(new Camera(name, v3zero(), v3zero()));

        await interaction.reply("You successfully added camera to your scene. ");
    }

    //--------------------------------------------------------------------------------------------------

    public async handleObjectCommands(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let subcommandHandlers: {
            [key: string]:  CallbackTypeOf<Discord.SlashCommandBuilder>
        } = {
            "move": this.handleObjectMove,
            "rotate": this.handleObjectRotate,
            "scale": this.handleObjectScale,
        }

        let subcommand = interaction.options.getSubcommand(true);

        await subcommandHandlers[subcommand].bind(this)(interaction, user);
        return;
    }

    public async handleObjectMove(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let obj = scene.objects.find(o => o.name === name);
        if(!obj) {
            throw new SynergyUserError(
                `Can't find object with name \`${name}\` in your scene.`,
                "Use `/objrender scene objects` to list all objects in scene."
            );
        }

        let off_x = interaction.options.getNumber("offset_x") || 0;
        let off_y = interaction.options.getNumber("offset_y") || 0;
        let off_z = interaction.options.getNumber("offset_z") || 0;

        obj.Move({
            x: off_x,
            y: off_y,
            z: off_z
        });

        await interaction.reply(`You successfully moved object \`${name}\``);
    }

    public async handleObjectRotate(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let obj = scene.objects.find(o => o.name === name);
        if(!obj) {
            throw new SynergyUserError(
                `Can't find object with name \`${name}\` in your scene.`,
                "Use `/objrender scene objects` to list all objects in scene."
            );
        }

        let rot_x = interaction.options.getNumber("rot_x") || 0;
        let rot_y = interaction.options.getNumber("rot_y") || 0;
        let rot_z = interaction.options.getNumber("rot_z") || 0;

        obj.Rotate({
            x: rot_x,
            y: rot_y,
            z: rot_z
        });

        await interaction.reply(`You successfully rotated object \`${name}\``);
    }

    public async handleObjectScale(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let obj = scene.objects.find(o => o.name === name);
        if(!obj) {
            throw new SynergyUserError(
                `Can't find object with name \`${name}\` in your scene.`,
                "Use `/objrender scene objects` to list all objects in scene."
            );
        }

        let scale_x = interaction.options.getNumber("scale_x") || 0;
        let scale_y = interaction.options.getNumber("scale_y") || 0;
        let scale_z = interaction.options.getNumber("scale_z") || 0;

        if(!(obj instanceof PolyObject)) {
            throw new SynergyUserError("You can't scale this object.");
        }

        obj.SetSize({
            x: scale_x,
            y: scale_y,
            z: scale_z
        });

        await interaction.reply(`You successfully scaled object \`${name}\``);
    }

    //--------------------------------------------------------------------------------------------------

    public async handleCameraCommands(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let subcommandHandlers: {
            [key: string]:  CallbackTypeOf<Discord.SlashCommandBuilder>
        } = {
            "get_viewport": this.handleCameraGetViewport,
        }

        let subcommand = interaction.options.getSubcommand(true);

        await subcommandHandlers[subcommand].bind(this)(interaction, user);
        return;
    }

    public async handleCameraGetViewport(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let scene = this.scenes.get(user)!;
        let name = interaction.options.getString("name", true);

        let camera = scene.objects.find(o => o.name === name);
        if(!camera) {
            throw new SynergyUserError(
                `Can't find object with name \`${name}\` in your scene.`,
                "Use `/objrender scene objects` to list all objects in scene."
            );
        }

        if(!(camera instanceof Camera)) {
            throw new SynergyUserError("Specified object is not a camera.");
        }

        await interaction.deferReply();

        let img = await camera.Render();

        let button = this.createMessageButton(`update-viewport-${user.discordId}-${camera.name}`)
            .onExecute(this.handleViewportUpdate.bind(this))
            .build(btn => btn
                .setStyle(Discord.ButtonStyle.Primary)
                .setLabel("Update")
                .setEmoji("🔄")
            )

        let row = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
            .addComponents(button.builder)

        await interaction.editReply({
            files: [
                { name: "render.png", attachment: img.toBuffer("image/png") }
            ],
            components: [row]
        });
    }

    public async handleViewportUpdate(interaction: Discord.ButtonInteraction, user: User) {
        let id = interaction.customId.split("-")[2];
        let cameraName = interaction.customId.split("-")[3];

        await interaction.deferUpdate();

        let viewportOwner = await this.bot.users.get(id);

        if(!viewportOwner) throw new SynergyUserError("Can't find viewport owner.");

        let scene = this.scenes.get(viewportOwner);

        if(!scene) throw new SynergyUserError("Scene of this viewport doesn't exist.");

        let camera = scene.objects.find(o => o.name === cameraName);
        if(!camera) {
            throw new SynergyUserError(
                `Can't find object with name \`${cameraName}\` in viewport scene.`
            );
        }

        if(!(camera instanceof Camera)) {
            throw new SynergyUserError("Target viewport object is not a camera.");
        }

        let img = await camera.Render();
        await interaction.message.edit({
            files: [
                { name: "render.png", attachment: img.toBuffer("image/png") }
            ]
        });
    }
    //--------------------------------------------------------------------------------------------------

    public async Run(interaction: Discord.ChatInputCommandInteraction, user: User){
        if(!this.scenes.get(user)) {
            this.scenes.set(user, new Scene());
        }

        let subcommandGroupHandlers: {
            [key: string]:  CallbackTypeOf<Discord.SlashCommandBuilder>
        } = {
            "scene": this.handleSceneCommands,
            "object": this.handleObjectCommands,
            "camera": this.handleCameraCommands,
        }

        let subcommandGroup = interaction.options.getSubcommandGroup(true);

        await subcommandGroupHandlers[subcommandGroup].bind(this)(interaction, user);
        return;
    }
}