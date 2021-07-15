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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const CommandsController_1 = __importDefault(require("./CommandsController"));
const Database_1 = require("./Database");
const Guild_1 = require("./Models/Guild");
const Utils_1 = require("./Utils");
const client = new discord_js_1.default.Client();
const commandsController = new CommandsController_1.default();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield Database_1.sequelize.sync({ force: false });
}))();
client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Bot started.");
    console.log("Starting guilds caching...");
    Guild_1.Guild.findAll({
        where: {
            IsBanned: false
        }
    }).then((guilds) => __awaiter(void 0, void 0, void 0, function* () {
        for (var i in guilds) {
            yield client.guilds.fetch(guilds[i].ID, true, true);
            console.log(`Cached ${parseInt(i) + 1}/${guilds.length}`);
        }
    }));
}));
client.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(message.content);
    if (message.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
        return;
    if (message.channel.type === "dm") {
        yield message.channel.send("Команды в личных сообщениях не поддерживаются :cry:");
        return;
    }
    if (message.author.bot)
        return;
    if (!message.content.startsWith("!"))
        return;
    yield commandsController.FindAndRun(message);
}));
client.on("guildMemberAdd", (member) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g;
    Guild_1.Guild.findOrCreate({
        where: {
            ID: (_b = member.guild) === null || _b === void 0 ? void 0 : _b.id
        },
        defaults: {
            ID: (_c = member.guild) === null || _c === void 0 ? void 0 : _c.id,
            Name: (_d = member.guild) === null || _d === void 0 ? void 0 : _d.name,
            OwnerID: (_e = member.guild) === null || _e === void 0 ? void 0 : _e.ownerID,
            Region: (_f = member.guild) === null || _f === void 0 ? void 0 : _f.region,
            SystemChannelID: (_g = member.guild) === null || _g === void 0 ? void 0 : _g.systemChannelID,
            JoinRolesIDs: [],
        }
    }).then((res) => __awaiter(void 0, void 0, void 0, function* () {
        var _h, _j, _k, _l;
        var guild = res[0];
        if (guild.JoinRolesIDs.length > 0) {
            var roles = [];
            for (var i in guild.JoinRolesIDs) {
                var role = yield member.guild.roles.fetch(guild.JoinRolesIDs[i]);
                if (role) {
                    roles.push(role);
                }
                else {
                    guild.JoinRolesIDs.splice(parseInt(i), 1);
                }
            }
            yield Guild_1.Guild.update({ JoinRolesIDs: guild.JoinRolesIDs }, { where: { ID: guild.ID } }).catch(err => console.error(err));
            if (!roles.find(r => !r.editable)) {
                yield member.roles.add(roles);
            }
            else {
                var channel;
                if (guild.LogChannelID) {
                    channel = client.channels.cache.find(c => c.id === guild.LogChannelID);
                }
                else {
                    channel = member.guild.systemChannel;
                }
                yield (channel === null || channel === void 0 ? void 0 : channel.send(`${(_h = channel.guild.owner) === null || _h === void 0 ? void 0 : _h.user}, RainbowBOT don't have permissons to add one of selected roles to joined user. Make RainbowBOT's role upper than join roles.`));
            }
        }
        if (!guild.IsJoinMessageEnabled || !guild.JoinMessageChannelID) {
            return;
        }
        if (guild.Meta.jmgr_msg) {
            var msg_settings = guild.Meta.jmgr_msg;
            msg_settings.Title = (_j = msg_settings.Title) === null || _j === void 0 ? void 0 : _j.replace(/%user%/g, member.user.toString());
            msg_settings.Description = (_k = msg_settings.Description) === null || _k === void 0 ? void 0 : _k.replace(/%blank%/g, "");
            msg_settings.Description = (_l = msg_settings.Description) === null || _l === void 0 ? void 0 : _l.replace(/%user%/g, member.user.toString());
            var embd = new discord_js_1.default.MessageEmbed({
                title: msg_settings.Title,
                description: msg_settings.Description,
                image: { url: msg_settings.Image },
                color: Utils_1.Colors.Success
            });
            var avatar_url = member.user.avatarURL();
            if (msg_settings.Avatar && avatar_url) {
                embd.thumbnail = { url: avatar_url };
            }
            var channel = client.channels.cache.find(c => c.id === guild.JoinMessageChannelID);
            return yield channel.send(embd);
        }
        else {
            var embd = new discord_js_1.default.MessageEmbed({
                title: `Welcome to ${member.guild}!`,
                description: `We are happy to see you there, ${member.user}!`,
                color: Utils_1.Colors.Success
            });
            var avatar_url = member.user.avatarURL();
            if (avatar_url) {
                embd.thumbnail = { url: avatar_url };
            }
            var channel = client.channels.cache.find(c => c.id === guild.JoinMessageChannelID);
            return yield channel.send(embd);
        }
    })).catch(err => { throw err; });
}));
client.on("guildMemberRemove", (member) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o, _p, _q, _r, _s;
    Guild_1.Guild.findOrCreate({
        where: {
            ID: (_m = member.guild) === null || _m === void 0 ? void 0 : _m.id
        },
        defaults: {
            ID: (_o = member.guild) === null || _o === void 0 ? void 0 : _o.id,
            Name: (_p = member.guild) === null || _p === void 0 ? void 0 : _p.name,
            OwnerID: (_q = member.guild) === null || _q === void 0 ? void 0 : _q.ownerID,
            Region: (_r = member.guild) === null || _r === void 0 ? void 0 : _r.region,
            SystemChannelID: (_s = member.guild) === null || _s === void 0 ? void 0 : _s.systemChannelID,
            JoinRolesIDs: [],
        }
    }).then((res) => __awaiter(void 0, void 0, void 0, function* () {
        var _t, _u;
        var guild = res[0];
        if (!guild.IsJoinMessageEnabled || !guild.JoinMessageChannelID) {
            return;
        }
        var embd = new discord_js_1.default.MessageEmbed({
            title: `${(_t = member.user) === null || _t === void 0 ? void 0 : _t.tag} leaved from server!`,
            color: Utils_1.Colors.Warning
        });
        var avatar_url = (_u = member.user) === null || _u === void 0 ? void 0 : _u.avatarURL();
        if (avatar_url) {
            embd.thumbnail = { url: avatar_url };
        }
        var channel = client.channels.cache.find(c => c.id === guild.JoinMessageChannelID);
        return yield channel.send(embd);
    })).catch(err => { throw err; });
}));
client.login("NjI3NDkyMTQyMjk3NjQ1MDU2.XY9bmA.4-3FITnIwAlSKE3mPWkLYv8baJs");
//# sourceMappingURL=bot.js.map