import { Canvas } from "canvas";


export default class RainbowBOTUtils{
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