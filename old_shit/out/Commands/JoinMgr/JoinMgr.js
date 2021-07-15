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
const Guild_1 = require("../../Models/Guild");
const Utils_1 = require("../../Utils");
class JoinMgr {
    constructor(controller) {
        this.Name = "JoinMgr";
        this.Trigger = "!joinmgr";
        this.Usage = "`!joinmgr <sub_cmd> ...`\n\n" +
            "**Subcommands:**\n" +
            "`!joinmgr add-join-role @role` - Add selected role to join roles list. Roles from this list are given to members when they join on server.\n\n" +
            "`!joinmgr rm-join-role @role` - Remove selected role from join roles list.\n\n" +
            "`!joinmgr join-roles` - View list of join roles.\n\n" +
            "`!joinmgr join-message-channel #channel` - Set channel to which join messages will be sent.\n\n" +
            "`!joinmgr join-message-cfg` - Configure custom join message.\n\n" +
            "`!joinmgr join-message-enable` - Enable join messages.\n\n" +
            "`!joinmgr join-message-disable` - Disable join messages.\n\n";
        this.Description = "Using this command admins can set join message, channel, roles and etc.";
        this.Category = "Utility";
        this.Controller = controller;
    }
    Test(mesage) {
        return mesage.content.toLowerCase().startsWith("!joinmgr");
    }
    Run(message) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18;
            if (!((_a = message.member) === null || _a === void 0 ? void 0 : _a.hasPermission("ADMINISTRATOR"))) {
                var embd = new discord_js_1.default.MessageEmbed({
                    title: `${Utils_1.Emojis.RedErrorCross} Only administrators can use this command.`,
                    color: Utils_1.Colors.Error
                });
                return resolve(yield message.channel.send(embd));
            }
            var args = message.content.split(" ").slice(1);
            if (args.length === 0) {
                var embd = new discord_js_1.default.MessageEmbed({
                    title: `${Utils_1.Emojis.RedErrorCross} No subcommand provided.`,
                    description: `Command Usage: \n${this.Usage}`,
                    color: Utils_1.Colors.Error
                });
                return resolve(yield message.channel.send(embd));
            }
            switch (args[0]) {
                case "add-join-role": {
                    Guild_1.Guild.findOrCreate({
                        where: {
                            ID: (_b = message.guild) === null || _b === void 0 ? void 0 : _b.id
                        },
                        defaults: {
                            ID: (_c = message.guild) === null || _c === void 0 ? void 0 : _c.id,
                            Name: (_d = message.guild) === null || _d === void 0 ? void 0 : _d.name,
                            OwnerID: (_e = message.guild) === null || _e === void 0 ? void 0 : _e.ownerID,
                            Region: (_f = message.guild) === null || _f === void 0 ? void 0 : _f.region,
                            SystemChannelID: (_g = message.guild) === null || _g === void 0 ? void 0 : _g.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        var _19;
                        var guild = res[0];
                        var role_id = Utils_1.Utils.parseID(args[1]);
                        if (role_id && role_id.length === 18) {
                            var role = (_19 = message.guild) === null || _19 === void 0 ? void 0 : _19.roles.cache.get(role_id);
                            if (guild.JoinRolesIDs.length < 20) {
                                guild.JoinRolesIDs.push(role_id);
                                Guild_1.Guild.update({ JoinRolesIDs: guild.JoinRolesIDs }, { where: { ID: guild.ID } }).then(() => __awaiter(this, void 0, void 0, function* () {
                                    var all_roles = "";
                                    for (var r of guild.JoinRolesIDs) {
                                        all_roles += `${Utils_1.Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                                    }
                                    var embd = new discord_js_1.default.MessageEmbed({
                                        title: `New role added to join roles list`,
                                        description: `**Role ${role} added to join roles list.**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                        color: Utils_1.Colors.Success
                                    });
                                    return resolve(yield message.channel.send(embd));
                                }));
                            }
                            else {
                                var all_roles = "";
                                for (var r of guild.JoinRolesIDs) {
                                    all_roles += `${Utils_1.Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                                }
                                var embd = new discord_js_1.default.MessageEmbed({
                                    title: `${Utils_1.Emojis.RedErrorCross} You can't add more than 20 roles to join roles list`,
                                    description: `**Remove some of them with \`!joinmgr rm-join-role\`**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                    color: Utils_1.Colors.Error
                                });
                                return resolve(yield message.channel.send(embd));
                            }
                        }
                        else {
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `${Utils_1.Emojis.RedErrorCross} Role ID is invalid. Please, check it, and try again.`,
                                color: Utils_1.Colors.Error
                            });
                            return resolve(yield message.channel.send(embd));
                        }
                    })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                        console.error(res);
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }));
                    break;
                }
                case "rm-join-role": {
                    Guild_1.Guild.findOrCreate({
                        where: {
                            ID: (_h = message.guild) === null || _h === void 0 ? void 0 : _h.id
                        },
                        defaults: {
                            ID: (_j = message.guild) === null || _j === void 0 ? void 0 : _j.id,
                            Name: (_k = message.guild) === null || _k === void 0 ? void 0 : _k.name,
                            OwnerID: (_l = message.guild) === null || _l === void 0 ? void 0 : _l.ownerID,
                            Region: (_m = message.guild) === null || _m === void 0 ? void 0 : _m.region,
                            SystemChannelID: (_o = message.guild) === null || _o === void 0 ? void 0 : _o.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        var _20;
                        var guild = res[0];
                        var role_id = Utils_1.Utils.parseID(args[1]);
                        if (role_id && role_id.length === 18) {
                            var role = (_20 = message.guild) === null || _20 === void 0 ? void 0 : _20.roles.cache.get(role_id);
                            if (guild.JoinRolesIDs.length > 0) {
                                var r_indx = guild.JoinRolesIDs.indexOf(role_id);
                                if (r_indx !== -1) {
                                    guild.JoinRolesIDs.splice(r_indx, 1);
                                    Guild_1.Guild.update({ JoinRolesIDs: guild.JoinRolesIDs }, { where: { ID: guild.ID } }).then(() => __awaiter(this, void 0, void 0, function* () {
                                        var all_roles = "";
                                        for (var r of guild.JoinRolesIDs) {
                                            all_roles += `${Utils_1.Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                                        }
                                        var embd = new discord_js_1.default.MessageEmbed({
                                            title: `Role removed from join roles list`,
                                            description: `**Role ${role} has been removed from join roles list.**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                            color: Utils_1.Colors.Success
                                        });
                                        return resolve(yield message.channel.send(embd));
                                    }));
                                }
                                else {
                                    var all_roles = "";
                                    for (var r of guild.JoinRolesIDs) {
                                        all_roles += `${Utils_1.Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                                    }
                                    var embd = new discord_js_1.default.MessageEmbed({
                                        title: `${Utils_1.Emojis.RedErrorCross} This role is not in join roles list`,
                                        description: `**Role ${role} is not in join roles list.**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                        color: Utils_1.Colors.Error
                                    });
                                    return resolve(yield message.channel.send(embd));
                                }
                            }
                            else {
                                var embd = new discord_js_1.default.MessageEmbed({
                                    title: `${Utils_1.Emojis.RedErrorCross} You dont't have roles in join roles list`,
                                    description: `**You can add them with \`!joinmgr add-join-role\`**`,
                                    color: Utils_1.Colors.Error
                                });
                                return resolve(yield message.channel.send(embd));
                            }
                        }
                        else {
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `${Utils_1.Emojis.RedErrorCross} Role ID is invalid. Please, check it, and try again.`,
                                color: Utils_1.Colors.Error
                            });
                            return resolve(yield message.channel.send(embd));
                        }
                    })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                        console.error(res);
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }));
                    break;
                }
                case "join-roles": {
                    Guild_1.Guild.findOrCreate({
                        where: {
                            ID: (_p = message.guild) === null || _p === void 0 ? void 0 : _p.id
                        },
                        defaults: {
                            ID: (_q = message.guild) === null || _q === void 0 ? void 0 : _q.id,
                            Name: (_r = message.guild) === null || _r === void 0 ? void 0 : _r.name,
                            OwnerID: (_s = message.guild) === null || _s === void 0 ? void 0 : _s.ownerID,
                            Region: (_t = message.guild) === null || _t === void 0 ? void 0 : _t.region,
                            SystemChannelID: (_u = message.guild) === null || _u === void 0 ? void 0 : _u.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        var guild = res[0];
                        if (guild.JoinRolesIDs.length > 0) {
                            var all_roles = "";
                            for (var r of guild.JoinRolesIDs) {
                                all_roles += `${Utils_1.Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                            }
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `Join roles list:`,
                                description: `${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                color: Utils_1.Colors.Noraml
                            });
                            return resolve(yield message.channel.send(embd));
                        }
                        else {
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `${Utils_1.Emojis.RedErrorCross} You dont't have roles in join roles list`,
                                description: `**You can add them with \`!joinmgr add-join-role\`**`,
                                color: Utils_1.Colors.Error
                            });
                            return resolve(yield message.channel.send(embd));
                        }
                    })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                        console.error(res);
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }));
                    break;
                }
                case "join-message-channel": {
                    Guild_1.Guild.findOrCreate({
                        where: {
                            ID: (_v = message.guild) === null || _v === void 0 ? void 0 : _v.id
                        },
                        defaults: {
                            ID: (_w = message.guild) === null || _w === void 0 ? void 0 : _w.id,
                            Name: (_x = message.guild) === null || _x === void 0 ? void 0 : _x.name,
                            OwnerID: (_y = message.guild) === null || _y === void 0 ? void 0 : _y.ownerID,
                            Region: (_z = message.guild) === null || _z === void 0 ? void 0 : _z.region,
                            SystemChannelID: (_0 = message.guild) === null || _0 === void 0 ? void 0 : _0.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        var _21;
                        var guild = res[0];
                        var channel_id = Utils_1.Utils.parseID(args[1]);
                        if (channel_id && channel_id.length === 18) {
                            var channel = (_21 = message.guild) === null || _21 === void 0 ? void 0 : _21.channels.cache.get(channel_id);
                            guild.JoinMessageChannelID = channel_id;
                            Guild_1.Guild.update({ JoinMessageChannelID: guild.JoinMessageChannelID }, { where: { ID: guild.ID } }).then(() => __awaiter(this, void 0, void 0, function* () {
                                var embd = new discord_js_1.default.MessageEmbed({
                                    title: `Configured join message channel`,
                                    description: `**Channel ${channel} has been configured to join messages. You can configure custom join message by \`!joinmgr join-message-cfg\` or use default one.**`,
                                    color: Utils_1.Colors.Success
                                });
                                return resolve(yield message.channel.send(embd));
                            })).catch((err) => __awaiter(this, void 0, void 0, function* () {
                                console.error(err);
                                var embd = new discord_js_1.default.MessageEmbed({
                                    title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                    color: Utils_1.Colors.Error
                                });
                                return resolve(yield message.channel.send(embd));
                            }));
                        }
                        else {
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `${Utils_1.Emojis.RedErrorCross} Channel ID is invalid. Please, check it, and try again.`,
                                color: Utils_1.Colors.Error
                            });
                            return resolve(yield message.channel.send(embd));
                        }
                    })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                        console.error(res);
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }));
                    break;
                }
                case "join-message-cfg": {
                    Guild_1.Guild.findOrCreate({
                        where: {
                            ID: (_1 = message.guild) === null || _1 === void 0 ? void 0 : _1.id
                        },
                        defaults: {
                            ID: (_2 = message.guild) === null || _2 === void 0 ? void 0 : _2.id,
                            Name: (_3 = message.guild) === null || _3 === void 0 ? void 0 : _3.name,
                            OwnerID: (_4 = message.guild) === null || _4 === void 0 ? void 0 : _4.ownerID,
                            Region: (_5 = message.guild) === null || _5 === void 0 ? void 0 : _5.region,
                            SystemChannelID: (_6 = message.guild) === null || _6 === void 0 ? void 0 : _6.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        var guild = res[0];
                        var msg_filter = (m) => m.author.id === message.author.id;
                        var wait_settings = {
                            max: 1,
                            time: 120000,
                            errors: ['time']
                        };
                        var msg_settings = {
                            Title: "`Empty`"
                        };
                        var emb_main = new discord_js_1.default.MessageEmbed({
                            title: `Custom Join Message Configuration Wizard`,
                            description: `**Welcome to Custom Join Message Configuration Wizard. To configrure custom join message, you need to answer on few questions. Let's Start!**\n\n *Are you ready?*\nType **y/n** (Yes/No)`,
                            color: Utils_1.Colors.Noraml
                        });
                        yield message.channel.send(emb_main);
                        message.channel.awaitMessages(msg_filter, wait_settings).then((collected) => __awaiter(this, void 0, void 0, function* () {
                            var msg = collected.first();
                            if ((msg === null || msg === void 0 ? void 0 : msg.content.toLowerCase()) === "y") {
                                emb_main.description = "*Write title for your rich embed. You can use `%user%` to mention joined user.*";
                                yield message.channel.send(emb_main);
                                message.channel.awaitMessages(msg_filter, wait_settings).then((collected) => __awaiter(this, void 0, void 0, function* () {
                                    var msg = collected.first();
                                    if ((msg === null || msg === void 0 ? void 0 : msg.content) && (msg === null || msg === void 0 ? void 0 : msg.content) !== "") {
                                        msg_settings.Title = msg.content;
                                    }
                                    else {
                                        msg_settings.Title = "`Empty`";
                                    }
                                    emb_main.description = `**Configured title: \`${msg_settings.Title}\`**\n\n*Write description of your rich embed. You can use \`%user%\` to mention joined user. You can also leave it blank by sending \`%blank%\`*`;
                                    yield message.channel.send(emb_main);
                                    message.channel.awaitMessages(msg_filter, wait_settings).then((collected) => __awaiter(this, void 0, void 0, function* () {
                                        var msg = collected.first();
                                        msg_settings.Description = msg === null || msg === void 0 ? void 0 : msg.content;
                                        emb_main.description = `**Configured description: \`${msg_settings.Description}\`**\n*Do you want attach an image to your message?. Send one if so, or leave blank with \`%blank%\`*`;
                                        yield message.channel.send(emb_main);
                                        message.channel.awaitMessages(msg_filter, wait_settings).then((collected) => __awaiter(this, void 0, void 0, function* () {
                                            var _22;
                                            var msg = collected.first();
                                            msg_settings.Image = (_22 = msg === null || msg === void 0 ? void 0 : msg.attachments.first()) === null || _22 === void 0 ? void 0 : _22.proxyURL;
                                            emb_main.description = `**Configured image: \`${msg_settings.Image}\`**\n*Do you want attach an joined user avatar to thumbnail of your message?.\nType **y/n** (Yes/No)*`;
                                            yield message.channel.send(emb_main);
                                            message.channel.awaitMessages(msg_filter, wait_settings).then((collected) => __awaiter(this, void 0, void 0, function* () {
                                                var _23;
                                                var msg = collected.first();
                                                msg_settings.Avatar = (msg === null || msg === void 0 ? void 0 : msg.content.toLowerCase()) === "y";
                                                emb_main.description = `**Attach avatar: \`${msg_settings.Avatar}\`**\n*All done! Test message will be sent to this channel.*`;
                                                yield message.channel.send(emb_main);
                                                (_23 = msg_settings.Description) === null || _23 === void 0 ? void 0 : _23.replace(/%blank%/g, "");
                                                guild.Meta.jmgr_msg = msg_settings;
                                                Guild_1.Guild.update({
                                                    Meta: guild.Meta
                                                }, {
                                                    where: {
                                                        ID: guild.ID
                                                    }
                                                }).then((guild) => __awaiter(this, void 0, void 0, function* () {
                                                    var _24, _25, _26;
                                                    msg_settings.Title = (_24 = msg_settings.Title) === null || _24 === void 0 ? void 0 : _24.replace(/%user%/g, message.author.toString());
                                                    msg_settings.Description = (_25 = msg_settings.Description) === null || _25 === void 0 ? void 0 : _25.replace(/%blank%/g, "");
                                                    msg_settings.Description = (_26 = msg_settings.Description) === null || _26 === void 0 ? void 0 : _26.replace(/%user%/g, message.author.toString());
                                                    var embd = new discord_js_1.default.MessageEmbed({
                                                        title: msg_settings.Title,
                                                        description: msg_settings.Description,
                                                        image: { url: msg_settings.Image },
                                                        color: Utils_1.Colors.Success
                                                    });
                                                    var avatar_url = message.author.avatarURL();
                                                    if (msg_settings.Avatar && avatar_url) {
                                                        embd.thumbnail = { url: avatar_url };
                                                    }
                                                    return resolve(yield message.channel.send(embd));
                                                })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                                                    console.error(res);
                                                    var embd = new discord_js_1.default.MessageEmbed({
                                                        title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                                        color: Utils_1.Colors.Error
                                                    });
                                                    return resolve(yield message.channel.send(embd));
                                                }));
                                            })).catch(() => __awaiter(this, void 0, void 0, function* () {
                                                var embd = new discord_js_1.default.MessageEmbed({
                                                    title: `Custom Join Message Configuration Wizard`,
                                                    description: `**Answer time is over! Configuration Wizard finished.**`,
                                                    color: Utils_1.Colors.Warning
                                                });
                                                return resolve(yield message.channel.send(embd));
                                            }));
                                        })).catch(() => __awaiter(this, void 0, void 0, function* () {
                                            var embd = new discord_js_1.default.MessageEmbed({
                                                title: `Custom Join Message Configuration Wizard`,
                                                description: `**Answer time is over! Configuration Wizard finished.**`,
                                                color: Utils_1.Colors.Warning
                                            });
                                            return resolve(yield message.channel.send(embd));
                                        }));
                                    })).catch(() => __awaiter(this, void 0, void 0, function* () {
                                        var embd = new discord_js_1.default.MessageEmbed({
                                            title: `Custom Join Message Configuration Wizard`,
                                            description: `**Answer time is over! Configuration Wizard finished.**`,
                                            color: Utils_1.Colors.Warning
                                        });
                                        return resolve(yield message.channel.send(embd));
                                    }));
                                })).catch((err) => __awaiter(this, void 0, void 0, function* () {
                                    var embd = new discord_js_1.default.MessageEmbed({
                                        title: `Custom Join Message Configuration Wizard`,
                                        description: `**Answer time is over! Configuration Wizard finished.**`,
                                        color: Utils_1.Colors.Warning
                                    });
                                    console.error(err);
                                    return resolve(yield message.channel.send(embd));
                                }));
                            }
                            else {
                                var embd = new discord_js_1.default.MessageEmbed({
                                    title: `Custom Join Message Configuration Wizard`,
                                    description: `**Configuration Wizard finished.**`,
                                    color: Utils_1.Colors.Warning
                                });
                                return resolve(yield message.channel.send(embd));
                            }
                        })).catch(() => __awaiter(this, void 0, void 0, function* () {
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `Custom Join Message Configuration Wizard`,
                                description: `**Answer time is over! Configuration Wizard finished.**`,
                                color: Utils_1.Colors.Warning
                            });
                            return resolve(yield message.channel.send(embd));
                        }));
                    })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                        console.error(res);
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }));
                    break;
                }
                case "join-message-enable": {
                    Guild_1.Guild.findOrCreate({
                        where: {
                            ID: (_7 = message.guild) === null || _7 === void 0 ? void 0 : _7.id
                        },
                        defaults: {
                            ID: (_8 = message.guild) === null || _8 === void 0 ? void 0 : _8.id,
                            Name: (_9 = message.guild) === null || _9 === void 0 ? void 0 : _9.name,
                            OwnerID: (_10 = message.guild) === null || _10 === void 0 ? void 0 : _10.ownerID,
                            Region: (_11 = message.guild) === null || _11 === void 0 ? void 0 : _11.region,
                            SystemChannelID: (_12 = message.guild) === null || _12 === void 0 ? void 0 : _12.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        var _27;
                        var guild = res[0];
                        if (guild.JoinMessageChannelID) {
                            var channel = (_27 = message.guild) === null || _27 === void 0 ? void 0 : _27.channels.cache.get(guild.JoinMessageChannelID);
                            guild.IsJoinMessageEnabled = true;
                            Guild_1.Guild.update({ JoinMessageChannelID: guild.JoinMessageChannelID }, { where: { ID: guild.ID } }).then(() => __awaiter(this, void 0, void 0, function* () {
                                var embd = new discord_js_1.default.MessageEmbed({
                                    title: `Join messages enabled!`,
                                    description: `**Now join messages will be sending to ${channel}. You can disable join messages by \`!joinmgr join-message-disable\`**`,
                                    color: Utils_1.Colors.Success
                                });
                                return resolve(yield message.channel.send(embd));
                            })).catch((err) => __awaiter(this, void 0, void 0, function* () {
                                console.error(err);
                                var embd = new discord_js_1.default.MessageEmbed({
                                    title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                    color: Utils_1.Colors.Error
                                });
                                return resolve(yield message.channel.send(embd));
                            }));
                        }
                        else {
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `${Utils_1.Emojis.RedErrorCross} Cannot enable join message. First you need to set join message channel by \`!joinmgr join-message-channel #channel\`.`,
                                color: Utils_1.Colors.Error
                            });
                            return resolve(yield message.channel.send(embd));
                        }
                    })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                        console.error(res);
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }));
                    break;
                }
                case "join-message-disable": {
                    Guild_1.Guild.findOrCreate({
                        where: {
                            ID: (_13 = message.guild) === null || _13 === void 0 ? void 0 : _13.id
                        },
                        defaults: {
                            ID: (_14 = message.guild) === null || _14 === void 0 ? void 0 : _14.id,
                            Name: (_15 = message.guild) === null || _15 === void 0 ? void 0 : _15.name,
                            OwnerID: (_16 = message.guild) === null || _16 === void 0 ? void 0 : _16.ownerID,
                            Region: (_17 = message.guild) === null || _17 === void 0 ? void 0 : _17.region,
                            SystemChannelID: (_18 = message.guild) === null || _18 === void 0 ? void 0 : _18.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        var guild = res[0];
                        guild.IsJoinMessageEnabled = false;
                        Guild_1.Guild.update({ JoinMessageChannelID: guild.JoinMessageChannelID }, { where: { ID: guild.ID } }).then(() => __awaiter(this, void 0, void 0, function* () {
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `Join messages disabled!`,
                                description: `**Now join messages disabled. You can enable join messages by \`!joinmgr join-message-enableS\`**`,
                                color: Utils_1.Colors.Success
                            });
                            return resolve(yield message.channel.send(embd));
                        })).catch((err) => __awaiter(this, void 0, void 0, function* () {
                            console.error(err);
                            var embd = new discord_js_1.default.MessageEmbed({
                                title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                color: Utils_1.Colors.Error
                            });
                            return resolve(yield message.channel.send(embd));
                        }));
                    })).catch((res) => __awaiter(this, void 0, void 0, function* () {
                        console.error(res);
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }));
                    break;
                }
                default: {
                    var embd = new discord_js_1.default.MessageEmbed({
                        title: `${Utils_1.Emojis.RedErrorCross} Subcommand not found.`,
                        description: `Command Usage: \n${this.Usage}`,
                        color: Utils_1.Colors.Error
                    });
                    return resolve(yield message.channel.send(embd));
                }
            }
        }));
    }
}
module.exports = JoinMgr;
//# sourceMappingURL=JoinMgr.js.map