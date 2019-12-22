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
	          type: 0  //экспериментируйте доступные значения 0-3, что-то из этого "стримит"
	        }
    })
    load_modules(getFiles("./cmds/"));
    
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


	if (message.content.startsWith(`!rhelp`)) {
        rhelp(message, Discord);
		return;

	}else if (message.content.startsWith(`!ukrmova`)) {
        ukrmova(message, Discord);
		return;

	}else if (message.content.startsWith(`!upd`)) {
        upd(message, Discord);
        return;

    } else if (message.content.startsWith(`!uptime`)) {
        uptime(message, utime, Discord);
        return;

    } else if (message.content.startsWith(`!rstats`)) {
        rstats(message, client, utime, Discord, fs);
        return;

    } else if (message.content.startsWith(`!!hentai`)) {
        hentai(message, client, Discord, fs, db);
        return;

	}else{
		console.log('You need to enter a valid command!')
	}
});


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


client.login(token);
