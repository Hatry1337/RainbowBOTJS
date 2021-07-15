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
class Placeholder {
    constructor(controller) {
        this.Name = "Placeholder";
        this.Trigger = "!test_command#";
        this.Usage = "U can't use this command, lol";
        this.Description = "This is test command for debugging. #";
        this.Category = "Dev";
        this.Controller = controller;
        var index = this.Controller.Commands.length;
        this.Name += index.toString();
        this.Trigger += index.toString();
        this.Description += index.toString();
    }
    Test(mesage) {
        return false;
    }
    Run(message) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            resolve(yield message.channel.send("Wait, what.. How do you run this command?!!"));
        }));
    }
}
module.exports = Placeholder;
//# sourceMappingURL=Placeholder.js.map