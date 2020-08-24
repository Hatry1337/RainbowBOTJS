var moduleName = "Clear";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Clear {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.lng = Utils.lng;
    }

    execute = async function (message, l) {
        if(!message.member.permissions.has("MANAGE_MESSAGES")){
            message.channel.send(this.lng.clear.noPerms[l]);
            return;
        }else {
            var args = message.content.split(" ");
            if (!args[1]) {
                return message.channel.send(this.lng.clear.noCount[l]);
            }
            if (isNaN(args[1])) {
                return message.channel.send(this.lng.clear.notInt[l]);
            }
            if (args[1] <= 0){
                return message.channel.send(this.lng.clear.underZero[l]);
            }
            if(args[1] > 100){
                return message.channel.send(this.lng.clear.tooMore[l]);
            }
            var othis = this;
            await message.channel.messages.fetch({ limit: parseInt(args[1]) }).then(messages => {
                message.channel.bulkDelete(messages).then(function () {
                    message.channel.send(`${othis.lng.clear.succDel[l]} ${messages.size} ${othis.lng.clear.messages[l]}!`).then(function (msg) {
                        msg.delete({timeout:5000});
                    })
                });
                othis.Database.writeLog('clear', message.author.id, message.guild.name,
                    JSON.stringify({
                        Message: `User '${message.author.tag}' deleted '${args[1]}' messages in channel '${message.channel.name}'.`
                }));
            });
        }
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Clear;