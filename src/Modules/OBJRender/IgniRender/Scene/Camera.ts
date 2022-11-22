import { RenderProjection, RenderStyle } from "../IgniRender";
import { convertRange, Face, getFaceCenter, getFaceNormal, getNormalColor, matrix4MultPoint, Path, Primitive, v2normalize, v3copy, v3distance, v3dot, v3mul, v3normalize, v3rotate, v3sub, v3sum, vec2, vec3 } from "../Utils3D";
import SceneObject from "./SceneObject";
import { Canvas, createCanvas } from 'canvas';
import { Scene } from "./Scene";

export default class Camera extends SceneObject{
    public renderResolution: {
        Width: number;
        Height: number;
    }
    public aspectRatio;
    public renderStyle: RenderStyle = "flat";
    public projection: RenderProjection = "perspective";
    public FOV: number = 40;
    public nearClipPlane: number = 0.1;
    public farClipPlane: number = 100;

    constructor(pos: vec3, rot: vec3){
        super(pos, rot);
        this.renderResolution = {
            Width: 400,
            Height: 300
        }
        this.aspectRatio = this.renderResolution.Height / this.renderResolution.Width;
        
    }

    public Draw(): Path[] {
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

    public worldToCameraSpace(point: vec3) {
        let out = v3copy(point);
        out = v3sum(out, this.position);
        out = v3rotate(point, this.rotation);

        return out;
    }

    public Project(point: vec3): vec2 {
        if(this.projection === "perspective"){
            point = v3normalize(point);

            let s = 1 / Math.tan(this.FOV / 2 * Math.PI / 180);
            let d = this.farClipPlane - this.nearClipPlane;
            let fn1 = this.farClipPlane / d;
            let fn2 = this.farClipPlane * this.nearClipPlane / d;

            let mat = [
                [s, 0, 0,     0], 
                [0, s, 0,     0],
                [0, 0, -fn1, -1],
                [0, 0, -fn2,  0]
            ];
            
            let res = matrix4MultPoint(mat, point);

            return res;

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

        let rend_obj = this.scene.objects.filter(o => o.visible && o.id !== this.id);

        for(let obj of rend_obj){
            let prims = obj.Draw();
            
            /*
            for(let p of prims){
                if(p.isFace()){
                    p.vertices.sort((a, b) => v3distance(a, this.position) - v3distance(b, this.position));
                }else if(p.isPath()){
                    p.points.sort((a, b) => v3distance(a, this.position) - v3distance(b, this.position));
                }
            }
            */

            prims.sort((a, b) => {
                if(a.isFace() && b.isFace()){
                    return v3distance(a.getCenter(true), this.position) - v3distance(b.getCenter(true), this.position);
                }else{
                    return -Infinity;
                }
            });

            for(let p of prims){
                if(p.isPath()){
                    if(p.color){
                        ctx.strokeStyle = p.color;
                    }

                    //let points = p.points.map(p => this.Project(v3sum(v3rotate(p, this.rotation), this.position)));
                    let points = p.points.map(p => this.Project(this.worldToCameraSpace(p)));
                    
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
                }else if(p.isFace()) {
                    p.center = p.center ? p.center : getFaceCenter(p);
                    p.normal = p.normal ? p.normal : getFaceNormal(p);

                    let draw_flag = false;

                    if(this.renderStyle === "wireframe"){
                        draw_flag = true;
                    }else if(v3dot(p.normal, v3sub(p.center, v3rotate(this.position, v3mul(this.rotation, { x: -1, y: -1, z: -1})))) > 0){
                        draw_flag = true;
                    }

                    if(draw_flag){
                       // let verts_prj = p.vertices.map(p => this.Project(v3sum(v3rotate(p, this.rotation), this.position)));
                        let verts_prj = p.vertices.map(p => this.Project(this.worldToCameraSpace(p)));
                       
                        ctx.beginPath();
                        
                        if(this.renderStyle === "flat"){
                            let color = Math.floor(getNormalColor(p.normal));
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