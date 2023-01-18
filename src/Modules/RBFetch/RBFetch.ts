import Discord from "discord.js";
import si from "systeminformation";
import { Access, AccessTarget, Module, Synergy, Utils } from "synergy3";
import fsp from "fs/promises";
import path from "path";

interface RBFetchStats {
    rq:   number;
    rq_d: number;
    rq_h: number;

    last_day:  number;
    last_hour: number;
}

interface IRBFetchPackageInfo {
    bot: string;
    discordjs: string;
    synergy: string;
}

export default class RBFetch extends Module{
    public Name:        string = "RBFetch";
    public Description: string = "Using this command you can view bot's stats in linux neofetch/screenfetch style.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    public packageInfo: IRBFetchPackageInfo = {
        bot: "N/A",
        discordjs: "N/A",
        synergy: "N/A"
    }

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.bot.client.on("interactionCreate", this.onInteraction.bind(this));

        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addBooleanOption(opt => opt
                    .setName("compact")
                    .setDescription("Show rbfetch in compact mode.")
                    .setRequired(false)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit(),
        );
    }

    public async Init() {
        try {
            let data = await fsp.readFile(path.resolve(__dirname, '../../../package.json'));
            let json = JSON.parse(data.toString());
            if(json) {
                if(json.version){
                    this.packageInfo.bot = json.version.replace(/\^/g, "");
                }
                if(json.dependencies){
                    if(json.dependencies["discord.js"]) {
                        this.packageInfo.discordjs = json.dependencies["discord.js"].replace(/\^/g, "");
                    }
                    if(json.dependencies["synergy3"]) {
                        this.packageInfo.synergy = json.dependencies["synergy3"].replace(/\^/g, "");
                    }
                }
            }
        } catch (e) {
            this.Logger.Warn("Unable to load packages info from package.json:", e);
        }
    }

    private async onInteraction(int: Discord.Interaction){
        if(!int.isCommand()) return;

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let date = new Date();
        let stats: RBFetchStats = container.get("stats") || {
            rq:   0,
            rq_d: 0,
            rq_h: 0,

            last_day:  date.getDate(),
            last_hour: date.getHours()
        }

        stats.rq++;
        
        if(stats.last_hour !== date.getHours()){
            stats.rq_h = 0;
            stats.last_hour = date.getHours();
        }else{
            stats.rq_h++;
        }

        if(stats.last_day !== date.getDate()){
            stats.rq_d = 0;
            stats.last_day = date.getDate();
        }else{
            stats.rq_d++;
        }

        container.set("stats", stats);
    }

    public async Run(interaction: Discord.ChatInputCommandInteraction){
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let stats = container.get("stats") as RBFetchStats | null;

        let user = interaction.user.username.toLowerCase();

        let runtime     = `node.js ${process.version}`;
        let lib         = `discord.js ${this.packageInfo.discordjs}`;
        let framework   = `Synergy3 ${this.packageInfo.synergy}`;
        let bot         = `RainbowBOT ${this.packageInfo.bot}`;

        let uptime = Utils.formatTime(Math.floor((this.bot.client.uptime || 0) / 1000));
        let ping = this.bot.client.ws.ping;
        let modules = this.bot.modules.CountLoadedModules();
        let cache_users = this.bot.users.getCacheStats().keys;
        let disc_users = 0;
        this.bot.client.guilds.cache.each(guild => disc_users += guild.memberCount);
        let disc_servs = this.bot.client.guilds.cache.size;
        let rq_handl    = stats ? stats.rq   : "N/A";
        let rq_handl_d  = stats ? stats.rq_d : "N/A";
        let rq_handl_h  = stats ? stats.rq_h : "N/A";

        //let mem = await si.mem();
        //let load = await si.currentLoad();

        //let meminfo = `${Math.floor(mem.available / 1024 / 1024)}MiB / ${Math.floor(mem.total / 1024 / 1024)}MiB`;
        let botmem = `${Math.floor(process.memoryUsage().rss / 1024 /1024)}MiB`;
        //let cpuinfo = `${Math.floor(load.currentLoad)}%, AVG: ${load.avgLoad}`;

        let compact = false;
        if(interaction.member instanceof Discord.GuildMember && interaction.member.presence?.clientStatus?.mobile){
            compact = true;
        }

        let cmpflag = interaction.options.getBoolean("compact");

        if(cmpflag !== null){
            compact = cmpflag;
        }
        
        let rbfetch;
        if(!compact){
            rbfetch = 
            `\`\`\`elm`                                                                      + "\n" +
            `${user}@rainbowbot.xyz:~$ rbfetch`                                              + "\n" +
            `           ..                               ${user}@rainbowbot.xyz`             + "\n" +
            `          .*(*          ...                 ---------------`                    + "\n" +
            `         ,*/*.          .,/*,               Lang: TypeScript`                   + "\n" +
            `       .*///,.        ..  *///*.            Runtime: ${runtime}`                + "\n" +
            `      ,*/////,       ,*,  ,*////*,          Lib: ${lib}`                        + "\n" +
            `    .,///////,      .**,. ,*///////,.       Framework: ${framework}`            + "\n" +
            `    ,////////,    .,/,.  .*/////////*.      BOT: ${bot}`                        + "\n" +
            `   ,*/(//////*.         ,*////////////,     Uptime: ${uptime}`                  + "\n" +
            `   ,*/////////*.      .,*/////////////,.    WS_Ping: ${ping} ms.`               + "\n" +
            `   **//////////*,   .**///////////*****,    Modules: ${modules} (synergy3)`     + "\n" +
            `  .**//**////////****//////************,    Cached_Users: ${cache_users}`       + "\n" +
            `   ,******//////////**************,,,,,.    Discord_Users: ${disc_users}`       + "\n" +
            `   ,*//////***************,,,,,,,,,,,,,.    Discord_Servers: ${disc_servs}`     + "\n" +
            `   .*//////**********,,,,,,,,,,,,,,,,,,.    Requests: ${rq_handl}`              + "\n" +
            `    ,//////**,,,,,,,,,,,,,,,,,,,,,,,,,.     Requests_1d: ${rq_handl_d}`         + "\n" +
            `     .********,,,,,,,,,,,,,,,,,,,,,,.       Requests_1h: ${rq_handl_h}`         + "\n" +
            `       .,***,,,,,,,,,,,,,,,,,,,,,,,         Memory: ${botmem}`                  + "\n" +
            `          .,,,,,,,,,,,,,,,,,,,..          `                                     + "\n" +
            `              ............                `                                     + "\n" +
            `\`\`\``                                                                         ;
        }else{
            rbfetch = 
            `\`\`\`apache`                       + "\n" +
            `${user}@rainbowbot.xyz`             + "\n" +
            `---------------`                    + "\n" +
            `Lang: TypeScript`                   + "\n" +
            `Runtime: ${runtime}`                + "\n" +
            `Lib: ${lib}`                        + "\n" +
            `Frame: ${framework}`                + "\n" +
            `BOT: ${bot}`                        + "\n" +
            `Uptime: ${uptime}`                  + "\n" +
            `WS_Ping: ${ping} ms.`               + "\n" +
            `Modules: ${modules} (synergy3)`     + "\n" +
            `Cached_Users: ${cache_users}`       + "\n" +
            `Discord_Users: ${disc_users}`       + "\n" +
            `Discord_Servers: ${disc_servs}`     + "\n" +
            `Requests: ${rq_handl}`              + "\n" +
            `Requests_1d: ${rq_handl_d}`         + "\n" +
            `Requests_1h: ${rq_handl_h}`         + "\n" +
            `Memory: ${botmem}`                  + "\n" +
            `\`\`\``                             ;
        }
        
        await interaction.reply({ content: rbfetch });
    }
}