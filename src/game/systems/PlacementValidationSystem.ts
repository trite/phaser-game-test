import { BoardPosition } from '../types/GameState';
import { Board } from '../components/Board';

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

export class PlacementValidationSystem {
    private board: Board;
    private placedTilePositions: BoardPosition[] = [];

    constructor(board: Board) {
        this.board = board;
    }

    public updatePlacedTiles(positions: BoardPosition[]): void {
        this.placedTilePositions = [...positions];
    }

    public validatePlacement(targetRow: number, targetCol: number): PlacementValidationResult {
        // First check if the position is valid on the board itself
        if (!this.board.canPlaceTileAt(targetRow, targetCol)) {
            return {
                isValidPlacement: false,
                validPositions: [],
                highlightType: HighlightType.NONE
            } as PlacementValidationResult;
        }

        const result = this.calculateValidPlacement();
        
        // Check if the target position is in the valid positions
        const isValidPlacement = result.validPositions.some(
            pos => pos.row === targetRow && pos.col === targetCol
        );

        return {
            ...result,
            isValidPlacement
        };
    }

    public calculateValidPlacement(): PlacementValidationResult {
        const gridSize = this.board.getGridSize();
        
        if (this.placedTilePositions.length === 0) {
            // No tiles placed, anywhere is valid
            const validPositions: BoardPosition[] = [];
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (this.board.canPlaceTileAt(row, col)) {
                        validPositions.push({ row, col });
                    }
                }
            }
            return {
                isValidPlacement: true,
                validPositions,
                highlightType: HighlightType.NONE
            } as PlacementValidationResult;
        }

        if (this.placedTilePositions.length === 1) {
            // One tile placed, next tile can be in same row or column
            const firstPos = this.placedTilePositions[0];
            const validPositions: BoardPosition[] = [];
            
            // Add all valid positions in the same row
            for (let col = 0; col < gridSize; col++) {
                if (this.board.canPlaceTileAt(firstPos.row, col)) {
                    validPositions.push({ row: firstPos.row, col });
                }
            }
            
            // Add all valid positions in the same column (avoid duplicates)
            for (let row = 0; row < gridSize; row++) {
                if (row !== firstPos.row && this.board.canPlaceTileAt(row, firstPos.col)) {
                    validPositions.push({ row, col: firstPos.col });
                }
            }
            
            return {
                isValidPlacement: true,
                validPositions,
                highlightType: HighlightType.ROWS_AND_COLUMNS,
                highlightRow: firstPos.row,
                highlightCol: firstPos.col
            } as PlacementValidationResult;
        }

        // Two or more tiles placed - must be in same line
        const firstPos = this.placedTilePositions[0];
        const secondPos = this.placedTilePositions[1];
        const validPositions: BoardPosition[] = [];

        if (firstPos.row === secondPos.row) {
            // Same row - restrict to this row
            for (let col = 0; col < gridSize; col++) {
                if (this.board.canPlaceTileAt(firstPos.row, col)) {
                    validPositions.push({ row: firstPos.row, col });
                }
            }
            return {
                isValidPlacement: true,
                validPositions,
                highlightType: HighlightType.ROWS,
                highlightRow: firstPos.row
            } as PlacementValidationResult;
        } else if (firstPos.col === secondPos.col) {
            // Same column - restrict to this column
            for (let row = 0; row < gridSize; row++) {
                if (this.board.canPlaceTileAt(row, firstPos.col)) {
                    validPositions.push({ row, col: firstPos.col });
                }
            }
            return {
                isValidPlacement: true,
                validPositions,
                highlightType: HighlightType.COLUMNS,
                highlightCol: firstPos.col
            } as PlacementValidationResult;
        }

        // Tiles are not in a line - no valid placements
        return {
            isValidPlacement: false,
            validPositions: [],
            highlightType: HighlightType.NONE
        } as PlacementValidationResult;
    }
}