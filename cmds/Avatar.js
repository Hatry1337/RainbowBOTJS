var moduleName = "AvatarC";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class AvatarC {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
        this.Client = Client;
    }
    execute = async function (message) {
        var args = message.content.split(" ");
        if (args[1]) {
            args[1] = this.Utils.parseID(args[1]);
        } else {
            args[1] = message.author.id;
        }
        var user = this.Client.users.cache.get(args[1]);
        if(user){
            message.channel.send(user.username+"'s Avatar:",{
                files: [user.avatarURL({
                    size: 2048
                })]
            });
            return;
        }else {
            message.channel.send("Invalid User specified.");
            return;
        }
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = AvatarC;
