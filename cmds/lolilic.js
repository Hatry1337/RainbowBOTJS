﻿console.log("Imported lolilic");
function lolilic(message, Discord, db, client, gu, uu, Jimp) {
    var args = message.content.split(" ");
    var userLic = message.author.id;
    if (args[1]) {
        userLic = args[1];
    }
    if (args[1]) {
        var uarg = args[1].toString();
        uarg = uarg.replace("<@!", "");
        uarg = uarg.replace(">", "");
        userLic = uarg;
    }
    if (isNaN(parseInt(userLic))) {
        message.channel.send("Введен неверный ID!");
        return;
    }

    gu(userLic, function (user) {
        if (user) {
            if (args[1]) {
                if (user.lolilic) {
                    user.lolilic = JSON.parse(user.lolilic);
                    var userName = user.user;
                    var creationDate = formatDate(new Date(user.lolilic.create_d * 1000));
                    var voidDate = formatDate(new Date(user.lolilic.void_d * 1000));
                    var personalID = user.lolilic.pid;
                    Jimp.read('output.png', (err, img) => {
                        if (err) throw err;
                        Jimp.loadFont('fonts/font-small/font.fnt').then(fontsm => {
                            Jimp.loadFont('fonts/font-medium/font.fnt').then(fontm => {
                                img
                                    .print(fontsm, 1086, 1050, `PersonalID: ${personalID}`)
                                    .print(fontm, 42, 746, `Кому: ${userName}`)
                                    .print(fontm, 42, 809, `Когда: ${creationDate}`)
                                    .print(fontm, 49, 867, `Действительна до: ${voidDate}`)
                                    .write('endoutput.png'); // save
                                message.channel.send({ files: ['endoutput.png'] });
                                return;
                            });
                        });
                    });
                } else {
                    message.channel.send("У данного пользователя нет лицензии на Лолю.");
                    return;
                }
            } else {
                if (user.lolilic) {
                    user.lolilic = JSON.parse(user.lolilic);
                    var userName = message.author.tag;
                    var creationDate = formatDate(new Date(user.lolilic.create_d * 1000));
                    var voidDate = formatDate(new Date(user.lolilic.void_d * 1000));
                    var personalID = user.lolilic.pid;
                    Jimp.read('output.png', (err, img) => {
                        if (err) throw err;
                        Jimp.loadFont('fonts/font-small/font.fnt').then(fontsm => {
                            Jimp.loadFont('fonts/font-medium/font.fnt').then(fontm => {
                                img
                                    .print(fontsm, 1086, 1050, `PersonalID: ${personalID}`)
                                    .print(fontm, 42, 746, `Кому: ${userName}`)
                                    .print(fontm, 42, 809, `Когда: ${creationDate}`)
                                    .print(fontm, 49, 867, `Действительна до: ${voidDate}`)
                                    .write('endoutput.png'); // save
                                message.channel.send({ files: ['endoutput.png'] });
                                return;
                            });
                        });
                    });
                } else {
                    var cur_date = new Date();
                    var void_date = new Date();
                    void_date.setFullYear(void_date.getFullYear() + 5);
                    var newLoliLicense = {
                        create_d: (cur_date.getTime() / 1000),
                        void_d: (void_date.getTime() / 1000),
                        pid: `${message.author.discriminator}-${user.num}-${Math.floor(Math.random() * 9999)}`
                    }
                    user.lolilic = JSON.stringify(newLoliLicense);
                    uu(message.author.id, user, function () {
                        message.channel.send(`Вы успешно получили лицензию на Лолю!`);

                        user.lolilic = JSON.parse(user.lolilic);
                        var userName = message.author.tag;
                        var creationDate = formatDate(new Date(user.lolilic.create_d * 1000));
                        var voidDate = formatDate(new Date(user.lolilic.void_d * 1000));
                        var personalID = user.lolilic.pid;

                        Jimp.read('output.png', (err, img) => {
                            if (err) throw err;
                            Jimp.loadFont('fonts/font-small/font.fnt').then(fontsm => {
                                Jimp.loadFont('fonts/font-medium/font.fnt').then(fontm => {
                                    img
                                        .print(fontsm, 1086, 1050, `PersonalID: ${personalID}`)
                                        .print(fontm, 42, 746, `Кому: ${userName}`)
                                        .print(fontm, 42, 809, `Когда: ${creationDate}`)
                                        .print(fontm, 49, 867, `Действительна до: ${voidDate}`)
                                        .write('endoutput.png'); // save
                                    message.channel.send({ files: ['endoutput.png'] });
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




function formatDate(d) {
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
}
