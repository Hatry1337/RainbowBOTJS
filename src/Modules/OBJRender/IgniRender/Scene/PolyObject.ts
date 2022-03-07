import IgniRender from "../IgniRender";
import { Face, getFaceCenter, getFaceNormal, v3rotate, v3sum, v3zero, vec3, Vertex } from "../Utils3D";
import SceneObject from "./SceneObject";

export default class PolyObject extends SceneObject{
    public Faces: Face[] = [];
    constructor(pos: vec3, rot: vec3, renderrer: IgniRender, faces: Face[]){
        super(pos, rot, renderrer);
        this.Faces = faces;
    }

    public CalcTransfom(){
        let transform: Face[] = [];
        for(let f of this.Faces){
            let verts: Vertex[] = [];
            for(let v of f.vertices){
                verts.push(v3sum(v3rotate(v, this.Rotation), this.Position));
            }
            let f_new: Face = {
                vertices: verts,
                color: f.color,
            }
            f_new.center = getFaceCenter(f_new);
            f_new.normal = getFaceNormal(f_new);
            transform.push(f_new);
        }
        return transform;
    }

    public CalcFacesBounds(){
        for(let f of this.Faces){
            f.bounds = v3zero();

            for(let v of f.vertices){
                if(v.x > f.bounds.x){
                    f.bounds.x = v.x;
                }
                if(v.y > f.bounds.y){
                    f.bounds.y = v.y;
                }
                if(v.z > f.bounds.z){
                    f.bounds.z = v.z;
                }
            }
        }
    }

    public CalcNormals(){
        for(let f of this.Faces){
            f.center = getFaceCenter(f);
            f.normal = getFaceNormal(f);
        }
    }
}