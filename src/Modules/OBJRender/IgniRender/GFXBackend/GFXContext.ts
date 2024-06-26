import { Point2D, Triangle2D } from "./Structures.js";

export abstract class GFXContext {
    public abstract getHeight(): number;
    public abstract getWidth(): number;

    public abstract drawTriangle(triangle: Triangle2D): GFXContext;
    public abstract drawNGon(points: Point2D[], color?: string): GFXContext;
    public abstract drawPath(points: Point2D[], color?: string): GFXContext;
    public abstract fillBackground(color: string): GFXContext;
}