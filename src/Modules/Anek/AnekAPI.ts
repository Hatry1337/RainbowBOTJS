import got from "got";

export const AneksEndpoint = "https://api.irisdev.xyz/baneks";

export interface Anek {
    status: number;
    id: number;
    anek: string;
    source: string;
    s_id: string;
    tags: string[];
    message?: string;
}

export interface TagList {
    status: number;
    tags: string[];
    message?: string;
}

export class AnekAPI {
    static GetRandomAnek(){
        return new Promise<Anek>(async (resolve, reject) => {
            got(AneksEndpoint + "/random").then(async (response) => {
                var anek = JSON.parse(response.body) as Anek;
                if("anek" in anek && "id" in anek && "source" in anek){
                    if(anek.status != 1){
                        return reject("Not 1 status code: " + anek.message);
                    }
                    return resolve(anek);
                }else{
                    return reject("Response Error: Response structure don't match type definition. Response: " + response.body);
                }
            }).catch(reject);
        });
    }

    static GetAnek(id: number){
        return new Promise<Anek>(async (resolve, reject) => {
            got(AneksEndpoint + `/id/${id}`).then(async (response) => {
                var anek = JSON.parse(response.body) as Anek;
                if("anek" in anek && "id" in anek && "source" in anek){
                    if(anek.status != 1){
                        return reject("Not 1 status code: " + anek.message);
                    }
                    return resolve(anek);
                }else{
                    return reject("Response Error: Response structure don't match type definition. Response: " + response.body);
                }
            }).catch(reject);
        });
    }

    static GetTaggedRandomAnek(tag: string){
        return new Promise<Anek>(async (resolve, reject) => {
            got(AneksEndpoint + "/tag/" + tag).then(async (response) => {
                var anek = JSON.parse(response.body) as Anek;
                if("anek" in anek && "id" in anek && "source" in anek){
                    if(anek.status != 1){
                        return reject("Not 1 status code: " + anek.message);
                    }
                    return resolve(anek);
                }else{
                    return reject("Response Error: Response structure don't match type definition. Response: " + response.body);
                }
            }).catch(reject);
        });
    }

    static GetTags(){
        return new Promise<string[]>(async (resolve, reject) => {
            got(AneksEndpoint + "/tags").then(async (response) => {
                var taglist = JSON.parse(response.body) as TagList;
                if("status" in taglist && "tags" in taglist){
                    if(taglist.status != 1){
                        return reject("Not 1 status code: " + taglist.message);
                    }
                    return resolve(taglist.tags);
                }else{
                    return reject("Response Error: Response structure don't match type definition. Response: " + response.body);
                }
            }).catch(reject);
        });
    }
}