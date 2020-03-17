console.log("Imported krestiki");
var krest_lobbys = [];
function krestiki(message, Discord, db, client, gu, uu) {
    function showGameField(lobby) {
        var embd = new Discord.MessageEmbed()
            .setTitle(`Крестики-Нолики #${lobby.id}`)
            .setDescription(
                `
                ╔====╦=====╦====╗
                ║ᅠ1ᅠ║ᅠ2ᅠ║ᅠ3ᅠ║
                ╠====╬=====╬====╣
                ║ᅠ4ᅠ║ᅠ5ᅠ║ᅠ6ᅠ║
                ╠====╬=====╬====╣
                ║‌‌‍ᅠ7ᅠ║ᅠ8ᅠ║ᅠ9ᅠ║
                ╚====╩=====╩====╝
                `
            );
        message.channel.send(embd);
        return;
    }
    function startNewGame(lobby) {
        var old_lobby = lobby;
        lobby.score.o = 0;
        lobby.score.x = 0;
        lobby.curr_put = lobby.players[Math.random()];
        krest_lobbys[krest_lobbys.indexOf(old_lobby)] = lobby;
    }
    function getPlayerTag(lobby) {
        if (!lobby.players[1]) {
            return "-Пусто-"
        } else {
            return lobby.players[1].tag
        }
    }
    function showLobbysList() {
        var str = "";
        for (let i = 0; i < krest_lobbys.length; i++) {
            var lobby = krest_lobbys[i];
            str = `${str}\n\nLobby #${lobby.id}\nУчастники:\n1. ${lobby.players[0].tag} [:crown:]\n2. ${getPlayerTag(lobby)} [:bust_in_silhouette:]`;
        }
            var embd = new Discord.MessageEmbed()
            .setTitle("Доступные лобби крстики нолики:")
            .setDescription(str);
        message.channel.send(embd);
        return;
    }
    function getLobbyByID(id) {
        return krest_lobbys.find(lobby => lobby.id === id);
    }
    function getLobbyByUser(user) {
        return krest_lobbys.find(lobby => (lobby.players[0].id === user.id || lobby.players[1].id === user.id));
    }
    function showLobby(lobby) {
        var embd = new Discord.MessageEmbed()
            .setTitle(`Лобби крестики-нолики #${lobby.id}`)
            .setDescription(
            `\nИгроки:\n1. ${lobby.players[0].tag} [:crown:]\n2. ${getPlayerTag(lobby)} [:bust_in_silhouette:]`+
            `\nДля начала игры лидер лобби должен написать !krestiki start`
            )
        message.channel.send(embd);
        return;
    }
    function createLobby(user) {
        if(getLobbyByUser(user)){
            message.channel.send("У вас уже есть активная комната, чтобы завершить ее напишите !krestiki end");
            return;
        }else {
            var lobby = {
                user:message.author,
                id:krest_lobbys.length+1,
                players:[message.author],
                score:{
                    x:0,
                    o:0,
                },
                x:message.author,
                o: null,
                field: [
                    1, 2, 3,
                    4, 5, 6,
                    7, 8, 9
                ],
                isStarted: false,
                curr_put: null,
            };
            krest_lobbys.push(lobby);
            message.channel.send("Лобби создано!");
            showLobby(lobby);
            return;
        }
    }

    var args = message.content.split(" ");
    if (args[1]) {
        if (args[1] === "new") {
            createLobby(message.author);
            return;
        }else if (args[1] === "end") {
            if(!getLobbyByUser(message.author)) {
                message.channel.send("У вас нет активной комнаты, чтобы создать ее напишите !krestiki new");
                return;
            }else {
                var lobby = getLobbyByUser(message.author);
                krest_lobbys.splice(krest_lobbys.indexOf(lobby), 1);
                message.channel.send(`Комната #${lobby.id} успешно удалена!`);
                return;
            }
        }else if (args[1] === "list") {
            showLobbysList();
            return;
        }
        else if (args[1] === "join") {
            var lobby = getLobbyByID(parseInt(args[2]));
            var ind = krest_lobbys.indexOf(lobby);
            if(!lobby){
                message.channel.send("Вы ввели неверный id комнаты, либой такой комнаты не существует!");
                return;
            }else if(message.author in lobby.players){
                message.channel.send("Вы уже находитесь в этой комнате!");
                return;
            } else if(lobby.players.length == 2){
                message.channel.send("В комнате уже максимальное количество игроков!");
                return;
            }else {
                lobby.players.push(message.author);
                lobby.o = message.author;
                krest_lobbys[ind] = lobby;
                message.channel.send(`Вы успешно подключились к комнате ${lobby.id}`);
                showLobby(lobby);
                return;
            }
        }else if (args[1] === "kick") {
            var lobby = getLobbyByUser(message.author);
            var ind = krest_lobbys.indexOf(lobby);
            if (!lobby) {
                message.channel.send("Вы не находитесь в лобби!");
                return;
            } else if (!lobby.user.id === message.author.id) {
                message.channel.send("Вы не лидер лобби!");
                return;
            } else if (lobby.players.length < 2) {
                message.channel.send("В комнате минимальное количество человек, вы не можете никого кикнуть!");
                return;
            } else {
                var plr = lobby.players[1];
                lobby.players.splice(1, 1);
                lobby.o = null;
                krest_lobbys[ind] = lobby;
                message.channel.send(`Вы успешно кикнули игрока ${plr.tag}`);
                showLobby(lobby);
                return;
            }
        }else if (args[1] === "start") {
            var lobby = getLobbyByUser(message.author);
            message.channel.send("Игра запущена!");
            startNewGame(lobby);
            return;
        }

        var lobby = getLobbyByUser(message.author);
        var old_lobby = getLobbyByUser(message.author);
        if (!lobby) {
            message.channel.send("Вы не находитесь в лобби!");
            return;
        }
        if(!args[1] || isNaN(parseInt(args[1]))){
            if(lobby.isStarted){
                showGameField(lobby);
                return;
            }else {
                message.channel.send("Для начала игры лидер лобби должен написать !krestiki start");
                return;
            }
        }
        var pos = parseInt(args[1]);
        var xOrY;
        if(lobby.x.id === message.author.id){
            xOrY = ":x:";
        }else{
            xOrY = ":o:";
        }
        if(!(pos > 9 && pos < 1)){
            if(lobby.curr_put.id === message.author.id) {
                if(!(lobby.field[pos-1] === ":o:" || lobby.field[pos-1] === ":x:")){
                    message.channel.send(`Вы совершили ход на позицию ${pos}`);
                    lobby.field[pos-1] = xOrY;
                    lobby.curr_put = lobby.players[Math.random()];
                    krest_lobbys[krest_lobbys.indexOf(old_lobby)] = lobby;
                    showGameField(lobby);
                    return;

                }
            }
        }

    }

}