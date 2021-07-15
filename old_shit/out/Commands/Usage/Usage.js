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
class Usage {
    constructor(controller) {
        this.Name = "Usage";
        this.Trigger = "!usage";
        this.Usage = "`!usage <command>`\n\n" +
            "**Examples:**\n" +
            "`!usage !help` - Shows usage of \`!help\` command.\n\n";
        this.Description = "Using this command users can view detailed usage information about specified command.";
        this.Category = "Info";
        this.Controller = controller;
    }
    Test(mesage) {
        return mesage.content.toLowerCase().startsWith("!usage");
    }
    Run(message) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var args = message.content.split(" ").slice(1);
            if (args[0]) {
                var cmd = this.Controller.Commands.find(c => c.Trigger.toLowerCase() === args[0].toLowerCase() || c.Name.toLowerCase() === args[0].toLowerCase());
                if (cmd) {
                    var embd = new discord_js_1.default.MessageEmbed({
                        title: `Usage of \`${cmd === null || cmd === void 0 ? void 0 : cmd.Trigger}\` command:`,
                        description: cmd === null || cmd === void 0 ? void 0 : cmd.Usage,
                        color: Utils_1.Colors.Noraml
                    });
                    return resolve(yield message.channel.send(embd));
                }
                else {
                    var embd = new discord_js_1.default.MessageEmbed({
                        title: `${Utils_1.Emojis.RedErrorCross} This command doesen't exist.`,
                        color: Utils_1.Colors.Error
                    });
                    return resolve(yield message.channel.send(embd));
                }
            }
            else {
                var embd = new discord_js_1.default.MessageEmbed({
                    title: `${Utils_1.Emojis.RedErrorCross} No command specified.`,
                    description: `Command Usage: \n${this.Usage}`,
                    color: Utils_1.Colors.Error
                });
                return resolve(yield message.channel.send(embd));
            }
        }));
    }
}
module.exports = Usage;
//# sourceMappingURL=Usage.js.map