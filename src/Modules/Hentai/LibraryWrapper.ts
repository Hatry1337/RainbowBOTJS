import path from "path";
import fs from "fs/promises";
import { Utils } from "synergy3";

export type ImageFormat = "png" | "jpg" | "jpeg" | "webp" | "gif";

export interface LibraryItem {
    id: number;
    name: string;
    tags: string[];
    author: string;
    views: number;
    likes: number;
    likesIds: string[];
    filePath: string;
    format: ImageFormat;
}

export interface LibraryItemWithData extends LibraryItem{
    data: Buffer;
}

export interface LibraryData {
    libraryName: string;
    libraryPath: string;
    lastId: number;
    items: LibraryItem[];
}

export default class LibraryWrapper {
    private data: LibraryData;
    constructor(libPath: string, private saveKV: (data: any) => Promise<void>) {
        this.data = {
            libraryName: "RainbowBOT Hentai Library",
            libraryPath: libPath,
            lastId: 1,
            items: []
        }
    }

    public getPath(){
        return this.data.libraryPath;
    }

    public async uploadPicture(item: Omit<LibraryItem, "filePath">, picture: Buffer, ext: ImageFormat){
        let picPath = path.join(this.data.libraryPath, `${item.id}-${item.name}-${item.author}.${ext}`);
        await fs.writeFile(picPath, picture);
    }

    public async loadNewPictures(){
        let files = await fs.readdir(path.normalize(this.data.libraryPath));
        files = files.filter(f => ["png", "jpg", "webp", "jpeg", "gif"].includes(path.extname(f).replace(/\./gm, ""))); //Filter only image files
        files = files.filter(f => this.data.items.findIndex(d => d.filePath === f) === -1); //Filter only new files

        for(let f of files){
            this.data.items.push({
                id: this.data.lastId,
                name: f.replace(/\..*$/gm, ""),
                tags: [],
                author: "system",
                views: 0,
                likes: 0,
                likesIds: [],
                filePath: f,
                format: path.extname(f).replace(/\./gm, "") as ImageFormat
            });

            this.data.lastId++;
        }
    }

    /**
     * @returns -1 when item is not found
     * @returns  1 when user already liked
     */
    public async like(id: number, userId: string){
        let item = this.data.items.find(i => i.id === id);
        if(!item) return -1;
        if(item.likesIds.includes(userId)) return 1;
        item.likes++;
        item.likesIds.push(userId);
        await this.save();
        return item;
    }

    /**
     * @returns -1 when item is not found
     * @returns  1 when user not liked
     */
    public async unlike(id: number, userId: string){
        let item = this.data.items.find(i => i.id === id);
        if(!item) return -1;
        if(!item.likesIds.includes(userId)) return 1;
        item.likes--;
        item.likesIds.splice(item.likesIds.indexOf(userId), 1);
        await this.save();
        return item;
    }

    public async countView(id: number){
        let item = this.data.items.find(i => i.id === id);
        if(!item) return;
        item.views++;
        await this.save();
        return item;
    }

    public getPictures(){
        return this.data.items;
    }

    public async getPicturesData(){
        let pics = [];
        for(let i of this.data.items){
            pics.push(await this.getPictureData(i.id));
        }
    }

    public getPicture(id: number){
        return this.data.items.find(i => i.id === id);
    }

    public async getPictureData(id: number): Promise<LibraryItemWithData | undefined> {
        let img = this.data.items.find(i => i.id === id);
        if(!img) return undefined;

        let picPath = path.join(this.data.libraryPath, img.filePath);
        let data = await fs.readFile(picPath);
        return Object.assign({ data }, img);
    }

    public getRandomPicture(){
        return Utils.arrayRandElement(this.data.items);
    }

    public async getRandomPictureData(): Promise<LibraryItemWithData> {
        let img = Utils.arrayRandElement(this.data.items);
        
        let picPath = path.join(this.data.libraryPath, img.filePath);
        let data = await fs.readFile(picPath);
        return Object.assign({ data }, img);
    }

    public async save(){
        await this.saveKV(this.data);
    }
    public async load(data: any){
        this.data = data;
    }
}