const dev_mode = true;

const fs = require("fs");
const Discord = require('discord.js');
const client = new Discord.Client();
const Database = new (require('./modules/Database')).Database();
const Utils = new (require("./modules/Utils")).Utils(Discord, Database, client, fs, __dirname);

Number.prototype.toReadable = function () {
    return `${this}`.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1.')
};

var utime;
client.once('ready', () => {
    console.log('Ready 1!');
    utime = new Date();
    client.user.setActivity('!rhelp', { type: 'WATCHING' });
    Utils.loadModules(Utils.getFiles(__dirname + "/cmds"));
    Database.writeLog('System-Up', "System", "System", `{"Message":"System is up!"}`);
    if (!dev_mode) {
        var upd_stat = () => {
            Utils.Request({
                method: 'POST',
                uri: 'https://api.rainbowbot.xyz/bot/_internals/stat/upload',
                headers: {
                    "authorization": "Bearer N2f6AzPWrcmfiGcXksZFEjdSrzdmNZKOue1j4Nvn13i0eZ0yxq2aPxq7gSCmIRuV"
                },
                body: {
                    servers: client.guilds.cache.size,
                    ping: client.ws.ping
                },
                json: true // Automatically stringifies the body to JSON
            }, (err, res, body) => {
                err ? console.log(err) : 0;
            });
        }
        setInterval(upd_stat, 25000);
        upd_stat();
    }
    /*client.channels.cache.get("662657721266339853").createInvite({ temporary: true})
        .then(invite => console.log(invite.url))
        .catch(console.error);*/
    //Utils.clearImageCache();
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
    Database.writeLog('System-Reconn', "System", "System", `{"Message":"System is reconnecting!"}`);
});

client.once('disconnect', () => {
    console.log('Disconnect!');
    Database.writeLog('System-Disconn', "System", "System", `{"Message":"System is disconnected!"}`);
});

client.on('message', async message => {
    if(message.author.id === Utils.Client.user.id){return}
    if (message.channel.type === "dm") { message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); return; }
    Utils.saveMessage(message);
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;
    Utils.checkReg(message, async function (user) {
        Utils.updateUserName(message, user);
        Utils.fetchLang(message, user, function () {
            Utils.checkLang(message, user);
            Utils.checkBan(message, user, async function () {
                Database.writeLog('Command', message.author.id, message.guild.name,
                    JSON.stringify({
                        Author: message.author.tag,
                        MContent: message.content,
                        SVID: message.guild.id,
                        CHName: message.channel.name,
                        Message: `User '${message.author.tag}' typed '${message.content}' in '${message.channel.name}' on '${message.guild.name}'.`
                    })
                );
                Utils.checkVip(message, user, async function () {
                    Utils.checkLvl(message, user, async function () {
                        if(Math.random() < 0.2){
                            let rbot_guild = client.guilds.cache.get("612220949206532106");
                            let rbot_member = rbot_guild?.members?.resolve(message.author.id);
                            if(!(rbot_member?.roles?.cache?.has("937126564691320842") || rbot_member?.roles?.cache?.has("769881102508097560"))){
                                await message.channel.send(new Discord.MessageEmbed({
                                    title: Utils.lng.patreon_ad[user.lang || "en"].title,
                                    description: Utils.lng.patreon_ad[user.lang || "en"].description,
                                    thumbnail: {
                                        url: "https://media.discordapp.net/attachments/927189370874777620/937303120386609172/da861a_e657ee7c81334610a99412dc8c971d36mv2.png"
                                    },
                                    color: 0xFF00FF
                                }));
                            }
                        }

                        if (message.content.startsWith(`!rhelp`)) {
                            await Utils.Modules.Rhelp.execute(message, user.lang);
                            return;

                        } else if (message.content.startsWith(`!ukrmova`)) {
                            await Utils.Modules.UkrMova.execute(message);
                            return;

                        } else if (message.content.startsWith(`!upd`)) {
                            Utils.Modules.Upd.execute(message);
                            return;

                        } else if (message.content.startsWith(`!uptime`)) {
                            await Utils.Modules.Uptime.execute(message, utime, user.lang);
                            return;

                        } else if (message.content.startsWith(`!rstats`)) {
                            Utils.Modules.Rstats.execute(message, utime, user.lang);
                            return;

                        } else if (message.content.startsWith(`!color`)) {
                            Utils.Modules.Color.execute(message);
                            return;

                        }else if (message.content.startsWith(`!hentai`)) {
                            Utils.Modules.Hentai.execute(message);
                            return;

                        } else if (message.content.startsWith(`!shop`)) {
                            Utils.Modules.Shop.execute(message);
                            return;

                        } else if (message.content.startsWith(`!buy`)) {
                            Utils.Modules.Buy.execute(message);
                            return

                        } else if (message.content.startsWith(`!profile`)) {
                            Utils.Modules.Profile.execute(message, user.lang);
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

                        } else if (message.content.startsWith(`!rid`)) {
                            if (user.user_group === "Admin") {
                                Utils.Modules.Rid.execute(message);
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

                        }else if (message.content.startsWith(`!pay`)) {
                            Utils.Modules.Pay.execute(message);
                            return

                        } else if (message.content.startsWith(`!roll`)) {
                            await Utils.Modules.Roll.execute(message);
                            return;

                        } else if (message.content.startsWith(`!8ball`)) {
                            await Utils.Modules["8ball"].execute(message, user.lang);
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
                            Utils.langChange(message, user);
                            return;

                        } else if (message.content.startsWith(`!krestiki`)) {
                            message.channel.send("Жди релиза ^^");
                            //krestiki(message, Discord, db, client, getUserByDiscordID, updateUser);
                            return;
                        } else if (message.content.startsWith(`!ascii`)) {
                            await Utils.Modules.Ascii.execute(message);
                            return;
                        } else if (message.content.startsWith(`!cowsay`)) {
                            await Utils.Modules.Cowsay.execute(message);
                            return;
                        } else if (message.content.startsWith(`!anecdot`)) {
                            await Utils.Modules.Anecdot.execute(message);
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
            });
        });
    });
});

if (dev_mode) {
    client.login("NjI3NDkyMTQyMjk3NjQ1MDU2.Xh3pBg.xnRTvNixn_ubf4i25azaCt4vJ1w");
} else {
    client.login("NTcxOTQ4OTkzNjQzNTQ0NTg3.Xh3o8A.Gt82pQ_AhmSlC0ZDI0waSTHewkw");
}


