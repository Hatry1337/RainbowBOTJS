import Discord from "discord.js";

export class Utils{
    static async ErrMsg(message: string, channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel){
        var embd = new Discord.MessageEmbed({
            title: `${Emojis.RedErrorCross} ${message}`,
            color: Colors.Error
        });
        return await channel.send(embd);
    }

    static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)    
    }
    
    static arrayRandElement<T>(arr: Array<T>) {
        var rand = Math.floor(Math.random() * arr.length);
        return arr[rand];
    }

    /**
     * Pads specified `number` to `count` zeros
     */
    static padz(count: number, number: number){
        return String(number).padStart(count, '0');
    }

    /**
     * Returns current timestamp if no date provided formatted to `%Y-%m-%d %H:%M:%S.$f`
     */
    static ts(date = new Date()){
        return `${date.getFullYear()}-${this.padz(2, date.getMonth() + 1)}-${this.padz(2, date.getDate())} ${this.padz(2, date.getHours())}:${this.padz(2, date.getMinutes())}:${this.padz(2, date.getSeconds())}.${this.padz(3, date.getMilliseconds())}`;
    }

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
    }


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

    static formatTime(s: number){
        var stime;
        var m = this.div(s, 60);
        var h = this.div(s, 60 * 60);
        var d = this.div(s, 60 * 60 * 24);

        if (s < 60) {
            stime = `${s} secs`;
        } else if (m < 60) {
            stime = `${m} mins, ${s - m * 60} secs`;
        } else if (h < 24) {
            stime = `${h} hours, ${m - h * 60} mins, ${s - m * 60} secs`;
        } else {
            stime = `${d} days, ${h - d * 24} hours, ${m - h * 60} mins, ${s - m * 60} secs`;
        }
        
        return stime;
    }

    static div(val: number, by: number){
        return (val - val % by) / by;
    }

    static parseShortTime(raw_data: string){
        raw_data = raw_data.toLowerCase();
        var secs = 0;

        var reg = /([0-9][0-9]*?)(d|h|m|s)/g;
        var match;
        while (match = reg.exec(raw_data)) {
            switch(match[2]){
                case "d":
                    secs += parseInt(match[1]) * 24 * 60 * 60;
                    break;
                case "h":
                    secs += parseInt(match[1]) * 60 * 60;
                    break;
                case "m":
                    secs += parseInt(match[1]) * 60;
                    break;
                case "s":
                    secs += parseInt(match[1]);
                    break;
            }
            reg.lastIndex -= 1;
        }
        return secs;
    }

    static secondsToDhms(seconds: number) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        return `${d}:${h}:${m}:${s}`;
    };
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