import { Access, AccessTarget, Colors, Module, Synergy, SynergyUserError, User } from "synergy3";
import Discord from "discord.js";
import cowsay from "cowsay";

export default class CowSay extends Module{
    public Name:        string = "CowSay";
    public Description: string = "ASCII Cow saying your quote. (Or not a cow at all)";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER(), Access.BANNED() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)

            .addSubcommand(sub => sub
                .setName("cows")
                .setDescription("Show list of available cows (or not a cows).")    
            )
            .addSubcommand(sub => sub
                .setName("say")
                .setDescription("Send ascii cow with your quote.")

                .addStringOption(opt => opt
                    .setName("text")
                    .setDescription("Text that cow must say.")    
                    .setRequired(true)
                )
                .addStringOption(opt => opt
                    .setName("cow")
                    .setDescription("What kind of cow (or not a cow) must say a quote.")
                    .setRequired(false)
                )
                .addBooleanOption(opt => opt
                    .setName("think")
                    .setDescription("Send quote with thinking cow.")
                    .setRequired(false)    
                )
                .addBooleanOption(opt => opt
                    .setName("random")
                    .setDescription("Send quote with random cow.")
                    .setRequired(false)    
                )
            )
        )
        .onExecute(this.Run.bind(this))
        .commit()
    }

    public getCowsList(){
        return new Promise<string[]>((res, rej) => {
            cowsay.list((err, cows) => {
                if(err || !cows){
                    return rej(err);
                }
                res(cows);
            })
        });
    }

    public async Run(int: Discord.CommandInteraction, user: User){
        let cows = await this.getCowsList();
        let subc = int.options.getSubcommand();
        if(subc === "cows"){
            let messages = [];
            let msg = "";
            for(let c of cows){
                if(msg.length + c.length + 4 > 1024){
                    messages.push(msg);
                    msg = "";
                }
                msg += `\`${c}\`, `;
            }
            if(msg.length !== 0){
                messages.push(msg.slice(0, msg.length - 2));
            }

            let emb = new Discord.MessageEmbed({
                title: "Available Cows",
                color: Colors.Noraml,
                fields: messages.map((m, i) => ({ name: `Page ${i+1}`, value: m }))
            });

            return await int.reply({ embeds: [emb] });

        }else if(subc === "say"){
            let text = int.options.getString("text", true);
            let cow = int.options.getString("cow", false) ?? undefined;
            let think = int.options.getBoolean("think", false) || false;
            let random = int.options.getBoolean("random", false) || false;

            if(cow && cows.indexOf(cow) === -1) throw new SynergyUserError("This cow does not exist!");
            let result: string;

            if(think){
                result = cowsay.think({
                    text,
                    f: cow,
                    r: random
                });
            }else{
                result = cowsay.say({
                    text,
                    f: cow,
                    r: random
                });
            }

            return await int.reply("```" + result + "```");
        }else{
            throw new SynergyUserError("This subcommand is not implemented!");
        }
    }
}