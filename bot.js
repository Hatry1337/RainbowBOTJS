const token = "NjI3NDkyMTQyMjk3NjQ1MDU2.Xepk7Q.hc1ZAkTaZ5yrwDW5qNiElMt1_50";
const Discord = require('discord.js');
const fs = require("fs");
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./database.db');

const client = new Discord.Client();

var utime;

client.once('ready', () => {
    console.log('Ready!');
    utime = new Date();
	client.user.setPresence({
	        game: {
	          name: `!rhelp`,
	          type: 0,
	        }
    })
    load_modules(getFiles("./cmds/"));
    getUserByDiscordID("508637328349331462", function (user) {
        console.log(user);
    });
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async message => {
	if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    fs.readFile('stats.json', 'utf8', function (error, data) {
        data = JSON.parse(data);
        var file = {
            stats: {
                messages: data.stats.messages+1,
            }
        }
        json = JSON.stringify(file, null, 4)
        fs.writeFile(`stats.json`, json, null, function () { })
    });

    checkReg(message, function () {
        if (message.content.startsWith(`!rhelp`)) {
            rhelp(message, Discord);
            return;

        } else if (message.content.startsWith(`!ukrmova`)) {
            ukrmova(message, Discord);
            return;

        } else if (message.content.startsWith(`!upd`)) {
            upd(message, Discord);
            return;

        } else if (message.content.startsWith(`!uptime`)) {
            uptime(message, utime, Discord);
            return;

        } else if (message.content.startsWith(`!rstats`)) {
            rstats(message, client, utime, Discord, fs);
            return;

        } else if (message.content.startsWith(`!hentai`)) {
            hentai(message, client, Discord, fs, db, getUserByDiscordID);
            return;

        } else if (message.content.startsWith(`!shop`)) {
            shop(message, client, Discord, db, getUserByDiscordID);
            return;

        } else if (message.content.startsWith(`!buy`)) {
            buy(message, Discord, db, client, getUserByDiscordID, updateUser);
            return

        } else if (message.content.startsWith(`!profile`)) {
            profile(message, Discord, db, client, getUserByDiscordID, updateUser);
            return

        } else if (message.content.startsWith(`!getmoney`)) {
            getmoney(message, Discord, db, client, getUserByDiscordID, updateUser);
            return

        }else {
            console.log('You need to enter a valid command!')
        }
    });
});





function checkReg(message, done) {
    getUserByDiscordID(message.author.id, function (user) {
        if (!(user)) {
            registerUser(message, function () { done() });
        } else {
            done();
        }
    });
}




var getFiles = function (dir, files_) {

    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
};

function load_modules(modules) {
    i = 0
    while (i < modules.length) {
        eval.apply(global, [fs.readFileSync(modules[i]).toString()]);
        i++;
    }
}




//DATABASE FUNCTIONS
function getDataBaseLength(done) {
    db.all(`SELECT * FROM users_info`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var length = rows.length;
        done(length);
        return length;
    });
}

function registerUser(message, done) {
    getDataBaseLength(function (dbLength) {
        db.run(`INSERT INTO users_info VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [message.author.tag, 50000, "Player", 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, dbLength + 1, message.author.id, "True", 1], function (err) {
            if (err) {
                return console.log(err.message);
            }
            done();
        });
    });
}

function getUserByDiscordID(discordId, done) {
    db.all(`SELECT * FROM users_info WHERE discord_id = ${discordId}`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var user = rows[0];
        done(user);
        return user;
    });
}

function getUserByLocalID(localID, done) {
    db.all(`SELECT * FROM users_info WHERE num = ${localID}`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var user = rows[0];
        done(user);
        return user;
    });
}

function getUserByName(Name, done) {
    db.all(`SELECT * FROM users_info WHERE user = ${Name}`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var user = rows[0];
        done(user);
        return user;
    });
}

function updateUser(discord_id, newUser, done) {
    db.run(`UPDATE users_info SET user=?, user_points=?, user_group=?, user_lvl=?, user_xp=?, bitminer1=?, bitminer2=?, bitminer_rack=?, bitm_dc=?, solar_station=?, bm1_time=?, bm2_time=?, bmr_time=?, bitm_dc_time=?, ss_time=?, ban_reason=?, ban_time=?, vip_time=?, num=?, discord_id=?, news_sub=?, damage=? WHERE discord_id = ?`, [newUser.user, newUser.user_points, newUser.user_group, newUser.user_lvl, newUser.user_xp, newUser.bitminer1, newUser.bitminer2, newUser.bitminer_rack, newUser.bitm_dc, newUser.solar_station, newUser.bm1_time, 0, 0, 0, 0, newUser.ban_reason, newUser.ban_time, newUser.vip_time, newUser.num, newUser.discord_id, newUser.news_sub, newUser.damage, discord_id], function (err) {
        if (err) {
            return console.log(err.message);
        }
        done();
    });
}


client.login(token);
