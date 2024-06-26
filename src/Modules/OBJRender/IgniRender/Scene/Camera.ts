import { RenderProjection, RenderStyle } from "../IgniRender.js";
import {
    convertRangeVec2,
    getFaceCenter,
    getFaceNormal,
    getNormalColor,
    matrix4MultPoint,
    Path, v2fill, v2zero,
    v3copy,
    v3distance,
    v3dot, v3fill,
    v3mul,
    v3rotate,
    v3sub,
    v3sum,
    vec2,
    vec3
} from "../Utils3D.js";
import SceneObject from "./SceneObject.js";
import { GFXContext } from "../GFXBackend/GFXContext.js";

export default class Camera extends SceneObject{
    public planeWidth: number = 4;
    public planeHeight: number = 3;
    public renderStyle: RenderStyle = "flat";
    public projection: RenderProjection = "perspective";
    public FOV: number = 90;
    public nearClipPlane: number = 0.1;
    public farClipPlane: number = 100;

    constructor(name: string, pos: vec3, rot: vec3){
        super(name, pos, rot);
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
        out = v3rotate(out, this.rotation);
        out = v3sum(out, this.position);

        return out;
    }

    public Project(point: vec3, cords_min?: vec2, cords_max?: vec2): vec2 {
        if(this.projection === "perspective"){
            //point = v3normalize(point);

            // let s = 1 / Math.tan(this.FOV / 2 * Math.PI / 180);
            // let d = this.farClipPlane - this.nearClipPlane;
            // let fn1 = this.farClipPlane / d;
            // let fn2 = this.farClipPlane * this.nearClipPlane / d;
            //
            //
            // let mat = [
            //     [s, 0, 0,     0],
            //     [0, s, 0,     0],
            //     [0, 0, -fn1, -1],
            //     [0, 0, -fn2,  0]
            // ];


            let top, bottom, left, right;

            top = this.nearClipPlane * Math.tan((this.FOV * 0.0174533)/2);
            bottom = -top;
            right = top * this.planeHeight / this.planeWidth;
            left = -right;

            let mat = [
                [2*this.nearClipPlane/(right-left), 0, 0, -this.nearClipPlane*(right+left)/(right-left)],
                [0, 2*this.nearClipPlane/(top-bottom), 0, -this.nearClipPlane*(top+bottom)/(top-bottom)],
                [0, 0, -(this.farClipPlane+this.nearClipPlane)/(this.farClipPlane-this.nearClipPlane), 2*this.farClipPlane*this.nearClipPlane/(this.nearClipPlane-this.farClipPlane)],
                [0, 0, -1, 0]
            ]
            
            let res: vec2 = matrix4MultPoint(mat, point);

            if(cords_max && cords_min) {
                res = convertRangeVec2(res, cords_max, cords_min, v2fill(1), v2fill(0));
            }

            return res;

        //}else if(this.projection === "orthogonal"){

        }else{
            return {
                x: point.x,
                y: point.y
            }
        }
    }

    public Render(ctx: GFXContext): GFXContext {
        ctx.fillBackground("white");

        let rend_obj = this.scene.objects.filter(o => o.visible && o.id !== this.id);

        for(let obj of rend_obj){
            let prims = obj.Draw();

            // for(let p of prims){
            //     if(p.isFace()){
            //         p.vertices.sort((a, b) => v3distance(a, this.position) - v3distance(b, this.position));
            //     }else if(p.isPath()){
            //         p.points.sort((a, b) => v3distance(a, this.position) - v3distance(b, this.position));
            //     }
            // }

            let camera_pos = v3rotate(this.position, v3mul(this.rotation, v3fill(-1)));

            prims.sort((a, b) => {
                if(a.isFace() && b.isFace()){
                    return a.shortestDistance(camera_pos) - b.shortestDistance(camera_pos);
                }else{
                    return -Infinity;
                }
            });

            for(let p of prims){
                if(p.isPath()){
                    //let points = p.points.map(p => this.Project(v3sum(v3rotate(p, this.rotation), this.position)));
                    let points = p.points
                        .map(p => this.Project(this.worldToCameraSpace(p), v2zero(), {
                            x: ctx.getWidth(),
                            y: ctx.getHeight()
                        }));

                    ctx.drawPath(points, p.color);
                }else if(p.isFace()) {
                    p.center = p.center ?? getFaceCenter(p);
                    p.normal = p.normal ?? getFaceNormal(p);

                    let draw_flag = false;

                    if(this.renderStyle === "wireframe"){
                        draw_flag = true;
                    }else if(v3dot(v3sub(p.vertices[0], camera_pos), p.normal) >= 0){
                        draw_flag = true;
                    }

                    if(draw_flag){
                       // let verts_prj = p.vertices.map(p => this.Project(v3sum(v3rotate(p, this.rotation), this.position)));
                        let verts_prj = p.vertices.map(p => this.Project(this.worldToCameraSpace(p), v2zero(), {
                            x: ctx.getWidth(),
                            y: ctx.getHeight()
                        }));

                        let color: string | undefined;
                        if(this.renderStyle === "flat"){
                            let brightness = Math.floor(getNormalColor(p.normal, {
                                x: -0.5,
                                y: 0.75,
                                z: -1
                            }));
                            color = `rgb(${brightness},${brightness},${brightness})`;
                        }

                        if(verts_prj.length === 3) {
                            ctx.drawTriangle({
                                points: verts_prj as [vec2, vec2, vec2],
                                color
                            });
                        } else {
                            ctx.drawNGon(verts_prj, color);
                        }
                    }
                }
            }
        }
        return ctx;
    }
}