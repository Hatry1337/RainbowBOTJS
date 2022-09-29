import IgniRender from "../IgniRender";
import { Face, getFaceCenter, getFaceNormal, v3rotate, v3sum, v3zero, vec3, Vertex } from "../Utils3D";
import SceneObject from "./SceneObject";

export default class PolyObject extends SceneObject{
    public calculatedMesh: Face[];
    constructor(pos: vec3, rot: vec3, renderrer: IgniRender, public originalMesh: Face[]){
        super(pos, rot, renderrer);
        this.calculatedMesh = this.CalculateMesh();
    }

    public CalculateMesh(){
        let transform: Face[] = [];
        for(let f of this.originalMesh){
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
        return transform;
    }

    public RecalculateNormals(){
        for(let f of this.calculatedMesh){
            f.center = getFaceCenter(f);
            f.normal = getFaceNormal(f);
        }
    }
}