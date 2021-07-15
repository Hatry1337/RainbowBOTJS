"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const discord_js_1 = __importDefault(require("discord.js"));
const dblapi_js_1 = __importDefault(require("dblapi.js"));
const events_1 = __importDefault(require("events"));
//const Database = require("../modules/Database");
//const { MusicManager } = require("../modules/Models");
//const ItemManager = require("./ItemManager");
//const UserManager = require("./UserManager");
class RainbowBOT extends events_1.default {
    constructor() {
        super();
        this.setMaxListeners(100);
        this.Client = new discord_js_1.default.Client();
        this.dbl = new dblapi_js_1.default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MTk0ODk5MzY0MzU0NDU4NyIsImJvdCI6dHJ1ZSwiaWF0IjoxNTc1NTczMjAyfQ.9OfSSDWcanClZpsqdFsz7U-1gStTb0SwYZWF49FtrNU', this.Client);
        this.localization = require("../lang");
        //this.Utils = new Utils(this);
        //this.ItemManager = new ItemManager(this);
        //this.UserManager = new UserManager(this);
        this.Commands = {
            EightBall: new (require("../cmds/8ball"))(this),
            Anecdot: new (require("../cmds/anecdot"))(this),
            Ascii: new (require("../cmds/ascii/ascii"))(this),
            Avatar: new (require("../cmds/Avatar"))(this),
            Ban: new (require("../cmds/ban"))(this),
            Shop: new (require("../cmds/shop"))(this),
            Profile: new (require("../cmds/profile"))(this),
            Admin: new (require("../cmds/admin"))(this),
            Buy: new (require("../cmds/buy"))(this),
            Items: new (require("../cmds/items"))(this),
            Farm: new (require("../cmds/farm"))(this),
            Pinggg: new (require("../cmds/pinggg"))(this),
            As: new (require("../cmds/as"))(this),
            Clear: new (require("../cmds/clear"))(this),
            CowSay: new (require("../cmds/cowsay"))(this),
            Pipe: new (require("../cmds/pipe"))(this),
            Music: new (require("../cmds/Music"))(this),
            Demot: new (require("../cmds/demot/demot"))(this),
        };
        this.Client.once('ready', () => __awaiter(this, void 0, void 0, function* () {
            this.startTimestamp = new Date();
            console.log("Caching music channels...");
            var managers = yield MusicManager.findAll();
            for (var i in managers) {
                var ch = yield this.Client.channels.fetch(managers[i].get("music_channel_id")).catch((e) => __awaiter(this, void 0, void 0, function* () {
                    if (e && e.code === 10003) {
                        console.log(`[${managers[i].get("music_channel_id")}] Channel not found. Deleting manager`);
                        yield managers[i].destroy();
                    }
                }));
                if (ch) {
                    yield ch.messages.fetch();
                    console.log(`${parseInt(i) + 1}/${managers.length}`);
                }
            }
        }));
        this.Client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.author.id === this.Client.user.id) {
                return;
            }
            if (message.channel.type === "dm") {
                message.channel.send("Команды в личных сообщениях не поддерживаются :cry:");
                return;
            }
            this.Utils.saveMessage(message);
            if (message.author.bot)
                return;
            if (!message.content.startsWith("!"))
                return;
            //const serverQueue = this.Commands.Music.queue.get(message.guild.id);
            this.Utils.checkReg(message).then((user) => __awaiter(this, void 0, void 0, function* () {
                yield this.Utils.updateUserName(message, user);
                this.Utils.fetchLang(message, user).then((user) => __awaiter(this, void 0, void 0, function* () {
                    yield this.Utils.checkLang(message, user);
                    this.Utils.checkBan(message, user).then(user => {
                        if (!user)
                            return;
                        this.Utils.checkVip(message, user).then(user => {
                            this.Utils.checkLvl(message, user).then(user => {
                                if (!user)
                                    return;
                                Database.writeLog('Command', message.author.id, message.guild.name, {
                                    Author: message.author.tag,
                                    MContent: message.content,
                                    SVID: message.guild.id,
                                    CHName: message.channel.name,
                                    Message: `User '${message.author.tag}' typed '${message.content}' in '${message.channel.name}' on '${message.guild.name}'.`
                                });
                                this.emit('command', message, user);
                            });
                        });
                    });
                }));
            }));
        }));
        //Music Events
        this.Client.on("messageReactionAdd", (reaction, user) => __awaiter(this, void 0, void 0, function* () {
            if (user.id === this.Client.user.id) {
                return;
            }
            var manager = yield MusicManager.findOne({
                where: {
                    music_message_id: reaction.message.id
                }
            });
            if (manager) {
                var member = reaction.message.guild.member(user.id);
                if (member.roles.cache.get(manager.get("dj_role_id"))) {
                    this.emit("music_reaction", member, reaction, manager);
                }
                else {
                    yield reaction.users.remove(user.id);
                }
            }
        }));
        this.Client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.author.id === this.Client.user.id) {
                return;
            }
            var manager = yield MusicManager.findOne({
                where: {
                    music_channel_id: message.channel.id
                }
            });
            if (manager) {
                if (message.member.roles.cache.get(manager.get("dj_role_id"))) {
                    this.emit("music_message", message.member, message, manager);
                }
                else {
                    yield message.delete();
                }
            }
        }));
    }
    /**
     * @returns {number}
     */
    getUptime() {
        if (!this.startTimestamp) {
            return 0;
        }
        else {
            return (new Date().getTime() - this.startTimestamp.getTime()) / 1000;
        }
    }
}
module.exports = RainbowBOT;
//# sourceMappingURL=RainbowBOT.js.map