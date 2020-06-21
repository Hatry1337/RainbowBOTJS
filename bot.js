﻿const dev_mode = false;

const fs = require("fs");
const Discord = require('discord.js');
const client = new Discord.Client();
const Database = new (require('./modules/Database')).Database();
const Utils = new (require("./modules/Utils")).Utils(Discord, Database, client, fs, __dirname);


var utime;
client.once('ready', () => {
    console.log('Ready 1!');
    utime = new Date();
    client.user.setActivity('!rhelp', { type: 'WATCHING' });
    Utils.loadModules(Utils.getFiles(__dirname+"/cmds"));
    /*client.channels.cache.get("662657721266339853").createInvite({ temporary: true})
        .then(invite => console.log(invite.url))
        .catch(console.error);*/
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async message => {
    if(message.author.id === Utils.Client.user.id){return}
    if (message.channel.type === "dm") { message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); return; }
    Utils.saveMessage(message);
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;
    Utils.msgStat();
    const serverQueue = Utils.Modules.Music.queue.get(message.guild.id);
    Utils.checkReg(message, async function () {
        Database.getUserByDiscordID(message.author.id, async function (user) {
            if (user.lang === null) {
                if (message.content.startsWith(`!lang`)) {
                    Utils.langChange(message, user);
                    return;
                } else {
                    Utils.checkLang(message, user);
                }
            } else {
                Utils.checkLang(message, user);
                Utils.checkBan(message, async function () {
                    Utils.checkVip(message, async function () {
                        if (message.content.startsWith(`!rhelp`)) {
                            await Utils.Modules.Rhelp.execute(message, user.lang);
                            return;

                        } else if (message.content.startsWith(`!ukrmova`)) {
                            Utils.Modules.UkrMova.execute(message);
                            return;

                        } else if (message.content.startsWith(`!upd`)) {
                            Utils.Modules.Upd.execute(message);
                            return;

                        } else if (message.content.startsWith(`!uptime`)) {
                            Utils.Modules.Uptime.execute(message, utime, user.lang);
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
                            Utils.Modules.Profile.execute(message, user.lang);
                            return

                        } else if (message.content.startsWith(`!getmoney`)) {
                            Utils.Modules.GetMoney.execute(message);
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

                        } else if (message.content.startsWith(`!pay`)) {
                            Utils.Modules.Pay.execute(message);
                            return

                        } else if (message.content.startsWith(`!roll`)) {
                            Utils.Modules.Roll.execute(message);
                            return;

                        } else if (message.content.startsWith(`!8ball`)) {
                            Utils.Modules["8ball"].execute(message, user.lang);
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

                        } else if (message.content.startsWith(`!rep`)) {
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
                                message.channel.send("Вы не владелец C:");
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
                        } else{
                            console.log('You need to enter a valid command!');
                            return;
                        }
                    });

                });
            }
        });
    });
});


if (dev_mode) {
    client.login("NjI3NDkyMTQyMjk3NjQ1MDU2.Xh3pBg.xnRTvNixn_ubf4i25azaCt4vJ1w");
} else {
    client.login("NTcxOTQ4OTkzNjQzNTQ0NTg3.Xh3o8A.Gt82pQ_AhmSlC0ZDI0waSTHewkw");
}


