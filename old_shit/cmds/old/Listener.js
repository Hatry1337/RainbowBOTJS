var moduleName = "Listener";
function moduleOnLoad() {
    console.log(`Module "${this.name}" loaded!`)
}

class Listener {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
        this.Client = Client;
    }
    execute = async function (message) {
        var args = message.content.split(" ");
        if (!args[1]) {
            var voice = this.Client.voice.connections;
            var voices = voice.array();
            var str = "```";
            for (var i = 0; i < voices.length; i++) {
                console.log(voices[i]);
                str += `${i}. ${voices[i].channel.guild.name}  ${voices[i].channel.name}\n`;
                var chmem = voices[i].channel.members.array();
                for (var j = 0; j < chmem.length; j++) {
                    str += `    ${j}. ${chmem[j].user.tag}\n`;
                }
            }
            message.channel.send(str+"```");
            return;
        } else {
            var voices = this.Client.voice.connections.array();
            args[1] = parseInt(args[1]);
            args[2] = parseInt(args[2]);
            var voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                message.channel.send("not in channel");
                return;
            }
            var connection = await voiceChannel.join();
            connection.play(voices[args[1]].receiver.createStream(voiceChannel.members.array()[args[2]]))
        }
    }
}



module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Listener;