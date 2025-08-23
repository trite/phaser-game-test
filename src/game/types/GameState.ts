// Game state types and interfaces

export type TileType = 'letter' | 'number' | 'symbol';

export interface TileData {
    id: string;
    type: TileType;
    value: string; // A-Z, 0-9, or @!#$%^
    isPlaced: boolean;
    boardPosition?: { row: number; col: number };
}

export interface BoardCell {
    row: number;
    col: number;
    tile: TileData | null;
}

export interface GameState {
    board: BoardCell[][];
    playerTray: TileData[];
    tilePool: TileData[];
    maxTraySize: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface BoardPosition {
    row: number;
    col: number;
}