import { Scene, GameObjects } from 'phaser';
import { GameState } from '../types/GameState';
import { Board } from '../components/Board';
import { Tray } from '../components/Tray';
import { Tile } from '../components/Tile';
import { TileFactory } from '../utils/TileFactory';

export class Game extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: GameObjects.Image;
    
    // Game components
    private board!: Board;
    private playerTray!: Tray;
    private endTurnButton!: GameObjects.Text;
    private gameState!: GameState;
    
    // UI elements
    private titleText!: GameObjects.Text;
    
    // Placement restriction system
    private placementRestrictions: {
        isActive: boolean;
        allowedRow?: number;
        allowedCol?: number;
        placedTilePositions: { row: number; col: number }[];
    } = {
        isActive: false,
        placedTilePositions: []
    };
    
    // Visual indicators for valid placement areas
    private restrictionHighlights: GameObjects.Graphics[] = [];
    
    // Constants
    private readonly SCREEN_WIDTH = 1024;
    private readonly SCREEN_HEIGHT = 768;
    private readonly BOARD_HEIGHT_PERCENT = 0.6;
    private readonly TRAY_HEIGHT_PERCENT = 0.2;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x404040);

        console.log('Game scene created successfully!');

        // Initialize game state
        this.initializeGameState();

        // Create UI elements
        this.createBackground();
        this.createBoard();
        this.createTray();
        this.createEndTurnButton();
        this.createTitle();
        
        // Setup interaction handlers
        this.setupDragAndDrop();
        
        // Fill initial tray with tiles
        this.fillTrayWithRandomTiles();
    }

    private initializeGameState(): void {
        const allTiles = TileFactory.createAllTileTypes();
        
        this.gameState = {
            board: this.createEmptyBoard(),
            playerTray: [],
            tilePool: allTiles,
            maxTraySize: 6
        };
    }

    private createEmptyBoard(): any {
        const board: any = [];
        for (let row = 0; row < 11; row++) {
            board[row] = [];
            for (let col = 0; col < 11; col++) {
                board[row][col] = {
                    row,
                    col,
                    tile: null
                };
            }
        }
        return board;
    }

    private createBackground(): void {
        this.background = this.add.image(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT / 2, 'background');
        this.background.setAlpha(0.3);
    }

    private createBoard(): void {
        const boardSize = Math.floor(this.SCREEN_HEIGHT * this.BOARD_HEIGHT_PERCENT);
        const boardX = this.SCREEN_WIDTH / 2;
        const boardY = this.SCREEN_HEIGHT / 2; // Center vertically on screen
        
        this.board = new Board(this, boardX, boardY, boardSize);
        
        // Listen for tile drops from placed tiles on the board
        this.board.on('tileDraggedFromBoard', this.onTileDropped, this);
    }

    private createTray(): void {
        const trayY = this.SCREEN_HEIGHT - (this.SCREEN_HEIGHT * this.TRAY_HEIGHT_PERCENT) / 2;
        const trayX = this.SCREEN_WIDTH / 2 - 100; // Offset left to make room for button
        
        this.playerTray = new Tray(this, trayX, trayY, this.gameState.maxTraySize);
        this.playerTray.on('tileDroppedFromTray', this.onTileDroppedFromTray, this);
    }

    private createEndTurnButton(): void {
        const buttonX = this.SCREEN_WIDTH / 2 + 200; // To the right of tray
        const buttonY = this.SCREEN_HEIGHT - (this.SCREEN_HEIGHT * this.TRAY_HEIGHT_PERCENT) / 2;
        
        this.endTurnButton = this.add.text(buttonX, buttonY, 'End Turn', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 15, y: 10 }
        });
        this.endTurnButton.setOrigin(0.5);
        this.endTurnButton.setInteractive({ useHandCursor: true });
        
        this.endTurnButton.on('pointerover', () => {
            this.endTurnButton.setStyle({ backgroundColor: '#6a6a6a' });
        });
        
        this.endTurnButton.on('pointerout', () => {
            this.endTurnButton.setStyle({ backgroundColor: '#4a4a4a' });
        });
        
        this.endTurnButton.on('pointerdown', this.onEndTurnClicked, this);
    }

    private createTitle(): void {
        this.titleText = this.add.text(this.SCREEN_WIDTH / 2, 30, 'Word Game', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial Black'
        });
        this.titleText.setOrigin(0.5);
    }

    private fillTrayWithRandomTiles(): void {
        const tilesToDraw = Math.min(this.gameState.maxTraySize, this.gameState.tilePool.length);
        const drawnTiles = TileFactory.drawRandomTiles(this.gameState.tilePool, tilesToDraw);
        
        drawnTiles.forEach(tileData => {
            // Remove from pool
            const poolIndex = this.gameState.tilePool.findIndex(t => t.id === tileData.id);
            if (poolIndex !== -1) {
                this.gameState.tilePool.splice(poolIndex, 1);
            }
            
            // Add to tray
            this.gameState.playerTray.push(tileData);
            this.playerTray.addTile(tileData);
            
            // Get the tile that was just added and set up its drag events
            const addedTiles = this.playerTray.getAllTiles();
            const newTile = addedTiles[addedTiles.length - 1];
            if (newTile) {
                this.setupTileDragEvents(newTile);
            }
        });
    }

    private setupDragAndDrop(): void {
        // Drag and drop is handled by individual tile components
        // This method is here for future drag/drop setup if needed
    }

    private onTileDroppedFromTray(tile: Tile): void {
        // Use the centralized tile drop handler
        this.onTileDropped(tile);
    }

    private onTileDropped(tile: Tile): void {
        const pointer = this.input.activePointer;
        const boardPos = this.board.getBoardPositionFromWorldPos(pointer.worldX, pointer.worldY);
        
        // Check if tile was dropped on the tray
        if (this.playerTray.containsPoint(pointer.worldX, pointer.worldY)) {
            this.handleTileDroppedOnTray(tile);
            return;
        }
        
        // Check if tile was dropped on the board
        if (boardPos && this.canPlaceTileAt(boardPos.row, boardPos.col)) {
            this.handleTileDroppedOnBoard(tile, boardPos);
        } else {
            // Return tile to its original position
            this.returnTileToOriginalPosition(tile);
        }
    }

    private handleTileDroppedOnTray(tile: Tile): void {
        // If tile was on the board, remove it
        if (tile.tileData.isPlaced && tile.tileData.boardPosition) {
            this.board.removeTileAt(tile.tileData.boardPosition.row, tile.tileData.boardPosition.col);
            
            // Update placement restrictions when a tile is removed from board
            this.updatePlacementRestrictions();
        }
        
        // Add tile back to tray if there's space
        if (!this.playerTray.isFull()) {
            // Update game state - add back to player tray
            if (!this.gameState.playerTray.find(t => t.id === tile.tileData.id)) {
                this.gameState.playerTray.push(tile.tileData);
            }
            
            // Add existing tile instance to tray
            if (this.playerTray.getAllTiles().indexOf(tile) === -1) {
                this.playerTray.addExistingTile(tile);
            } else {
                this.playerTray.returnTileToTray(tile);
            }
        } else {
            // Return to original position if tray is full
            this.returnTileToOriginalPosition(tile);
        }
    }

    private handleTileDroppedOnBoard(tile: Tile, boardPos: { row: number; col: number }): void {
        // Place tile on board
        if (this.board.placeTile(tile, boardPos.row, boardPos.col)) {
            // Remove from tray if it was in the tray
            if (!tile.tileData.isPlaced) {
                this.playerTray.removeTile(tile);
                
                // Update game state
                const trayIndex = this.gameState.playerTray.findIndex(t => t.id === tile.tileData.id);
                if (trayIndex !== -1) {
                    this.gameState.playerTray.splice(trayIndex, 1);
                }
            }
            
            // Set up drag events for the placed tile so it can be moved again
            this.setupTileDragEvents(tile);
            
            // Update placement restrictions
            this.updatePlacementRestrictions();
            
            console.log(`Placed tile ${tile.tileData.value} at ${boardPos.row},${boardPos.col}`);
        } else {
            this.returnTileToOriginalPosition(tile);
        }
    }

    private returnTileToOriginalPosition(tile: Tile): void {
        if (tile.tileData.isPlaced) {
            // Tile was on the board, return it to its board position
            const pos = tile.tileData.boardPosition;
            if (pos) {
                const worldPos = this.board.getCellWorldPosition(pos.row, pos.col);
                tile.setPosition(worldPos.x, worldPos.y);
            }
        } else {
            // Tile was in tray, return it to tray
            this.playerTray.returnTileToTray(tile);
        }
    }

    private setupTileDragEvents(tile: Tile): void {
        // Remove existing listeners to avoid duplicates
        tile.off('tileDropped');
        
        // Add listener for when this tile is dropped
        tile.on('tileDropped', this.onTileDropped, this);
    }

    private canPlaceTileAt(row: number, col: number): boolean {
        // First check if the position is valid on the board
        if (!this.board.canPlaceTileAt(row, col)) {
            return false;
        }
        
        // If no restrictions are active, allow placement anywhere
        if (!this.placementRestrictions.isActive) {
            return true;
        }
        
        // Check placement restrictions
        const { allowedRow, allowedCol } = this.placementRestrictions;
        
        if (allowedRow !== undefined && row !== allowedRow) {
            return false;
        }
        
        if (allowedCol !== undefined && col !== allowedCol) {
            return false;
        }
        
        return true;
    }

    private updatePlacementRestrictions(): void {
        const placedTiles = this.board.getAllPlacedTiles();
        
        // Clear existing highlights
        this.clearRestrictionHighlights();
        
        if (placedTiles.length === 0) {
            // No tiles placed, no restrictions
            this.placementRestrictions = {
                isActive: false,
                placedTilePositions: []
            };
            return;
        }
        
        if (placedTiles.length === 1) {
            // One tile placed, second tile can be in same row or column
            const firstTile = placedTiles[0];
            const pos = firstTile.tileData.boardPosition;
            if (pos) {
                this.placementRestrictions = {
                    isActive: true,
                    placedTilePositions: [pos]
                };
                
                // Highlight the entire row and column for the first tile
                this.highlightRowAndColumn(pos.row, pos.col);
            }
            return;
        }
        
        // Two or more tiles placed
        const firstPos = placedTiles[0].tileData.boardPosition;
        const secondPos = placedTiles[1].tileData.boardPosition;
        
        if (firstPos && secondPos) {
            this.placementRestrictions.placedTilePositions = [firstPos, secondPos];
            
            if (firstPos.row === secondPos.row) {
                // Same row - restrict to this row
                this.placementRestrictions = {
                    isActive: true,
                    allowedRow: firstPos.row,
                    placedTilePositions: [firstPos, secondPos]
                };
                this.highlightRow(firstPos.row);
            } else if (firstPos.col === secondPos.col) {
                // Same column - restrict to this column
                this.placementRestrictions = {
                    isActive: true,
                    allowedCol: firstPos.col,
                    placedTilePositions: [firstPos, secondPos]
                };
                this.highlightColumn(firstPos.col);
            }
        }
    }

    private highlightRowAndColumn(row: number, col: number): void {
        this.highlightRow(row);
        this.highlightColumn(col);
    }

    private highlightRow(row: number): void {
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0x00ff00, 0.8);
        graphics.fillStyle(0x00ff00, 0.1);
        
        const cellSize = this.board.getCellSize();
        const gridSize = this.board.getGridSize();
        const boardPos = { x: this.board.x, y: this.board.y };
        
        const actualGridSize = cellSize * gridSize;
        const startX = boardPos.x - (actualGridSize / 2);
        const y = boardPos.y - (actualGridSize / 2) + (row * cellSize);
        
        graphics.fillRect(startX, y, actualGridSize, cellSize);
        graphics.strokeRect(startX, y, actualGridSize, cellSize);
        
        this.restrictionHighlights.push(graphics);
    }

    private highlightColumn(col: number): void {
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0x00ff00, 0.8);
        graphics.fillStyle(0x00ff00, 0.1);
        
        const cellSize = this.board.getCellSize();
        const gridSize = this.board.getGridSize();
        const boardPos = { x: this.board.x, y: this.board.y };
        
        const actualGridSize = cellSize * gridSize;
        const startY = boardPos.y - (actualGridSize / 2);
        const x = boardPos.x - (actualGridSize / 2) + (col * cellSize);
        
        graphics.fillRect(x, startY, cellSize, actualGridSize);
        graphics.strokeRect(x, startY, cellSize, actualGridSize);
        
        this.restrictionHighlights.push(graphics);
    }

    private clearRestrictionHighlights(): void {
        this.restrictionHighlights.forEach(graphics => graphics.destroy());
        this.restrictionHighlights = [];
    }

    private onEndTurnClicked(): void {
        console.log('End Turn clicked!');
        // For now, just log. Next story will handle turn logic.
    }
}
