var moduleName = "Logs";
function moduleOnLoad() {
    console.log(`Module "${this.name}" loaded!`)
}

class Ascii {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = async function (message, pipef) {
        var args = message.content.split("--");
        var params = {
            from: "last",
            count: 10,
            type: "all"
        };
        for(var i = 0; i < args.length; i++){
            var arg = args[i];
            if (arg.startsWith("first")) {
                params.from = "first";
            }
            if (arg.startsWith("count")) {
                params.count = /count ([^']*)?/.exec(arg)[1];
            }
            if (arg.startsWith("type")) {
                params.type = /type ([^']*)?/.exec(arg)[1];
            }
            if (arg.startsWith("id")) {
                params.id = /id ([^']*)?/.exec(arg)[1];
            }
            if (arg.startsWith("uid")) {
                params.uid = /uid ([^']*)?/.exec(arg)[1];
            }
            if (arg.startsWith("server")) {
                params.server = /server ([^']*)?/.exec(arg)[1];
            }
        }
        var othis = this;
        this.Database.getLogsCustom(params, async (logs)=>{
            if(params.from === "last"){
                logs.reverse();
            }
            var out = "";
            for(var i = 0; i < logs.length; i++){
                logs[i].data = JSON.parse(logs[i].data);
                out += `[${logs[i].timestamp.toLocaleString()}] [${logs[i].type}] ${logs[i].data.Message}\n`
            }
            if(pipef){
                await pipef(out);
            }else {
                message.channel.send("```\n"+out+"```");
            }
            othis.Database.writeLog('logs', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' watched logs.`
                }));
            return;
        });
    }
}



module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Ascii;