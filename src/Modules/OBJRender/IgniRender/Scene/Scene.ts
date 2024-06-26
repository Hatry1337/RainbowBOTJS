import SceneObject from "./SceneObject.js";

export class Scene {
    public objects: SceneObject[];

    constructor() {
        this.objects = [];
    }

    public addObject(obj: SceneObject) {
        if(!this.objects.find(o => o.id === obj.id)){
            obj.scene = this;
            this.objects.push(obj);
        }
    }

    public removeObject(obj: SceneObject | string){
        let id: string;
        if(typeof obj === "string"){
            id = obj;
        }else{
            id = obj.id;
        }
        let index = this.objects.findIndex(o => o.id === id);
        if(index !== -1){
            this.objects.splice(index, 1);
        }
    }
}