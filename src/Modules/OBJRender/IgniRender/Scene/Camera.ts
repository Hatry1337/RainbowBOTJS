import IgniRender, { RenderProjection, RenderStyle } from "../IgniRender";
import { vec3 } from "../Utils3D";
import SceneObject from "./SceneObject";
import { Canvas, createCanvas } from 'canvas';

export default class Camera extends SceneObject{
    public FocalLength: number;
    public Width: number;
    public Height: number;
    public RenderResolution: {
        Width: number;
        Height: number;
    }
    public RenderStyle: RenderStyle = "flat";
    public Projection: RenderProjection = "perspective";

    constructor(pos: vec3, rot: vec3, renderrer: IgniRender){
        super(pos, rot, renderrer);
        this.FocalLength = 1;
        this.Width = 2;
        this.Height = 1.5;
        this.RenderResolution = {
            Width: 400,
            Height: 300
        }
    }

    public Render(): Canvas {
        this.Renderrer.PrepareScene(this.Position, this.Rotation);
        return this.Renderrer.Render(
            this.RenderResolution.Width, 
            this.RenderResolution.Height, 
            this.FocalLength, 
            this.Position, 
            this.Rotation, 
            { x: this.Width, y: this.Height },
            this.RenderStyle,
            this.Projection
        );
    }
}