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

// Coordinate key type for better type safety in Maps
export type CoordinateKey = `${number},${number}`;

// Helper function to create coordinate keys
export function createCoordinateKey(row: number, col: number): CoordinateKey {
    return `${row},${col}`;
}

// Helper function to parse coordinate keys back to position
export function parseCoordinateKey(key: CoordinateKey): BoardPosition {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
}

// Placement validation types
export enum HighlightType {
    NONE = 'none',
    ROWS = 'rows', 
    COLUMNS = 'columns',
    ROWS_AND_COLUMNS = 'rowsAndColumns'
}

export type PlacementValidationResult = {
   isValidPlacement: boolean;
   validPositions: BoardPosition[];
   highlightType: HighlightType;
   highlightRow?: number;
   highlightCol?: number;
} & (
   | { highlightType: HighlightType.NONE }
   | { highlightType: HighlightType.ROWS; highlightRow: number }
   | { highlightType: HighlightType.COLUMNS; highlightCol: number }
   | { highlightType: HighlightType.ROWS_AND_COLUMNS; highlightRow: number; highlightCol: number }
);