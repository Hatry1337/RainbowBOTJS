class TileEntityRegistry{
    private registry: Map<string, TileEntity> = new Map();
    private underlyingIntegerMap: Map<number, TileEntity> = new Map();

    public register(id: number, code: string, item: TileEntity): void{
        this.underlyingIntegerMap.set(id, item);
        this.registry.set(code, item);
    }

    public getObject(code: string): TileEntity | undefined{
        return this.registry.get(code);
    }

    public containsCode(code: string): boolean{
        return this.registry.has(code);
    }

    public containsId(id: number): boolean{
        return this.underlyingIntegerMap.has(id);
    }

    public getIDForObject(value: TileEntity): number {
        for(var e of this.underlyingIntegerMap.entries()){
            if(e[1] === value){
                return e[0];
            }
        }
        return -1;
    }

    public getObjectById(id: number): TileEntity | undefined {
        return this.underlyingIntegerMap.get(id);
    }

    public tick(){
        for(var te of this.registry.entries()){
            te[1].update();
        }
    }
}

const tereg = new TileEntityRegistry();

export class TileEntity{
    public static REGISTRY: TileEntityRegistry = tereg;
    public static currentTick: number = new Date().getTime() / 500;

    public update(): void{
    }
}