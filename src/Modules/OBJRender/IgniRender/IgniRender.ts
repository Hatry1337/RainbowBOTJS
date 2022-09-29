import { Canvas, createCanvas } from "canvas";
import PolyObject from "./Scene/PolyObject";
import SceneObject from "./Scene/SceneObject";
import { Vertex, Face, v3sub, vec3, v3rotate, vec2, v3normalize, v3dot, v3sum, v3distance, getFaceCenter, getFaceNormal, v3zero } from "./Utils3D";

export type RenderStyle = "flat" | "wireframe";
export type RenderProjection = "none" | "perspective";

export default class IgniRender{
    public Scene: SceneObject[] = [];
    private Faces: Face[] = [];

    public PrepareScene(cam_pos: vec3, cam_rot: vec3){
        this.Faces = [];
        for(let obj of this.Scene.filter(o => o instanceof PolyObject) as PolyObject[]){
            obj.CalculateMesh();
            for(let f of obj.calculatedMesh){
                let face: Face = {
                    vertices: [],
                    color: 0xFFFFFF
                }
                for(let v of f.vertices){
                    let vert = v3sum(v3rotate(v, cam_rot), cam_pos);
                    face.vertices.push(vert);
                }
                face.center = getFaceCenter(face);
                face.normal = getFaceNormal(face);
                if(v3dot(face.normal, v3sub(f.vertices[0], cam_pos)) > 0){
                    this.Faces.push(face);
                }
            }
        }

        let fcs = [];

        for(let f of this.Faces){
            let nearest = v3distance(cam_pos, f.vertices[0]);
            for(let v of f.vertices){
                let dist = v3distance(cam_pos, v);
                if(dist < nearest){
                    nearest = dist;
                }
            }
            fcs.push({
                distance: nearest,
                face: f
            });
        }
        console.log(fcs);
        fcs.sort((a, b) => b.distance - a.distance);
        this.Faces = [];
        for(let f of fcs){
            this.Faces.push(f.face);
        }
    }

    public Render(rwidth: number, rheight: number, focal: number, cam_pos: vec3, cam_rot: vec3, cam_size: vec2, style: RenderStyle, projection: RenderProjection): Canvas {
        let canvas = createCanvas(rwidth, rheight);
        let ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "black";

        this.PrepareScene(cam_pos, cam_rot);
        for(let f of this.Faces){
            ctx.beginPath();
            
            if(style === "flat"){
                let color = Math.floor(this.getNormalColor(f.normal || getFaceNormal(f)));
                ctx.fillStyle = `rgb(${color},${color},${color})`;
            }

            let cord: vec2;
            if(projection === "perspective"){
                cord = this.translateToPerspective(f.vertices[0], focal, cam_size);
            }else{
                cord = {
                    x: f.vertices[0].x,
                    y: f.vertices[0].y
                }
            }
            ctx.moveTo(this.convert(cord.x, rwidth, 0, 1, -1), this.convert(cord.y, rheight, 0, 1, -1));
            for(let v of f.vertices.slice(1)){
                if(projection === "perspective"){
                    cord = this.translateToPerspective(v, focal, cam_size);
                }else{
                    cord = {
                        x: v.x,
                        y: v.y
                    }
                }
                ctx.lineTo(this.convert(cord.x, rwidth, 0, 1, -1), this.convert(cord.y, rheight, 0, 1, -1));
            }
            if(style === "flat"){
                ctx.fill();
            }else{
                ctx.stroke();
            }
            ctx.closePath();
        }
        return canvas;
    }

    private convert(x: number, n_max: number, n_min: number, o_max: number, o_min: number){
        let n_rng = n_max - n_min;
        let o_rng = o_max - o_min;
        return (((x - o_min) * n_rng) / o_rng) + n_min;
    }

    private translateToPerspective(ver: Vertex, focal: number, cam_size: vec2): vec2{
        let { x, y, z } = ver;

        let px = focal * x / (z + focal);
        let py = focal * y / (z + focal);
        return { x: px * cam_size.x, y: py * cam_size.y };
    }

    

