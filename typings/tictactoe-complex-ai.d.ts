declare module 'tictactoe-complex-ai' {
    export type Board = string[];
    export interface ObjectMinimaxNode{
        pos: number;
        score: number;
        turn: number;
        childNodes: ObjectMinimaxNode[];
    };

    export interface TicTacToeAIOptions{
        ai?: string;
        player?: string;
        empty?: string;
        maxResponseTime?: number;
        minResponseTime?: number;
    }

    export interface CreateAIConfig extends TicTacToeAIOptions {
        level: "easy" | "medium" | "hard" | "expert"
    };

    class MinimaxNode{
        constructor(parentNode?: MinimaxNode, pos: number, score: number, turn: number);
        
        public setRoot(): void;
        public addChild(node: MinimaxNode): void;
        public hasChild(): boolean;
        public getChildren(): MinimaxNode[];
        public getChild(index: number): MinimaxNode;
        public getScore(): number;
        public getPos(): number;
        public getEndNodes(arr: MinimaxNode[]): void;
        public getBranchScore(): number;
        public getChildrenBranchScore(): number[];
        public toObject(): ObjectMinimaxNode;
        public toString(): string;
    }

    class TicTacToeAI{
        constructor(options: TicTacToeAIOptions);
        
        public isValidBoard(board: Board): boolean;
        public isEmpty(elem: string ): boolean;
        public isWinPossible(board: Board, player: string): string[];

        public getTotalPlays(board: Board): number;
        public getEmptyPositions(board: Board): number[];
        public getRandomPosition(values: any[]): number;
        public delay(): Promise<void>;
        public getEmptyEdges(board: Board): number[];
        public getMark(turn: number): string;
        public minimax(board: Board, node: MinimaxNode, turn: number, depth: number): void;
        public getBestPlay(board: Board, depth: number);
    }

    class EasyAI extends TicTacToeAI{
        constructor(options: TicTacToeAIOptions){
            super(options);
        }
        public play(board: Board): Promise<number>;
    }

    class MediumAI extends TicTacToeAI{
        constructor(options: TicTacToeAIOptions){
            super(options);
        }
        public play(board: Board): Promise<number>;
    }

    class HardAI extends TicTacToeAI{
        constructor(options: TicTacToeAIOptions){
            super(options);
        }
        public defaultPlay(board: Board, depth: number): Promise<number>;
        public play(board: Board): Promise<number>;
    }

    class ExpertAI extends HardAI{
        constructor(options: TicTacToeAIOptions){
            super(options);
        }
        public play(board: Board): Promise<number>;
    }

    export function createAI(config: CreateAIConfig): EasyAI | MediumAI | HardAI | ExpertAI;
}