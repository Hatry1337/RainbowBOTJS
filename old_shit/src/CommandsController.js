"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/*============Commands Import===============*/
const JoinMgr_1 = __importDefault(require("./Commands/JoinMgr/JoinMgr"));
const Help_1 = __importDefault(require("./Commands/Help/Help"));
const Usage_1 = __importDefault(require("./Commands/Usage/Usage"));
/*==========================================*/
class CommandsController {
    constructor() {
        this.Commands = [];
        this.Commands.push(new JoinMgr_1.default(this));
        this.Commands.push(new Help_1.default(this));
        this.Commands.push(new Usage_1.default(this));
    }
    IsCommandExist(message) {
        for (var cmd of this.Commands) {
            if (cmd.Test(message)) {
                return true;
            }
        }
    }
    FindCommand(message) {
        for (var cmd of this.Commands) {
            if (cmd.Test(message)) {
                return cmd;
            }
        }
    }
    FindAndRun(message) {
        return new Promise((resolve, reject) => {
            for (var cmd of this.Commands) {
                if (cmd.Test(message)) {
                    return cmd.Run(message).then(resolve).catch(reject);
                }
            }
            resolve(message);
        });
    }
}
module.exports = CommandsController;
//# sourceMappingURL=CommandsController.js.map