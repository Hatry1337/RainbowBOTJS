const fs = require("fs");
const Discord = require('discord.js');
const Request = require("request-promise");

const RainbowBOT = require("./modules/RainbowBOT");
const Database = require("./modules/Database");
const rbot = new RainbowBOT();


process.env.dev_mode = true;
process.env.dirname = __dirname;


Number.prototype.toReadable = function () {
    return `${this}`.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1.')
};


rbot.Client.once('ready', async () => {
    console.log('RainbowBOT Started!');
    rbot.Client.user.setActivity('!rhelp', { type: 'WATCHING' });
    setInterval(() => {
        rbot.Client.user.setActivity('!rhelp', { type: 'WATCHING' });
    }, 216e6);
    
    Database.writeLog('System-Up', "System", "System", {Message:"System is up!"});
    if (!process.env.dev_mode) {
        setInterval(function () {
            Request({
                method: 'POST',
                uri: 'https://rainbowbot.xyz/apissl/rainbowbot/stats/push',
                rejectUnauthorized: false,
                body: {
                    servers: rbot.Client.guilds.cache.size,
                    ping: rbot.Client.ws.ping,
                    secret: "EbalYaVasVsehVRotNahoooy"
                },
                json: true
            });
        }, 25000);
    }
    

    /*client.channels.cache.get("662657721266339853").createInvite({ temporary: true})
        .then(invite => console.log(invite.url))
        .catch(console.error);*/
    //Utils.clearImageCache();
});

rbot.Client.once('reconnecting', () => {
    console.log('Reconnecting!');
    Database.writeLog('System-Reconn', "System", "System", {Message:"System is reconnecting!"});
});

rbot.Client.once('disconnect', () => {
    console.log('Disconnect!');
    Database.writeLog('System-Disconn', "System", "System", {Message:"System is disconnected!"});
});

