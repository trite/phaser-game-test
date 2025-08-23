import { GameObjects, Scene } from 'phaser';
import { BoardCell, BoardPosition, TileData, CoordinateKey, createCoordinateKey, HighlightType, PlacementValidationResult } from '../types/GameState';
import { Tile } from './Tile';

export class Board extends GameObjects.Container {
    private readonly GRID_SIZE = 11;
    private readonly CELL_SIZE: number;
    
    private cells: BoardCell[][] = [];
    private gridLines: GameObjects.Graphics;
    private placedTiles: Map<CoordinateKey, Tile> = new Map(); // coordinate key -> tile

    constructor(scene: Scene, x: number, y: number, boardSize: number) {
        super(scene, x, y);
        
        this.CELL_SIZE = Math.floor(boardSize / this.GRID_SIZE);
        
        this.initializeBoard();
        this.gridLines = this.scene.add.graphics();
        this.add(this.gridLines);
        this.createGridLines();
        
        scene.add.existing(this);
    }

    private initializeBoard(): void {
        this.cells = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                this.cells[row][col] = {
                    row,
                    col,
                    tile: null
                };
            }
        }
    }

    private createGridLines(): void {
        // Calculate the actual grid size based on cell size
        const actualGridSize = this.CELL_SIZE * this.GRID_SIZE;
        
        // Center the grid within the board container
        const startX = -(actualGridSize / 2);
        const startY = -(actualGridSize / 2);
        const endX = actualGridSize / 2;
        const endY = actualGridSize / 2;

        this.gridLines.lineStyle(1, 0x999999, 0.8);

        // Draw vertical lines
        for (let i = 0; i <= this.GRID_SIZE; i++) {
            const x = startX + (i * this.CELL_SIZE);
            this.gridLines.moveTo(x, startY);
            this.gridLines.lineTo(x, endY);
        }

        // Draw horizontal lines
        for (let i = 0; i <= this.GRID_SIZE; i++) {
            const y = startY + (i * this.CELL_SIZE);
            this.gridLines.moveTo(startX, y);
            this.gridLines.lineTo(endX, y);
        }

        this.gridLines.strokePath();
    }

    public canPlaceTileAt(row: number, col: number): boolean {
        if (row < 0 || row >= this.GRID_SIZE || col < 0 || col >= this.GRID_SIZE) {
            return false;
        }
        return this.cells[row][col].tile === null;
    }

    public placeTile(tile: Tile, row: number, col: number): boolean {
        if (!this.canPlaceTileAt(row, col)) {
            return false;
        }

        // Remove from previous position if it was on the board
        if (tile.tileData.isPlaced && tile.tileData.boardPosition) {
            this.removeTileAt(tile.tileData.boardPosition.row, tile.tileData.boardPosition.col);
        }

        // Place the tile
        this.cells[row][col].tile = tile.tileData;
        tile.updateData({ 
            isPlaced: true, 
            boardPosition: { row, col } 
        });

        // Position the tile visually using local coordinates
        const localPos = this.getCellLocalPosition(row, col);
        tile.setPosition(localPos.x, localPos.y);
        
        // Add tile to board container so it moves with the board
        this.add(tile);
        
        // Store reference to tile
        const coordKey = createCoordinateKey(row, col);
        this.placedTiles.set(coordKey, tile);

        return true;
    }

    public removeTileAt(row: number, col: number): Tile | null {
        if (row < 0 || row >= this.GRID_SIZE || col < 0 || col >= this.GRID_SIZE) {
            return null;
        }

        const cell = this.cells[row][col];
        if (!cell.tile) {
            return null;
        }

        // Clear the cell
        cell.tile = null;
        
        // Get and remove the tile reference
        const coordKey = createCoordinateKey(row, col);
        const tile = this.placedTiles.get(coordKey);
        if (tile) {
            tile.updateData({ 
                isPlaced: false, 
                boardPosition: undefined 
            });
            
            // Remove tile from board container
            this.remove(tile);
            
            this.placedTiles.delete(coordKey);
            return tile;
        }

        return null;
    }

    public getBoardPositionFromWorldPos(worldX: number, worldY: number): BoardPosition | null {
        // Convert world position to local position relative to board
        const localX = worldX - this.x;
        const localY = worldY - this.y;
        
        // Calculate which cell this corresponds to using actual grid size
        const actualGridSize = this.CELL_SIZE * this.GRID_SIZE;
        const startX = -(actualGridSize / 2);
        const startY = -(actualGridSize / 2);
        
        const col = Math.floor((localX - startX) / this.CELL_SIZE);
        const row = Math.floor((localY - startY) / this.CELL_SIZE);
        
        if (row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE) {
            return { row, col };
        }
        
        return null;
    }

    public getCellWorldPosition(row: number, col: number): { x: number; y: number } {
        const actualGridSize = this.CELL_SIZE * this.GRID_SIZE;
        const startX = -(actualGridSize / 2) + (this.CELL_SIZE / 2);
        const startY = -(actualGridSize / 2) + (this.CELL_SIZE / 2);
        
        return {
            x: this.x + startX + (col * this.CELL_SIZE),
            y: this.y + startY + (row * this.CELL_SIZE)
        };
    }

    public getCellLocalPosition(row: number, col: number): { x: number; y: number } {
        const actualGridSize = this.CELL_SIZE * this.GRID_SIZE;
        const startX = -(actualGridSize / 2) + (this.CELL_SIZE / 2);
        const startY = -(actualGridSize / 2) + (this.CELL_SIZE / 2);
        
        return {
            x: startX + (col * this.CELL_SIZE),
            y: startY + (row * this.CELL_SIZE)
        };
    }

    public getTileAt(row: number, col: number): TileData | null {
        if (row < 0 || row >= this.GRID_SIZE || col < 0 || col >= this.GRID_SIZE) {
            return null;
        }
        return this.cells[row][col].tile;
    }

    public getAllPlacedTiles(): Tile[] {
        return Array.from(this.placedTiles.values());
    }

    public getGridSize(): number {
        return this.GRID_SIZE;
    }

    public getCellSize(): number {
        return this.CELL_SIZE;
    }

    // Placement validation methods
    public validatePlacement(targetRow: number, targetCol: number): PlacementValidationResult {
        // First check if the position is valid on the board itself
        if (!this.canPlaceTileAt(targetRow, targetCol)) {
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
        const placedPositions = this.getAllPlacedPositions();
        
        if (placedPositions.length === 0) {
            // No tiles placed, anywhere is valid
            const validPositions: BoardPosition[] = [];
            for (let row = 0; row < this.GRID_SIZE; row++) {
                for (let col = 0; col < this.GRID_SIZE; col++) {
                    if (this.canPlaceTileAt(row, col)) {
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

        if (placedPositions.length === 1) {
            // One tile placed, next tile can be in same row or column
            const firstPos = placedPositions[0];
            const validPositions: BoardPosition[] = [];
            
            // Add all valid positions in the same row
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.canPlaceTileAt(firstPos.row, col)) {
                    validPositions.push({ row: firstPos.row, col });
                }
            }
            
            // Add all valid positions in the same column (avoid duplicates)
            for (let row = 0; row < this.GRID_SIZE; row++) {
                if (row !== firstPos.row && this.canPlaceTileAt(row, firstPos.col)) {
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
        const firstPos = placedPositions[0];
        const secondPos = placedPositions[1];
        const validPositions: BoardPosition[] = [];

        if (firstPos.row === secondPos.row) {
            // Same row - restrict to this row
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.canPlaceTileAt(firstPos.row, col)) {
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
            for (let row = 0; row < this.GRID_SIZE; row++) {
                if (this.canPlaceTileAt(row, firstPos.col)) {
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

    private getAllPlacedPositions(): BoardPosition[] {
        const positions: BoardPosition[] = [];
        this.placedTiles.forEach(tile => {
            if (tile.tileData.boardPosition) {
                positions.push(tile.tileData.boardPosition);
            }
        });
        return positions;
    }
}