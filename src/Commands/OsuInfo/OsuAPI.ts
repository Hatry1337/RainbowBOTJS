import got from "got";

const Key = 'e5d6051cbf2455fd3f2c1240208aa4812594c6f0';
const Endpoint = "https://osu.ppy.sh/api/";

export enum OsuGameMode{
    taiko = 1,
    catch = 2,
    mania = 3,
    osu   = 0
}

export interface OsuEvent{
    display_html    : string;
    beatmap_id      : number;
    beatmapset_id   : number;
    date            : Date;
    epicfactor      : number;
}

export interface OsuUser{
    user_id               : number;
    username              : string;
    join_date             : Date;
    count300              : number;
    count100              : number;
    count50               : number;
    playcount             : number;
    ranked_score          : number;
    total_score           : number;
    pp_rank               : number;
    level                 : number;
    pp_raw                : number;
    accuracy              : number;
    count_rank_ss         : number;
    count_rank_ssh        : number;
    count_rank_s          : number;
    count_rank_sh         : number;
    count_rank_a          : number;    
    country               : string;
    total_seconds_played  : number;
    pp_country_rank       : number;
    events                : OsuEvent[];
}

export enum OsuMapApproveState{
    loved     =  4,
    qualified =  3,
    approved  =  2,
    ranked    =  1,
    pending   =  0,
    WIP       = -1,
    graveyard = -2
}

export enum OsuMapGenre{
    any         = 0, 
    unspecified = 1, 
    video_game  = 2,
    anime       = 3,
    rock        = 4,
    pop         = 5,
    other       = 6,
    novelty     = 7,
    hip_hop     = 9,
    electronic  = 10,
    metal       = 11,
    classical   = 12,
    folk        = 13,
    jazz        = 14
}

export enum OsuMapLanguage{
    any          = 0,
    unspecified  = 1,
    english      = 2,
    japanese     = 3,
    chinese      = 4,
    instrumental = 5,
    korean       = 6,
    french       = 7,
    german       = 8,
    swedish      = 9,
    spanish      = 10,
    italian      = 11,
    russian      = 12,
    polish       = 13,
    other        = 14
}

export interface OsuMap{
    approved             : OsuMapApproveState;
    submit_date          : Date;
    approved_date        : Date;
    last_update          : Date;
    artist               : string;
    beatmap_id           : number;
    beatmapset_id        : number;
    bpm                  : number;
    creator              : string;
    creator_id           : number;
    difficultyrating     : number;
    diff_aim             : number;
    diff_speed           : number;
    diff_size            : number;
    diff_overall         : number;
    diff_approach        : number;
    diff_drain           : number;
    hit_length           : number;
    source               : string;
    genre_id             : OsuMapGenre;                   
    language_id          : OsuMapLanguage;
    title                : string;
    total_length         : number;
    version              : string;
    file_md5             : string;

    mode                 : OsuGameMode;
    tags                 : string[];
    favourite_count      : number;
    rating               : number;
    playcount            : number;
    passcount            : number;
    count_normal         : number;
    count_slider         : number;
    count_spinner        : number;
    max_combo            : number;
    storyboard           : boolean;
    video                : boolean;
    download_unavailable : boolean;
    audio_unavailable    : boolean;
}

export interface OsuScore{
    beatmap_id       : number;
    score_id         : number;
    score            : number;
    maxcombo         : number;
    count50          : number;
    count100         : number;
    count300         : number;
    countmiss        : number;
    countkatu        : number;
    countgeki        : number;
    perfect          : boolean;
    enabled_mods     : number;
    user_id          : number;
    date             : Date;
    rank             : string;
    pp               : number;
    replay_available : boolean;
}