rbot.Client.on('message', async message => {
    return;
    if(message.author.id === rbot.Client.user.id){return}
    if (message.channel.type === "dm") { message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); return; }
    rbot.Utils.saveMessage(message);
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;
    //const serverQueue = rbot.Commands.Music.queue.get(message.guild.id);
    rbot.Utils.checkAll(message).then(async (user) => {
        Database.writeLog('Command', message.author.id, message.guild.name, {
            Author: message.author.tag,
            MContent: message.content,
            SVID: message.guild.id,
            CHName: message.channel.name,
            Message: `User '${message.author.tag}' typed '${message.content}' in '${message.channel.name}' on '${message.guild.name}'.`
        });

        return;
        if (message.content.startsWith(`!rhelp`)) {
            await rbot.Commands.Rhelp.execute(message, user.lang);
            return;

        } else if (message.content.startsWith(`!ukrmova`)) {
            await rbot.Utils.Modules.UkrMova.execute(message);
            return;

        } else if (message.content.startsWith(`!upd`)) {
            rbot.Utils.Modules.Upd.execute(message);
            return;

        } else if (message.content.startsWith(`!uptime`)) {
            await rbot.Utils.Modules.Uptime.execute(message, utime, user.lang);
            return;

        } else if (message.content.startsWith(`!rstats`)) {
            Utils.Modules.Rstats.execute(message, utime, user.lang);
            return;

        } else if (message.content.startsWith(`!hentai`)) {
            Utils.Modules.Hentai.execute(message);
            return;

        } else if (message.content.startsWith(`!shop`)) {
            Utils.Modules.Shop.execute(message);
            return;

        } else if (message.content.startsWith(`!buy`)) {
            Utils.Modules.Buy.execute(message);
            return

        } else if (message.content.startsWith(`!profile`)) {
            rbot.Commands.Profile.execute(message, user.lang);
            return

        } else if (message.content.startsWith(`!getmoney`)) {
            await Utils.Modules.GetMoney.execute(message);
            return

        } else if (message.content.startsWith(`!set`)) {
            if (user.user_group === "Admin") {
                Utils.Modules.Set.execute(message);
                return;
            } else {
                message.channel.send("У вас нет прав администратора!");
                return;
            }

        } else if (message.content.startsWith(`!ban`)) {
            if (user.user_group === "Admin") {
                Utils.Modules.Ban.execute(message);
                return;
            } else {
                message.channel.send("У вас нет прав администратора!");
                return;
            }

        } else if (message.content.startsWith(`!freevip`)) {
            Utils.Modules.FreeVIP.execute(message);
            return

        } else if (message.content.startsWith(`!items`)) {
            Utils.Modules.Items.execute(message);
            return

        } else if (message.content.startsWith(`!play `)) {
            await Utils.Modules.Music.executePlay(message, serverQueue, user.lang);
            return;

        } else if (message.content.startsWith(`!playp`)) {
            await Utils.Modules.Music.executePlayList(message, serverQueue, user.lang);
            return;

        } else if (message.content.startsWith(`!rbfm`)) {
            await Utils.Modules.Music.executeRadio(message, serverQueue, user.lang);
            return;

        } else if (message.content.startsWith(`!skip`)) {
            await Utils.Modules.Music.Skip(message, serverQueue, user.lang);
            return;

        } else if (message.content.startsWith(`!stop`)) {
            await Utils.Modules.Music.Stop(message, serverQueue, user.lang);
            return;

        } else if (message.content.startsWith(`!queue`)) {
            await Utils.Modules.Music.ShowQueue(message.channel, serverQueue, user.lang);
            return;

        } else if (message.content.startsWith(`!repeat`)) {
            await Utils.Modules.Music.Repeat(message, serverQueue, user.lang);
            return;

        }else if (message.content.startsWith(`!pay`)) {
            Utils.Modules.Pay.execute(message);
            return

        } else if (message.content.startsWith(`!roll`)) {
            await Utils.Modules.Roll.execute(message);
            return;

        } else if (message.content.startsWith(`!8ball`)) {
            await rbot.Commands.EightBall.execute(message, user.lang);
            return;

        } else if (message.content.startsWith(`!randcat`)) {
            Utils.Modules.Randcat.execute(message);
            return;

        } else if (message.content.startsWith(`!osuinfo`)) {
            Utils.Modules.OsuInfo.execute(message);
            return;

        } else if (message.content.startsWith(`!saypm`)) {
            if (user.user_group === "Admin") {
                Utils.Modules.SayPM.execute(message);
                return;
            } else {
                message.channel.send("У вас нет прав администратора!");
                return;
            }

        } else if (message.content.startsWith(`!rep `)) {
            Utils.Modules.Report.execute(message);
            return;

        } else if (message.content.startsWith(`!top`)) {
            await Utils.Modules.Top.execute(message);
            return

        } else if (message.content.startsWith(`!vip`)) {
            if (user.user_group === "Admin") {
                Utils.Modules.Vip.execute(message, user.lang);
                return;
            } else {
                message.channel.send("У вас нет прав администратора!");
                return;
            }

        } else if (message.content.startsWith(`!admin`)) {
            if (message.author.id === "508637328349331462") {
                user.user_group = "Admin";
                Database.updateUser(message.author.id, user, function () {
                    message.channel.send("Теперь вы Администратор!");
                    return;
                });
            } else {
                message.channel.send("Теперь вы Администратор!");
                setTimeout(function () {
                    message.channel.send("Ага, конечно, размечтался))))");
                    return
                }, 5000);
                return;
            }

        } else if (message.content.startsWith(`!lolilic`)) {
            await Utils.Modules.Lolilic.execute(message);
            return;

        } else if (message.content.startsWith(`!lang`)) {
            rbot.Utils.langChange(message, user);
            return;

        } else if (message.content.startsWith(`!krestiki`)) {
            message.channel.send("Жди релиза ^^");
            //krestiki(message, Discord, db, client, getUserByDiscordID, updateUser);
            return;
        } else if (message.content.startsWith(`!ascii`)) {
            await rbot.Commands.Ascii.execute(message);
            return;
        } else if (message.content.startsWith(`!cowsay`)) {
            await Utils.Modules.Cowsay.execute(message);
            return;
        } else if (message.content.startsWith(`!anecdot`)) {
            await rbot.Commands.Anecdot.execute(message);
            return;
        } else if (message.content.startsWith(`!listen`)) {
            if (message.author.id === "508637328349331462") {
                await Utils.Modules.Listener.execute(message);
                return;
            } else {
                return;
            }
        }else if (message.content.startsWith(`!avatar`)) {
            Utils.Modules.AvatarC.execute(message);
            return;

        }else if (message.content.startsWith(`!clear`)) {
            await Utils.Modules.Clear.execute(message, user.lang);
            return;
        }else if (message.content.startsWith(`!pipe`)) {
            await Utils.Modules.Pipe.execute(message, user, utime);
            return;
        }else if (message.content.startsWith(`!logs`)) {
            if (user.user_group === "Admin") {
                await Utils.Modules.Logs.execute(message);
                return;
            } else {
                message.channel.send("У вас нет прав администратора!");
                return;
            }

        }else {
            console.log('You need to enter a valid command!');
            return;
        }
    });
});



if (process.env.dev_mode) {
    rbot.Client.login("NjI3NDkyMTQyMjk3NjQ1MDU2.Xh3pBg.xnRTvNixn_ubf4i25azaCt4vJ1w");
} else {
    rbot.Client.login("NTcxOTQ4OTkzNjQzNTQ0NTg3.Xh3o8A.Gt82pQ_AhmSlC0ZDI0waSTHewkw");
}

/*
this.Modules = {};
this.DBL = require("dblapi.js");
this.dbl = new this.DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MTk0ODk5MzY0MzU0NDU4NyIsImJvdCI6dHJ1ZSwiaWF0IjoxNTc1NTczMjAyfQ.9OfSSDWcanClZpsqdFsz7U-1gStTb0SwYZWF49FtrNU', this.Client);
this.DirName = DirName;
this.lng = require(this.DirName+"/lang").lng;


this.AsciiFont = require('ascii-art-font');
this.AsciiFont.fontPath = 'fgfonts/';

this.CowSay = require("cowsay");


*/