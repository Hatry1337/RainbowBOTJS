import { Canvas } from "canvas";

type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K; }[keyof T];
export type ExcludeMethods<T> = Pick<T, NonFunctionPropertyNames<T>>;

export enum CEmojis{
    PointCoin="<:pointcoin:979098338462941254>"
}

export default class RainbowBOTUtils{
    public static numReadable(num: number | string){
        if(typeof num === "number") num = num.toString();
        return num.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
    }

    public static splitTextToLines(canvas: Canvas, text: string, max_width: number){
        let ctx = canvas.getContext("2d");
        let lines: string[] = [];
        let pre_lines = text.split("\n");
        for(let l of pre_lines){
            let words = l.split(" ");
            while(words.length > 0){
                let currnet_line = "";
                let word: string | undefined;

                while((word = words.shift()) && ctx.measureText(currnet_line + word + " ").width < max_width){
                    currnet_line += word + " ";
                }

                if(word && ctx.measureText(word).width > max_width){
                    if(currnet_line !== "" && currnet_line !== " "){
                        lines.push(currnet_line);
                    }
                    lines.push(word);
                    continue;
                }

                if(word){
                    words.unshift(word);
                }
                if(currnet_line !== "" && currnet_line !== " "){
                    lines.push(currnet_line);
                }
            }
        }
        return lines;
    }
}