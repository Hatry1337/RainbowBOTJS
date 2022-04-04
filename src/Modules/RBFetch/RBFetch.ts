import Discord from "discord.js";
import si from "systeminformation";
import { Access, Module, RainbowBOT, Utils } from "rainbowbot-core";

interface RBFetchStats {
    rq:   number;
    rq_d: number;
    rq_h: number;

    last_day:  number;
    last_hour: number;
}

export default class RBFetch extends Module{
    public Name:        string = "RBFetch";
    public Description: string = "Using this command you can view bot's stats in linux neofetch/screenfetch style.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ];

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        this.bot.client.on("interactionCreate", this.onInteraction.bind(this));

        this.SlashCommands.push(
            this.bot.interactions.createCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .setDescription(this.Description)
                .addBooleanOption(opt => opt
                    .setName("compact")
                    .setDescription("Show rbfetch in compact mode.")
                    .setRequired(false)
                )
                .onExecute(this.Run.bind(this))
                .commit(),
        );
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
        }else{
            stats.rq_h++;
        }

        if(stats.last_day !== date.getDate()){
            stats.rq_d = 0;
        }else{
            stats.rq_d++;
        }

        container.set("stats", stats);
    }

    public async Run(interaction: Discord.CommandInteraction){
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let stats = container.get("stats") as RBFetchStats | null;

        let user = interaction.user.username.toLowerCase();
        let nodev = process.version;
        let uptime = Utils.formatTime(Math.floor((this.bot.client.uptime || 0) / 1000));
        let ping = this.bot.client.ws.ping;
        let modules = this.bot.modules.CountLoadedModules();
        let cache_users = this.bot.users.cached.size;
        let disc_users = 0;
        this.bot.client.guilds.cache.each(guild => disc_users += guild.memberCount);
        let disc_servs = this.bot.client.guilds.cache.size;
        let rq_handl    = stats ? stats.rq : "N/A";
        let rq_handl_d  = stats ? stats.rq_d : "N/A";
        let rq_handl_h  = stats ? stats.rq_h : "N/A";

        let mem = await si.mem();
        let load = await si.currentLoad();

        let meminfo = `${Math.floor(mem.available / 1024 / 1024)}M/${Math.floor(mem.total / 1024 / 1024)}M, BOT: ${Math.floor(process.memoryUsage().rss / 1024 /1024)}M`;
        let cpuinfo = `${Math.floor(load.currentLoad)}%, AVG: ${load.avgLoad}`;

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
            `\`\`\`apache`                                                                   + "\n" +
            `${user}@rainbowbot.xyz:~$ rbfetch`                                              + "\n" +
            `           ..                               ${user}@rainbowbot.xyz`             + "\n" +
            `          .*(*          ...                 ---------------`                    + "\n" +
            `         ,*/*.          .,/*,               LNG: TypeScript`                    + "\n" +
            `       .*///,.        ..  *///*.            Node: ${nodev}`                     + "\n" +
            `      ,*/////,       ,*,  ,*////*,          Uptime: ${uptime}`                  + "\n" +
            `    .,///////,      .**,. ,*///////,.       WS_Ping: ${ping} ms.`               + "\n" +
            `    ,////////,    .,/,.  .*/////////*.      Modules: ${modules} (cmd)`          + "\n" +
            `   ,*/(//////*.         ,*////////////,     DB_Users: ${cache_users}`           + "\n" +
            `   ,*/////////*.      .,*/////////////,.    Discord_Users: ${disc_users}`       + "\n" +
            `   **//////////*,   .**///////////*****,    Discord_Servers: ${disc_servs}`     + "\n" +
            `  .**//**////////****//////************,    Requests: ${rq_handl}`              + "\n" +
            `   ,******//////////**************,,,,,.    Requests_1d: ${rq_handl_d}`         + "\n" +
            `   ,*//////***************,,,,,,,,,,,,,.    Requests_1h: ${rq_handl_h}`         + "\n" +
            `   .*//////**********,,,,,,,,,,,,,,,,,,.    Memory: ${meminfo}`                 + "\n" +
            `    ,//////**,,,,,,,,,,,,,,,,,,,,,,,,,.     CPU_Load: ${cpuinfo}`               + "\n" +
            `     .********,,,,,,,,,,,,,,,,,,,,,,.     `                                     + "\n" +
            `       .,***,,,,,,,,,,,,,,,,,,,,,,,       `                                     + "\n" +
            `          .,,,,,,,,,,,,,,,,,,,..          `                                     + "\n" +
            `              ............                `                                     + "\n" +
            `\`\`\``                                                                         ;
        }else{
            rbfetch = 
            `\`\`\`apache`                       + "\n" +
            `${user}@rainbowbot.xyz`             + "\n" +
            `---------------`                    + "\n" +
            `LNG: TypeScript`                    + "\n" +
            `Node: ${nodev}`                     + "\n" +
            `Uptime: ${uptime}`                  + "\n" +
            `WS_Ping: ${ping} ms.`               + "\n" +
            `Modules: ${modules} (cmd)`          + "\n" +
            `Cache_Users: ${cache_users}`        + "\n" +
            `Discord_Users: ${disc_users}`       + "\n" +
            `Discord_Servers: ${disc_servs}`     + "\n" +
            `Requests: ${rq_handl}`              + "\n" +
            `Requests_1d: ${rq_handl_d}`         + "\n" +
            `Requests_1h: ${rq_handl_h}`         + "\n" +
            `Memory: ${meminfo}`                 + "\n" +
            `CPU_Load: ${cpuinfo}`               + "\n" +
            `\`\`\``                             ;
        }
        
        return await interaction.reply({ content: rbfetch });
    }
}