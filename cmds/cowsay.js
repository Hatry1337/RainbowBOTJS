var moduleName = "Cowsay";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Cowsay {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = async function (message, pipef, pipet) {
        var args = message.content.split(" ");
        var text = message.content.slice(8);
        if(text.indexOf("--cowlist") !== -1){
            this.Utils.CowSay.list((err, cows)=>{
                message.channel.send("```"+cows.toString()+"```");
                return;
            });
            return;
        }
        if (!args[1]) {
            message.channel.send("```"+this.Utils.CowSay.say({text : "You didn't enter the text!"})+"```");
            this.Database.writeLog('cowsay', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' drawed empty cow.`
                }));
            return;
        }
        var isThinking = (text.indexOf("--thinking") !== -1);
        text = text.replace("--thinking ", '');
        var cowType = "default";
        if(text.indexOf("--cow ") !== -1){
            cowType = text.slice(text.indexOf("--cow ") + 6);
            text = text.replace("--cow " + cowType, '');
        }
        if(pipet){
            text = pipet;
        }
        if(isThinking){
            var res = this.Utils.CowSay.think({text : text, f: cowType});
            if(pipef){
                await pipef(res);
            }else {
                message.channel.send("```"+res+"```");
            }
            this.Database.writeLog('cowsay', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' drawed thinking cow with text '${text}'.`
            }));
            return;
        }else{
            var res = this.Utils.CowSay.say({text : text, f: cowType});
            if(pipef){
                await pipef(res);
            }else {
                message.channel.send("```"+res+"```");
            }
            this.Database.writeLog('cowsay', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' drawed cow with text '${text}'.`
                }));
            return;
        }

    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Cowsay;
