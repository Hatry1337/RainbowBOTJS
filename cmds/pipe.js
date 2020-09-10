var moduleName = "Pipe";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Pipe {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = async function (message, user, utime) {
        var msc = message.content.slice(6);
        var args = msc.split(" | ");
        if (!args[0] || !args[1]) {
            message.channel.send("Error: No such arguments.");
            return;
        }
        if (args.length > 2) {
            message.channel.send("Error: Too much arguments.");
            return;
        }
        var othis = this;
        var pipef = async function (text) {
            if (args[1].startsWith(`!ascii`)) {
                message.content = `!ascii t ${args[1].split(" ")[1]}`;
                await othis.Utils.Modules.Ascii.execute(message, null, text);
                return;
            } else if (args[1].startsWith(`!cowsay`)) {
                message.content = `!cowsay t ${args[1].slice(8)}`;
                console.log(message.content);
                await othis.Utils.Modules.Cowsay.execute(message, null, text);
                return;
            }
        };

        message.content = args[0];
        if (args[0].startsWith(`!ukrmova`)) {
            this.Utils.Modules.UkrMova.execute(message, pipef);
            return;

        } else if (args[0].startsWith(`!uptime`)) {
            this.Utils.Modules.Uptime.execute(message, utime, user.lang, pipef);
            return;

        } else if (args[0].startsWith(`!getmoney`)) {
            this.Utils.Modules.GetMoney.execute(message, pipef);
            return

        } else if (args[0].startsWith(`!roll`)) {
            this.Utils.Modules.Roll.execute(message, pipef);
            return;

        } else if (args[0].startsWith(`!8ball`)) {
            this.Utils.Modules["8ball"].execute(message, user.lang, pipef);
            return;

        } else if (args[0].startsWith(`!ascii`)) {
            await this.Utils.Modules.Ascii.execute(message, pipef);
            return;
        } else if (args[0].startsWith(`!cowsay`)) {
            await this.Utils.Modules.Cowsay.execute(message, pipef);
            return;
        } else if (args[0].startsWith(`!anecdot`)) {
            await this.Utils.Modules.Anecdot.execute(message, pipef);
            return;
        }else if (args[0].startsWith(`!logs`)) {
            if (user.user_group === "Admin") {
                this.Utils.Modules.Logs.execute(message, pipef);
                return;
            } else {
                message.channel.send("У вас нет прав администратора!");
                return;
            }
        }
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Pipe;