    /*
    private checkNormals()
    {
        let testVector: vec3 = {
            x: 0,
            y: 0,
            z: 0
        }
        let result = 0;
        for(let f of this.faces)
        {
            testVector.x += f.center.x;
            testVector.y += f.center.y;
            testVector.z += f.center.z;

            result += f.normal.x * f.center.x - (testVector.x / this.faces.length);
            result += f.normal.y * f.center.y - (testVector.y / this.faces.length);
            result += f.normal.z * f.center.z - (testVector.z / this.faces.length);

            if(result < 0){
                f.normal.x *= -1;
                f.normal.y *= -1;
                f.normal.z *= -1;
            }
            result = 0;
            testVector = {
                x: 0,
                y: 0,
                z: 0
            }
        }
    }
    */

    private getNormalColor(normal: vec3){
        let v1: vec3 = {
            x: -0.5,
            y: 0.75,
            z: -1
        }
        let cf = v3dot(v1, v3normalize(normal));
        return 255 * ((cf+3)/6);
    }

    public LoadOBJModel(model: string){
        let raw_model = model;
        let vertices: Vertex[] = [];
        let vert_normals: vec3[] = [];
        let vert_textures: vec3[] = [];
        let faces: Face[] = [];

        const vert_regex = /\s*(-?[0-9]*\.[0-9]*)\s*(-?[0-9]*\.[0-9]*)\s*(-?[0-9]*\.[0-9]*)\s*(-?[0-9]*\.[0-9]*)?/;
        const face_regex = /\s*([0-9]*)?\/([0-9]*)?\/?([0-9]*)?/g

        let lines = raw_model.split("\n");
        for(let l of lines){
            if(l.startsWith("#")) continue;
            if(l.startsWith("v ")){
                vert_regex.lastIndex = 0;
                let match = vert_regex.exec(l);
                if(match && match.length >= 3){
                    let vrt = {
                        x: parseFloat(match[1]),
                        y: parseFloat(match[2]),
                        z: parseFloat(match[3]),
                        w: match[4] ? parseFloat(match[4]) : undefined
                    }
                    vertices.push(vrt);
                }
            }else if(l.startsWith("vn ")){
                vert_regex.lastIndex = 0;
                let match = vert_regex.exec(l);
                if(match && match.length >= 3){
                    let vrt = {
                        x: parseFloat(match[1]),
                        y: parseFloat(match[2]),
                        z: parseFloat(match[3]),
                    }
                    vert_normals.push(vrt);
                }
            }else if(l.startsWith("vt ")){
                vert_regex.lastIndex = 0;
                let match = vert_regex.exec(l);
                if(match && match.length >= 3){
                    let vrt = {
                        x: parseFloat(match[1]),
                        y: parseFloat(match[2]),
                        z: parseFloat(match[3]),
                    }
                    vert_textures.push(vrt);
                }
            }else if(l.startsWith("f")){
                face_regex.lastIndex = 0;
                if(face_regex.test(l)){
                    face_regex.lastIndex = 0;
                    let face: Face = {
                        vertices: [],
                        color: 0xFFFFFF
                    }
                    let match;
                    while(match = face_regex.exec(l)){
                        let i_v = parseInt(match[1]);
                        let i_vt = parseInt(match[2]);
                        let i_vn = parseInt(match[3]);

                        match[1] ? face.vertices.push(vertices[i_v-1]) : 0;
                        //match[2] ? this.vertex_textures.push(this.i_vt-1)) : 0;
                        //match[3] ? this.normal_vertices.push(i_vn-1)) : 0;
                        faces.push(face);
                    }
                }else{
                    let face: Face = {
                        vertices: [],
                        normal: { x: 0, y: 0, z: 0 },
                        center: { x: 0, y: 0, z: 0 },
                        color: 0xFFFFFF
                    }
                    let vs = l.split(" ").slice(1);
                    for(let v of vs){
                        face.vertices.push(vertices[parseInt(v)-1]);
                    }
                    faces.push(face);
                }
            }
        }
        return new PolyObject(v3zero(), v3zero(), this, faces);
    }
}