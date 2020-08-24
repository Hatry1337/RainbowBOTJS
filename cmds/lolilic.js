var moduleName = "Lolilic";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Lolilic {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Jimp = Utils.Jimp;
        this.Utils = Utils;
    }
    formatDate = function(d) {
        var days, months, years;
        years = d.getFullYear();
        if (d.getDate() < 10) {
            days = `0${d.getDate()}`;
        } else {
            days = d.getDate();
        }
        if (d.getMonth() + 1 < 10) {
            months = `0${d.getMonth() + 1}`;
        } else {
            months = d.getMonth() + 1;
        }

        return `${days}.${months}.${years}`;
    };
    execute = async function (message) {
        var args = message.content.split(" ");
        var userLic = message.author.id;
        if (args[1]) {
            userLic = this.Utils.parseID(args[1]);
        }
        if (isNaN(parseInt(userLic))) {
            message.channel.send("Введен неверный ID!");
            return;
        }
        var othis = this;
        this.Database.getUserByDiscordID(userLic, async function (user) {
            if (user) {
                if (args[1]) {
                    if (user.lolilic) {
                        if (user.lolilic.create_d !== 0) {
                            message.channel.send("Лицензия готовится. Пожалуйста подождите...");
                            var userName = user.user;
                            var creationDate = othis.formatDate(new Date(user.lolilic.create_d * 1000));
                            var voidDate = othis.formatDate(new Date(user.lolilic.void_d * 1000));
                            var personalID = user.lolilic.pid;
                            await othis.Jimp.read('output.png', async (err, img) => {
                                if (err) throw err;
                                await othis.Jimp.loadFont('fonts/font-small/font.fnt').then(async fontsm => {
                                    await othis.Jimp.loadFont('fonts/font-medium/font.fnt').then(async fontm => {
                                        img
                                            .print(fontsm, 1086, 1050, `PersonalID: ${personalID}`)
                                            .print(fontm, 42, 746, `Кому: ${userName}`)
                                            .print(fontm, 42, 809, `Когда: ${creationDate}`)
                                            .print(fontm, 49, 867, `Действительна до: ${voidDate}`)
                                            .write('endoutput.png'); // save
                                        message.channel.send({ files: ['endoutput.png'] });
                                        othis.Database.writeLog('lolilic', message.author.id, message.guild.name,
                                            JSON.stringify({
                                                Message: `User '${message.author.tag}' watched loli license of user '${userName}'.`
                                        }));
                                        return;
                                    });
                                });
                            });
                        } else {
                            message.channel.send("У данного пользователя нет лицензии на Лолю.");
                            return;
                        }
                    } else {
                        message.channel.send("У данного пользователя нет лицензии на Лолю.");
                        return;
                    }
                } else {
                    if (user.lolilic) {
                        if (user.lolilic.create_d !== 0) {
                            message.channel.send("Лицензия готовится. Пожалуйста подождите...");
                            var userName = message.author.tag;
                            var creationDate = othis.formatDate(new Date(user.lolilic.create_d * 1000));
                            var voidDate = othis.formatDate(new Date(user.lolilic.void_d * 1000));
                            var personalID = user.lolilic.pid;
                            await othis.Jimp.read('output.png', async (err, img) => {
                                if (err) throw err;
                                await othis.Jimp.loadFont('fonts/font-small/font.fnt').then(async fontsm => {
                                    await othis.Jimp.loadFont('fonts/font-medium/font.fnt').then(async fontm => {
                                        img
                                            .print(fontsm, 1086, 1050, `PersonalID: ${personalID}`)
                                            .print(fontm, 42, 746, `Кому: ${userName}`)
                                            .print(fontm, 42, 809, `Когда: ${creationDate}`)
                                            .print(fontm, 49, 867, `Действительна до: ${voidDate}`)
                                            .write('endoutput.png'); // save
                                        message.channel.send({ files: ['endoutput.png'] });
                                        othis.Database.writeLog('lolilic', message.author.id, message.guild.name,
                                            JSON.stringify({
                                                Message: `User '${message.author.tag}' watched loli license of user '${userName}'.`
                                            }));
                                        return;
                                    });
                                });
                            });
                        } else {
                            message.channel.send("Лицензия готовится. Пожалуйста подождите...");
                            var cur_date = new Date();
                            var void_date = new Date();
                            void_date.setFullYear(void_date.getFullYear() + 5);
                            user.lolilic = {
                                create_d: (cur_date.getTime() / 1000),
                                void_d: (void_date.getTime() / 1000),
                                pid: `${message.author.discriminator}-${user.num}-${Math.floor(Math.random() * 9999)}`
                            }
                            othis.Database.updateUser(message.author.id, user, async function () {
                                message.channel.send(`Вы успешно получили лицензию на Лолю!`);

                                var userName = message.author.tag;
                                var creationDate = othis.formatDate(new Date(user.lolilic.create_d * 1000));
                                var voidDate = othis.formatDate(new Date(user.lolilic.void_d * 1000));
                                var personalID = user.lolilic.pid;

                                await othis.Jimp.read('output.png', async (err, img) => {
                                    if (err) throw err;
                                    await othis.Jimp.loadFont('fonts/font-small/font.fnt').then(async fontsm => {
                                        await othis.Jimp.loadFont('fonts/font-medium/font.fnt').then(async fontm => {
                                            img
                                                .print(fontsm, 1086, 1050, `PersonalID: ${personalID}`)
                                                .print(fontm, 42, 746, `Кому: ${userName}`)
                                                .print(fontm, 42, 809, `Когда: ${creationDate}`)
                                                .print(fontm, 49, 867, `Действительна до: ${voidDate}`)
                                                .write('endoutput.png'); // save
                                            message.channel.send({ files: ['endoutput.png'] });
                                            othis.Database.writeLog('lolilic', message.author.id, message.guild.name,
                                                JSON.stringify({
                                                    Message: `User '${message.author.tag}' watched loli license of user '${userName}'.`
                                                }));
                                        });
                                    });
                                });
                            });
                        }
                    } else {
                        message.channel.send("Лицензия готовится. Пожалуйста подождите...");
                        var cur_date = new Date();
                        var void_date = new Date();
                        void_date.setFullYear(void_date.getFullYear() + 5);
                        user.lolilic = {
                            create_d: (cur_date.getTime() / 1000),
                            void_d: (void_date.getTime() / 1000),
                            pid: `${message.author.discriminator}-${user.num}-${Math.floor(Math.random() * 9999)}`
                        }
                        othis.Database.updateUser(message.author.id, user, async function () {
                            message.channel.send(`Вы успешно получили лицензию на Лолю!`);
                            var userName = message.author.tag;
                            var creationDate = othis.formatDate(new Date(user.lolilic.create_d * 1000));
                            var voidDate = othis.formatDate(new Date(user.lolilic.void_d * 1000));
                            var personalID = user.lolilic.pid;

                            await othis.Jimp.read('output.png', async (err, img) => {
                                if (err) throw err;
                                await othis.Jimp.loadFont('fonts/font-small/font.fnt').then(async fontsm => {
                                    await othis.Jimp.loadFont('fonts/font-medium/font.fnt').then(async fontm => {
                                        img
                                            .print(fontsm, 1086, 1050, `PersonalID: ${personalID}`)
                                            .print(fontm, 42, 746, `Кому: ${userName}`)
                                            .print(fontm, 42, 809, `Когда: ${creationDate}`)
                                            .print(fontm, 49, 867, `Действительна до: ${voidDate}`)
                                            .write('endoutput.png'); // save
                                        message.channel.send({ files: ['endoutput.png'] });
                                        othis.Database.writeLog('lolilic', message.author.id, message.guild.name,
                                            JSON.stringify({
                                                Message: `User '${message.author.tag}' watched loli license of user '${userName}'.`
                                            }));
                                    });
                                });
                            });
                        });
                    }
                }
            } else {
                message.channel.send("Данный пользователь не зарегистрирован!");
                return;
            }
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Lolilic;

