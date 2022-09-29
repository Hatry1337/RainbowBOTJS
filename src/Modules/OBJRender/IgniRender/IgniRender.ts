import { Canvas, createCanvas } from "canvas";
import PolyObject from "./Scene/PolyObject";
import { Scene } from "./Scene/Scene";
import SceneObject from "./Scene/SceneObject";
import { Vertex, Face, v3sub, vec3, v3rotate, vec2, v3normalize, v3dot, v3sum, v3distance, getFaceCenter, getFaceNormal, v3zero, PFace } from "./Utils3D";

export type RenderStyle = "flat" | "wireframe";
export type RenderProjection = "none" | "perspective" | "orthogonal";

export default class IgniRender{
    
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

    public static LoadOBJModel(scene: Scene, model: string){
        let raw_model = model;
        let vertices: Vertex[] = [];
        let vert_normals: vec3[] = [];
        let vert_textures: vec3[] = [];
        let faces: PFace[] = [];

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
                    let face: PFace = {
                        type: "face",
                        vertices: [],
                        color: 0xFFFFFF
                    }
                    let match;
                    while(match = face_regex.exec(l)){
                        let i_v = parseInt(match[1]);
                        let i_vt = parseInt(match[2]);
                        let i_vn = parseInt(match[3]);

                        match[1] ? face.vertices.push(v3normalize(vertices[i_v-1])) : 0;
                        //match[2] ? this.vertex_textures.push(this.i_vt-1)) : 0;
                        //match[3] ? this.normal_vertices.push(i_vn-1)) : 0;
                        faces.push(face);
                    }
                }else{
                    let face: PFace = {
                        type: "face",
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
        return new PolyObject(scene, v3zero(), v3zero(), faces);
    }
}