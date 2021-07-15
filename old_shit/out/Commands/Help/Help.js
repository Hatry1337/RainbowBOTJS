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
const Utils_1 = require("../../Utils");
class Help {
    constructor(controller) {
        this.Name = "Help";
        this.Trigger = "!help";
        this.Usage = "`!help [<page> <category>] `\n\n" +
            "**Examples:**\n" +
            "`!help` - Shows first page of help menu.\n\n" +
            "`!help 2` - Shows second page of help menu.\n\n" +
            "`!help 1 Info` - Shows first page of \`Info\` category commands.\n\n";
        this.Description = "Using this command users can explore bot's commands, and find out how to use them.";
        this.Category = "Info";
        this.Controller = controller;
    }
    Test(mesage) {
        return mesage.content.toLowerCase().startsWith("!help");
    }
    Run(message) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var args = message.content.split(" ").slice(1);
            var page = parseInt(args[0]) || 1;
            var cat = args[1];
            if (!cat) {
                var max_page = Math.ceil(this.Controller.Commands.length / 25);
                if (page > 0 && page <= max_page) {
                    var embd = new discord_js_1.default.MessageEmbed({
                        title: `RainbowBOT's Commands \`${page}/${max_page}\``,
                        description: "You can watch detailed usage of command by `!usage <command>`",
                        color: Utils_1.Colors.Noraml
                    });
                    var page_start = ((page - 1) * 25);
                    var page_end = page_start + 25;
                    if (this.Controller.Commands.length < page_end) {
                        page_end = this.Controller.Commands.length;
                    }
                    for (var i = page_start; i < page_end; i++) {
                        var cmd = this.Controller.Commands[i];
                        embd.addField(cmd.Trigger, cmd.Description + `\n\`Category: ${cmd.Category}\``, true);
                    }
                    return resolve(yield message.channel.send(embd));
                }
                else {
                    var embd = new discord_js_1.default.MessageEmbed({
                        title: `${Utils_1.Emojis.RedErrorCross} This page doesen't exist.`,
                        color: Utils_1.Colors.Error
                    });
                    return resolve(yield message.channel.send(embd));
                }
            }
            else {
                var cmds = this.Controller.Commands.filter(c => c.Category.toLowerCase() === cat.toLowerCase());
                var max_page = Math.ceil(cmds.length / 25);
                if (cmds.length > 0) {
                    if (page > 0 && page <= max_page) {
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `RainbowBOT's \`${cat}\` Commands \`${page}/${Math.ceil(max_page)}\``,
                            description: "You can watch detailed usage of command by `!usage <command>`",
                            color: Utils_1.Colors.Noraml
                        });
                        var page_start = ((page - 1) * 25);
                        var page_end = page_start + 25;
                        if (cmds.length < page_end) {
                            page_end = cmds.length;
                        }
                        for (var i = page_start; i < page_end; i++) {
                            var cmd = cmds[i];
                            embd.addField(cmd.Trigger, cmd.Description + `\n\`Category: ${cmd.Category}\``, true);
                        }
                        return resolve(yield message.channel.send(embd));
                    }
                    else {
                        var embd = new discord_js_1.default.MessageEmbed({
                            title: `${Utils_1.Emojis.RedErrorCross} This page doesen't exist.`,
                            color: Utils_1.Colors.Error
                        });
                        return resolve(yield message.channel.send(embd));
                    }
                }
                else {
                    var embd = new discord_js_1.default.MessageEmbed({
                        title: `${Utils_1.Emojis.RedErrorCross} Commands with this category not found.`,
                        color: Utils_1.Colors.Error
                    });
                    return resolve(yield message.channel.send(embd));
                }
            }
        }));
    }
}
module.exports = Help;
//# sourceMappingURL=Help.js.map