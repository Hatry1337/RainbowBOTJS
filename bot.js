const token = "NjI3NDkyMTQyMjk3NjQ1MDU2.Xepk7Q.hc1ZAkTaZ5yrwDW5qNiElMt1_50";
const Discord = require('discord.js');
const fs = require("fs");


var rhelp = require("./cmds/rhelp.js").rhelp;
var upd = require("./cmds/upd.js").upd;
var ukrmova = require("./cmds/ukrmova.js").ukrmova;
var uptime = require("./cmds/uptime.js").uptime;
var rstats = require("./cmds/rstats.js").rstats;

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
		rhelp(message);
		return;

	}else if (message.content.startsWith(`!ukrmova`)) {
		ukrmova(message);
		return;

	}else if (message.content.startsWith(`!upd`)) {
		upd(message);
        return;

    } else if (message.content.startsWith(`!uptime`)) {
        uptime(message, utime);
        return;

    } else if (message.content.startsWith(`!rstats`)) {
        rstats(message, client, utime);
        return;

	}else{
		console.log('You need to enter a valid command!')
	}
});



function arrayRandElement(arr) {
    var rand = Math.floor(Math.random() * arr.length);
    return arr[rand];
}

client.login(token);
