import { RenderProjection, RenderStyle } from "../IgniRender";
import { convertRange, Face, getFaceCenter, getFaceNormal, getNormalColor, matrixDot, PFace, PPath, v2normalize, v3dot, v3normalize, v3rotate, v3sub, v3sum, vec2, vec3, Vertex } from "../Utils3D";
import SceneObject from "./SceneObject";
import { Canvas, createCanvas } from 'canvas';
import { Scene } from "./Scene";
import { all, create } from "mathjs";

const math = create(all);

export default class Camera extends SceneObject{
    public focalLength: number;
    public renderResolution: {
        Width: number;
        Height: number;
    }
    public aspectRatio;
    public renderStyle: RenderStyle = "flat";
    public projection: RenderProjection = "perspective";
    public FOV: number = 30;
    public nearClipPlane: number = 1;
    public farClipPlane: number = 2;

    constructor(scene: Scene, pos: vec3, rot: vec3){
        super(scene, pos, rot);
        this.focalLength = 1;
        this.renderResolution = {
            Width: 400,
            Height: 300
        }
        this.aspectRatio = this.renderResolution.Height / this.renderResolution.Width;
        
    }

    public Draw(): PPath[] {
        /*
        let cam: PPath[] = [
            {
                type: "path",
                points: [
                    {
                        x: this.position.x - this.width / 2,
                        y: this.position.y + this.height / 2,
                        z: this.position.z
                    },
                    {
                        x: this.position.x + this.width / 2,
                        y: this.position.y + this.height / 2,
                        z: this.position.z
                    },
                    {
                        x: this.position.x + this.width / 2,
                        y: this.position.y - this.height / 2,
                        z: this.position.z
                    },
                    {
                        x: this.position.x - this.width / 2,
                        y: this.position.y - this.height / 2,
                        z: this.position.z
                    },
                    {
                        x: this.position.x - this.width / 2,
                        y: this.position.y + this.height / 2,
                        z: this.position.z
                    },
                ]
            },
            {
                type: "path",
                points: [
                    {
                        x: this.position.x - this.width / 2,
                        y: this.position.y - this.height / 2,
                        z: this.position.z
                    },
                    {
                        x: this.position.x,
                        y: this.position.y,
                        z: this.position.z
                    },
                    {
                        x: this.position.x - this.width / 2,
                        y: this.position.y + this.height / 2,
                        z: this.position.z
                    },
                ]
            },
            {
                type: "path",
                points: [
                    {
                        x: this.position.x + this.width / 2,
                        y: this.position.y + this.height / 2,
                        z: this.position.z
                    },
                    {
                        x: this.position.x,
                        y: this.position.y,
                        z: this.position.z
                    },
                    {
                        x: this.position.x + this.width / 2,
                        y: this.position.y - this.height / 2,
                        z: this.position.z
                    },
                ]
            }
        ];
        /*
        for(let p of cam){
            p.points = p.points.map(p => v3normalize(p));
        }
        */
        //return cam;
        return [];
    }

    public Project(point: vec3): vec2 {
        if(this.projection === "perspective"){
            point = v3normalize(point);

            let proj_mx = math.matrix([
                [math.cot(this.FOV / this.aspectRatio), 0, 0, 0], 
                [0, math.cot(this.FOV / 2), 0, 0],
                [0, 0, this.farClipPlane / this.farClipPlane - this.nearClipPlane, 1],
                [0, 0, -((this.farClipPlane * this.nearClipPlane) / (this.farClipPlane - this.nearClipPlane)), 0]
            ]);

            let point_mx = math.matrix([point.x, point.y, point.z, 1]);

            let res = math.multiply(proj_mx, point_mx);

            /*
            let { x, y, z } = point;
            let px = this.focalLength * x / (z + this.focalLength);
            let py = this.focalLength * y / (z + this.focalLength);
            */
            return { 
                x: res.get([0]),
                y: res.get([1])
            };

        //}else if(this.projection === "orthogonal"){

        }else{
            return {
                x: point.x,
                y: point.y
            }
        }
    }

    public Render(): Canvas {
        let canvas = createCanvas(this.renderResolution.Width, this.renderResolution.Height);
        let ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "black";

        let faces: Face[] = [];
        for(let obj of this.scene.objects.filter(o => o.visible && o.id !== this.id)){
            let prims = obj.Draw();
            
            for(let p of prims){
                if(p.type === "path"){
                    let path = p as PPath;

                    if(path.color){
                        ctx.strokeStyle = path.color;
                    }

                    let points = path.points.map(p => this.Project(v3sum(v3rotate(p, this.rotation), this.position)));
                    ctx.beginPath();
                    ctx.moveTo( convertRange(points[0].x, this.renderResolution.Width, 0, 1, -1), 
                                convertRange(points[0].y, this.renderResolution.Height, 0, 1, -1));
                    for(let i = 1; i < points.length; i++){
                        ctx.lineTo( convertRange(points[i].x, this.renderResolution.Width, 0, 1, -1), 
                                    convertRange(points[i].y, this.renderResolution.Height, 0, 1, -1));
                    }
                    ctx.stroke();
                    ctx.closePath();
                    ctx.strokeStyle = "black";
                }else if(p.type === "face") {
                    let face = p as PFace;
                    face.center = face.center ? face.center : getFaceCenter(face);
                    face.normal = face.normal ? face.normal : getFaceNormal(face);

                    if(v3dot(face.normal, v3sub(face.center, this.position)) > 0){
                        let verts_prj = face.vertices.map(p => this.Project(v3sum(v3rotate(p, this.rotation), this.position)));
                       
                        ctx.beginPath();
                        
                        if(this.renderStyle === "flat"){
                            let color = Math.floor(getNormalColor(face.normal));
                            ctx.fillStyle = `rgb(${color},${color},${color})`;
                        }

                        ctx.moveTo( convertRange(verts_prj[0].x, this.renderResolution.Width, 0, 1, -1), 
                                    convertRange(verts_prj[0].y, this.renderResolution.Height, 0, 1, -1));
                        for(let i = 1; i < verts_prj.length; i++){
                            ctx.lineTo( convertRange(verts_prj[i].x, this.renderResolution.Width, 0, 1, -1), 
                                        convertRange(verts_prj[i].y, this.renderResolution.Height, 0, 1, -1));
                        }
                        if(this.renderStyle === "flat"){
                            ctx.fill();
                        }else{
                            ctx.stroke();
                        }
                        ctx.closePath();
                    }
                }
            }
        }
        return canvas;
    }
}