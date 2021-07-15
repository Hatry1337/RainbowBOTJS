"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = exports.Emojis = exports.Utils = void 0;
class Utils {
    static getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    ;
    static arrayRandElement(arr) {
        var rand = Math.floor(Math.random() * arr.length);
        return arr[rand];
    }
    ;
    static parseID(raw_data) {
        raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.toString();
        if (raw_data === null || raw_data === void 0 ? void 0 : raw_data.startsWith("<<@")) {
            return raw_data === null || raw_data === void 0 ? void 0 : raw_data.split(">")[1];
        }
        else if (raw_data === null || raw_data === void 0 ? void 0 : raw_data.startsWith("<@!")) {
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace("<@!", "");
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace(">", "");
            return raw_data;
        }
        else if (raw_data === null || raw_data === void 0 ? void 0 : raw_data.startsWith("<@&")) {
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace("<@&", "");
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace(">", "");
            return raw_data;
        }
        else if (raw_data === null || raw_data === void 0 ? void 0 : raw_data.startsWith("<@")) {
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace("<@", "");
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace(">", "");
            return raw_data;
        }
        else if (raw_data === null || raw_data === void 0 ? void 0 : raw_data.startsWith("<#")) {
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace("<#", "");
            raw_data = raw_data === null || raw_data === void 0 ? void 0 : raw_data.replace(">", "");
            return raw_data;
        }
        else {
            return raw_data;
        }
    }
    ;
    static extractDashParam(text, param) {
        var data;
        var p_pos = text.indexOf(`--${param} `);
        if (p_pos !== -1) {
            var dhpos = text.indexOf(" --", p_pos + param.length + 3);
            if (dhpos !== -1) {
                data = text.slice(p_pos + param.length + 3, dhpos);
            }
            else {
                data = text.slice(p_pos + param.length + 3);
            }
        }
        return data;
    }
}
exports.Utils = Utils;
var Emojis;
(function (Emojis) {
    Emojis["BlueRoundedArrowRight"] = "<:r_blue_rounded_right_arrow:853561384070807582>";
    Emojis["RedErrorCross"] = "\u274C";
})(Emojis = exports.Emojis || (exports.Emojis = {}));
var Colors;
(function (Colors) {
    Colors[Colors["Noraml"] = 6438911] = "Noraml";
    Colors[Colors["Success"] = 4194156] = "Success";
    Colors[Colors["Error"] = 16727921] = "Error";
    Colors[Colors["Warning"] = 16742975] = "Warning";
})(Colors = exports.Colors || (exports.Colors = {}));
//# sourceMappingURL=Utils.js.map