import Discord from "discord.js";
import RainbowBOT from "./RainbowBOT";
//const Database = require("./Database");
//import User from "./User";
import fs from "fs";

export class Utils {
    static getRandomInt(max: number) {
        return Math.floor(Math.random() * Math.floor(max));
    };
    
    static arrayRandElement<T>(arr: Array<T>) {
        var rand = Math.floor(Math.random() * arr.length);
        return arr[rand];
    };

    static parseID(raw_data: string) {
        raw_data = raw_data?.toString();
        if (raw_data?.startsWith("<<@")) {
            return raw_data?.split(">")[1];
        } else if (raw_data?.startsWith("<@!")) {
            raw_data = raw_data?.replace("<@!", "");
            raw_data = raw_data?.replace(">", "");
            return raw_data;
        } else if (raw_data?.startsWith("<@&")) {
            raw_data = raw_data?.replace("<@&", "");
            raw_data = raw_data?.replace(">", "");
            return raw_data;
        }else if (raw_data?.startsWith("<@")) {
            raw_data = raw_data?.replace("<@", "");
            raw_data = raw_data?.replace(">", "");
            return raw_data;
        }else if (raw_data?.startsWith("<#")) {
            raw_data = raw_data?.replace("<#", "");
            raw_data = raw_data?.replace(">", "");
            return raw_data;
        } else {
            return raw_data;
        }
    };

    static extractDashParam(text: string, param: string){
        var data;
        var p_pos = text.indexOf(`--${param} `);
        
        if(p_pos !== -1){
            var dhpos = text.indexOf(" --", p_pos + param.length + 3);
            if(dhpos !== -1){
                data = text.slice(p_pos + param.length + 3, dhpos);
            }else{
                data = text.slice(p_pos + param.length + 3);
            }
        }
        
        return data;
    }

}

export enum Emojis{
    BlueRoundedArrowRight = "<:r_blue_rounded_right_arrow:853561384070807582>",
    RedErrorCross         = "❌",
}

export enum Colors{
    Noraml  = 0x623fff,
    Success = 0x3fff6c,
    Error   = 0xff3f71,
    Warning = 0xff7a3f
}

export interface CustomMessageSettings{
    Title: string;
    Description?: string;
    Image?: string;
    Avatar?: boolean;
}
