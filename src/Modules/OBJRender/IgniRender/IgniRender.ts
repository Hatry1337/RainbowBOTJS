import PolyObject from "./Scene/PolyObject.js";
import { Vertex, Face, vec3, v3zero } from "./Utils3D.js";

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

    public static LoadOBJModel(name: string, model: string, reference?: string){
        let vertices: Vertex[] = [];
        let vert_normals: vec3[] = [];
        let vert_textures: vec3[] = [];

        let lines = model.split("\n");
        for(let l of lines){
            if(l.startsWith("#")) continue;
            if(l.startsWith("v ")){
                let values = l.split(" ").slice(1);
                let vrt = {
                    x: parseFloat(values[0]),
                    y: parseFloat(values[1]),
                    z: parseFloat(values[2]),
                    w: values[3] ? parseFloat(values[3]) : undefined
                }
                vertices.push(vrt);
            }else if(l.startsWith("vn ")){
                let values = l.split(" ").slice(1);
                let vrt = {
                    x: parseFloat(values[0]),
                    y: parseFloat(values[1]),
                    z: parseFloat(values[2]),
                    w: values[3] ? parseFloat(values[3]) : undefined
                }
                vert_normals.push(vrt);
            }else if(l.startsWith("vt ")){
                let values = l.split(" ").slice(1);
                let vrt = {
                    x: parseFloat(values[0]),
                    y: parseFloat(values[1]),
                    z: parseFloat(values[2]),
                    w: values[3] ? parseFloat(values[3]) : undefined
                }
                vert_textures.push(vrt);
            }
        }

        let faces: Face[] = [];

        for(let l of lines.filter(l => l.startsWith("f "))){
            let values = l.split(" ").slice(1);
            let face = new Face();
            for(let v of values){
                let crd = v.split("/").map(n => parseInt(n));
                face.vertices.push(vertices[crd[0] - 1]);
            }
            faces.push(face);
        }
        return new PolyObject(name, v3zero(), v3zero(), faces, reference);
    }

    public static ExportOBJ(model: PolyObject, original: boolean = true){
        let faces = original ? model.originalMesh : model.Draw();
        let vertices: Vertex[] = [];

        let fvs: number[][] = [];
        for(let f of faces) {
            let ff = [];
            for(let v of f.vertices){
                vertices.push(v);
                ff.push(vertices.length);
            }
            fvs.push(ff);
        }

        let obj = "#RainbowBOT's IgniRender OBJ Export " + new Date().toLocaleString() + "\n";

        for(let v of vertices){
            obj += "v " + v.x + " " + v.y + " " + v.z + (v.w ? (" " + v.w) : "") + "\n";
        }

        for(let f of fvs){
            obj += "f " + f.join(" ") + "\n";
        }

        return obj;
    }
}