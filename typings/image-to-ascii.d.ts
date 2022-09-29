declare module 'image-to-ascii' {
    export interface ImageToASCIIOptions {
        pxWidth?: number;
        size?: {
            height?: number | string;
            width?: number | string;
        }
        size_options?: {
            screen_size?: {
                height?: number;
                width?: number;
            }
            px_size?: {
                height?: number;
                width?: number;
            }
            preserve_aspect_ratio?: boolean;
            fit_screen?: boolean;
        }
        stringify?: boolean;
        concat?: boolean;
        pixels?: string[] | string;
        reverse?: boolean;
        colored?: boolean;
        bg?: boolean;
        fg?: boolean;
        white_bg?: boolean;
        px_background?: {
            r: number;
            g: number;
            b: number;
        }
        image_type?: string;
        stringify_fn?: (pixels: any, options: any) => string;
        callback?: ImageToASCIICallback;
    }
    export type ImageToASCIICallback = (err: any | undefined, converted: string) => void;
    export default function imageToAscii(source: string | Buffer, options: ImageToASCIIOptions, callback: ImageToASCIICallback);
}