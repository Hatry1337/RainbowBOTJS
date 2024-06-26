export interface Point2D {
    x: number;
    y: number;
}

export interface Triangle2D {
    points: [Point2D, Point2D, Point2D];
    color?: string;
}