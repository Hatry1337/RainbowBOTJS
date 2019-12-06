const token = "NjI3NDkyMTQyMjk3NjQ1MDU2.Xepk7Q.hc1ZAkTaZ5yrwDW5qNiElMt1_50"
const Discord = require('discord.js');

var rhelp = require("./cmds/rhelp.js").rhelp;
var upd = require("./cmds/upd.js").upd;
var ukrmova = require("./cmds/ukrmova.js").ukrmova;

const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
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

	if (message.content.startsWith(`!rhelp`)) {
		rhelp(message);
		return;

	}else if (message.content.startsWith(`!ukrmova`)) {
		ukrmova(message);
		return;

	}else if (message.content.startsWith(`!upd`)) {
		upd(message);
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