export class OsuAPI{
    private static typeConv(obj: any, types: {fields: string[], type: "int" | "float" | "bool" | "date"}[]){
        for(let t of types){
            for(let f of t.fields){
                if(obj[f]){
                    switch(t.type){
                        case "int": {
                            obj[f] = parseInt(obj[f]);
                            break;                        
                        }
                        case "float": {
                            obj[f] = parseFloat(obj[f]);
                            break;                        
                        }
                        case "bool": {
                            obj[f] = obj[f] === '1' || obj[f] === 1;
                            break;                        
                        }
                        case "date": {
                            obj[f] = new Date(obj[f].replace(" ", "T") + ".000Z");
                            break;                        
                        }
                    }
                }
            }
        }
    }
    static getOsuUser(username: string, mode: OsuGameMode){
        return new Promise<OsuUser | null>(async (resolve, reject) => {
            got(Endpoint + "/get_user", {
                method: "POST",
                form: {
                    k: Key,
                    u: username,
                    m: mode,
                    event_days: 31
                }
            }).then(async (response) => {
                let users = JSON.parse(response.body);
                if(users.length <= 0) return resolve(null);
                let user = users[0];
                if("user_id" in user && "username" in user){
                    this.typeConv(user, [
                        {
                            type: "int",
                            fields: [
                                "user_id",
                                "count300",
                                "count100",
                                "count50",
                                "playcount",
                                "ranked_score",
                                "total_score",
                                "pp_rank",
                                "pp_raw",
                                "count_rank_ss",
                                "count_rank_ssh",
                                "count_rank_s",
                                "count_rank_sh",
                                "count_rank_a",    
                                "total_seconds_played",
                                "pp_country_rank",   
                            ]
                        },
                        {
                            type: "float",
                            fields: [
                                "level",
                                "accuracy", 
                            ]
                        },
                        {
                            type: "date",
                            fields: [
                                "join_date",
                            ]
                        }
                    ]);
                    for(let e of user.events){
                        this.typeConv(e, [{
                            type: "int",
                                fields: [
                                    "beatmap_id",
                                    "beatmapset_id",
                                    "epicfactor",
                                ]
                            },
                            {
                                type: "date",
                                fields: [
                                    "date",
                                ]
                            }
                        ]);
                    }
                    return resolve(user as OsuUser);
                }else{
                    return reject("Response Error: Response structure don't match type definition. Response: " + response.body);
                }
            }).catch(reject);
        });
    }

    static getOsuUserBestScores(username: string, mode: OsuGameMode){
        return new Promise<OsuScore[]>(async (resolve, reject) => {
            got(Endpoint + "/get_user_best", {
                method: "POST",
                form: {
                    k: Key,
                    u: username,
                    m: mode
                }
            }).then(async (response) => {
                let scores = JSON.parse(response.body);
                if(scores.length <= 0) return resolve([]);
                for(let s of scores){
                    if("score_id" in s && "beatmap_id" in s){
                        this.typeConv(s, [
                            {
                                type: "int",
                                fields: [
                                    "beatmap_id",
                                    "score_id",
                                    "score",
                                    "maxcombo",
                                    "count50",
                                    "count100",
                                    "count300",
                                    "countmiss",
                                    "countkatu",
                                    "countgeki",
                                    "enabled_mods",
                                    "user_id",
                                ]
                            },
                            {
                                type: "float",
                                fields: [
                                    "pp"
                                ]
                            },
                            {
                                type: "date",
                                fields: [
                                    "date",
                                ]
                            },
                            {
                                type: "bool",
                                fields: [
                                    "perfect",
                                    "replay_available",
                                ]
                            }
                        ]);
                    }else{
                        return reject("Response Error: Response structure don't match type definition. Response: " + response.body);
                    }
                }
                return resolve(scores as OsuScore[] || []);
            }).catch(reject);
        });
    }

    static getOsuMap(id: number){
        return new Promise<OsuMap | null>(async (resolve, reject) => {
            got(Endpoint + "/get_beatmaps", {
                method: "POST",
                form: {
                    k: Key,
                    b: id,
                    limit: 1
                }
            }).then(async (response) => {
                let maps = JSON.parse(response.body);
                if(maps.length <= 0) return resolve(null);
                let map = maps[0];
                if("beatmap_id" in map && "creator_id" in map){
                    map.tags = map.tags.split(" ");
                    this.typeConv(map, [
                        {
                            type: "int",
                            fields: [
                                "approved",
                                "beatmap_id",
                                "beatmapset_id",
                                "bpm",
                                "creator_id",
                                "diff_size",
                                "diff_overall",
                                "diff_approach",
                                "diff_drain",
                                "hit_length",
                                "genre_id",
                                "language_id",
                                "total_length",
                                "mode",
                                "favourite_count",
                                "playcount",
                                "passcount",
                                "count_normal",
                                "count_slider",
                                "count_spinner",
                                "max_combo",
                            ]
                        },
                        {
                            type: "float",
                            fields: [
                                "difficultyrating",
                                "diff_aim",
                                "diff_speed",
                                "rating",
                            ]
                        },
                        {
                            type: "date",
                            fields: [
                                "submit_date",
                                "approved_date",
                                "last_update",
                            ]
                        },
                        {
                            type: "bool",
                            fields: [
                                "storyboard",
                                "video",
                                "download_unavailable",
                                "audio_unavailable",
                            ]
                        }
                    ])
                    return resolve(map as OsuMap);
                }else{
                    return reject("Response Error: Response structure don't match type definition. Response: " + response.body);
                }
            }).catch(reject);
        });
    }
}