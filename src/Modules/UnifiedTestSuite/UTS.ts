import { Access, Colors, Module, Synergy, SynergyUserError } from "synergy3";
import Discord from "discord.js";

interface ITestPoint{
    name: string;
    description: string;
    callback: (int: Discord.CommandInteraction) => Promise<void>;
}

const testPoints: Map<string, ITestPoint> = new Map();

export default class UTS extends Module{
    public Name:        string = "UTS";
    public Description: string = "Unified Test Suite Module.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.ADMIN() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            .addStringOption(opt => opt
                .setName("test_point")
                .setDescription("Test point to execute.")
            )

            .addStringOption(opt => opt
                .setName("gparg0s")
                .setDescription("General purpose string argument 0")    
            )
            .addStringOption(opt => opt
                .setName("gparg1s")
                .setDescription("General purpose string argument 1")    
            )

            .addNumberOption(opt => opt
                .setName("gparg0")
                .setDescription("General purpose argument 0")    
            )
            .addNumberOption(opt => opt
                .setName("gparg1")
                .setDescription("General purpose argument 1")    
            )
            .addNumberOption(opt => opt
                .setName("gparg2")
                .setDescription("General purpose argument 2")    
            )
            .addNumberOption(opt => opt
                .setName("gparg3")
                .setDescription("General purpose argument 3")    
            )
        )
        .onExecute(this.onTest.bind(this))
        .commit()
    }

    private async onTest(int: Discord.CommandInteraction){
        let test_point = int.options.getString("test_point", false);
        if(!test_point){
            let txt = "";
            for(let p of testPoints.values()){
                txt += `\`${p.name}\` - ${p.description}\n`;
            }

            let emb =  new Discord.MessageEmbed({
                title: "UTS Test Points List",
                color: Colors.Noraml,
                description: txt || "*No test points set.*"
            });
    
            return await int.reply({embeds: [emb]});
        }else{
            let point = Array.from(testPoints.values()).find(p => p.name === test_point);
            if(!point){
                throw new SynergyUserError("This Test Point does not exist.");
            }
            await point.callback(int);

            if(!int.replied){
                await int.reply({ content: "Test point executed successfully.", ephemeral: true });
            }
            return;
        }
    }

    public static addTestPoint(name: string, description: string, callback: (int: Discord.CommandInteraction) => Promise<void>){
        testPoints.set(name, {
            name,
            description,
            callback
        });
    }

    public static removeTestPoint(name: string){
        testPoints.delete(name);
    }
}