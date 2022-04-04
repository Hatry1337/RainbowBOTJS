export interface Thumbnail{
    url: string;
    width: number;
    height: number;
}

export interface TrackOptions{
    title: string;
    url: string;
    duration: number;
    thumbnail: Thumbnail;
    timestamp: Date;
    isRadio: boolean;
}