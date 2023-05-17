import Discord from "discord.js";
import { Access, AccessTarget, Module, Synergy, Utils } from "synergy3";
import fsp from "fs/promises";
import path from "path";
import { RainbowBOTLogo } from "./Logos/RainbowBOTLogo";

interface BotFetchStats {
    rq:   number;
    rq_d: number;
    rq_h: number;

    last_day:  number;
    last_hour: number;
}

interface IBotFetchPackageInfo {
    botver: string;
    libver: string;
    frameworkver: string;
}

export default class BotFetch extends Module{
    public Name:        string = "BotFetch";
    public Description: string = "Using this command you can view bot's stats in neofetch/screenfetch style.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    public packageInfo: IBotFetchPackageInfo = {
        botver: "N/A",
        libver: "N/A",
        frameworkver: "N/A"
    }

    private static _langName = "TypeScript";
    private static _runtimeName = "node.js";
    private static _libName = "discord.js";
    private static _frameworkName = "Synergy3";
    private static _botName = "RainbowBOT";

    public static readonly logos: { [key: string]: string } = {
        rainbowbot: RainbowBOTLogo
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
                    .setDescription("Show botfetch in compact mode.")
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
                    this.packageInfo.botver = json.version.replace(/\^/g, "");
                }
                if(json.dependencies){
                    if(json.dependencies[BotFetch.getLib().toLowerCase()]) {
                        this.packageInfo.libver = json.dependencies[BotFetch.getLib().toLowerCase()].replace(/\^/g, "");
                    }
                    if(json.dependencies[BotFetch.getFramework().toLowerCase()]) {
                        this.packageInfo.frameworkver = json.dependencies[BotFetch.getFramework().toLowerCase()].replace(/\^/g, "");
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
        let stats: BotFetchStats = container.get("stats") as unknown as BotFetchStats || {
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
        let stats = container.get("stats") as BotFetchStats | null;

        let user = interaction.user.username.toLowerCase();

        let runtime     = `${BotFetch.getRuntime()   } ${process.versions.node}`;
        let lib         = `${BotFetch.getLib()       } ${this.packageInfo.libver}`;
        let framework   = `${BotFetch.getFramework() } ${this.packageInfo.frameworkver}`;
        let bot         = `${BotFetch.getBot()       } ${this.packageInfo.botver}`;

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
        
        let botfetch = `${user}@${BotFetch.getBot().toLowerCase()}:~$ botfetch\n`;

        let lines = [
            `${user}@${BotFetch.getBot().toLowerCase()}`,
            "-".repeat(user.length + BotFetch.getBot().length + 1),
            `Lang: ${BotFetch.getLang()}`,
            `Runtime: ${runtime}`,
            `Lib: ${lib}`,
            `Framework: ${framework}`,
            `BOT: ${bot}`,
            `Uptime: ${uptime}`,
            `WS_Ping: ${ping}`,
            `Modules: ${modules} (${BotFetch.getFramework()})`,
            `Cached_Users: ${cache_users}`,
            `Discord_Users: ${disc_users}`,
            `Discord_Servers: ${disc_servs}`,
            `Requests: ${rq_handl}`,
            `Requests_1d: ${rq_handl_d}`,
            `Requests_1h: ${rq_handl_h}`,
            `Memory: ${botmem}`
        ]

        if(!compact){
            let logoLines = BotFetch.logos[BotFetch.getBot().toLowerCase()].split("\n");
            let logoWidth = logoLines[0].length;

            let linesTotal = Math.max(lines.length, logoLines.length);

            for(let i = 0; i < linesTotal; i++) {
                botfetch += (logoLines[i] ?? " ".repeat(logoWidth)) + (lines[i] ?? "") + "\n";
            }

        }else{
            botfetch += lines.join("\n")
        }
        
        await interaction.reply({ content: "```elm\n" + botfetch + "```" });
    }

    public static setLang(name: string) {
        BotFetch._langName = name;
    }

    public static getLang() {
        return BotFetch._langName;
    }

    public static setRuntime(name: string) {
        BotFetch._runtimeName = name;
    }

    public static getRuntime() {
        return BotFetch._runtimeName;
    }

    public static setLib(name: string) {
        BotFetch._libName = name;
    }

    public static getLib() {
        return BotFetch._libName;
    }

    public static setFramework(name: string) {
        BotFetch._frameworkName = name;
    }

    public static getFramework() {
        return BotFetch._frameworkName;
    }

    public static setBot(name: string) {
        BotFetch._botName = name;
    }

    public static getBot() {
        return BotFetch._botName;
    }
}