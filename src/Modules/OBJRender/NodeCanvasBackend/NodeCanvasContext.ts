import { GFXContext } from "../IgniRender/GFXBackend/GFXContext";
import { Triangle2D, Point2D } from "../IgniRender/GFXBackend/Structures";
import { Canvas, createCanvas } from "@napi-rs/canvas";

export class NodeCanvasContext extends GFXContext {
    public canvas: Canvas;
    constructor(public width: number, public height: number) {
        super();
        this.canvas = createCanvas(width, height);
    }

    public getHeight(): number {
        return this.height;
    }
    public getWidth(): number {
        return this.width;
    }
    public drawTriangle(triangle: Triangle2D): GFXContext {
        return this.drawNGon(triangle.points, triangle.color);
    }
    public drawNGon(points: Point2D[], color?: string | undefined): GFXContext {
        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = color ?? "black";

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++){
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.fill();
        return this;
    }
    public drawPath(points: Point2D[], color?: string | undefined): GFXContext {
        let ctx = this.canvas.getContext("2d");
        ctx.strokeStyle = color ?? "black";

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++){
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.closePath();
        return this;
    }
    public fillBackground(color: string): GFXContext {
        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(0,0, this.width, this.height);
        return this;
    }
}