export default class CachedInstance<T>{
    public cachedAt: Date;
    constructor(public instance: T, public lifeTime: number){
        this.cachedAt = new Date();
    }

    public isValid(){
        return this.cachedAt.getTime() + this.lifeTime > new Date().getTime();
    }
}