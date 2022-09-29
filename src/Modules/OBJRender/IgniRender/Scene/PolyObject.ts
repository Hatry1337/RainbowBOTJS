import { Face, getFaceCenter, getFaceNormal, PFace, v3mul, v3normalize, v3rotate, v3sum, v3zero, vec3, Vertex } from "../Utils3D";
import { Scene } from "./Scene";
import SceneObject from "./SceneObject";

export default class PolyObject extends SceneObject{
    public calculatedMesh: PFace[] = [];
    public size: vec3 = { x: 1, y: 1, z: 1};
    constructor(scene: Scene, pos: vec3, rot: vec3, public originalMesh: PFace[]){
        super(scene, pos, rot);
    }

    public SetSize(size: vec3){
        this.size = size;
        this.stateChanged = true;
    }

    public Draw(){
        if(!this.stateChanged) return this.calculatedMesh;

        let transform: PFace[] = [];
        for(let f of this.originalMesh){
            let verts: Vertex[] = [];
            for(let v of f.vertices){
                verts.push(v3sum(v3rotate(v3mul(v3normalize(v), this.size), this.rotation), this.position));
            }
            let f_new: PFace = {
                type: "face",
                vertices: verts,
                color: f.color,
            }
            f_new.center = getFaceCenter(f_new);
            f_new.normal = getFaceNormal(f_new);
            f_new.bounds = v3zero();
            for(let v of f_new.vertices){
                if(v.x > f_new.bounds.x){
                    f_new.bounds.x = v.x;
                }
                if(v.y > f_new.bounds.y){
                    f_new.bounds.y = v.y;
                }
                if(v.z > f_new.bounds.z){
                    f_new.bounds.z = v.z;
                }
            }

            transform.push(f_new);
        }
        this.calculatedMesh = transform;
        this.stateChanged = false;
        return transform;
    }

    public RecalculateNormals(){
        for(let f of this.calculatedMesh){
            f.center = getFaceCenter(f);
            f.normal = getFaceNormal(f);
        }
    }
}