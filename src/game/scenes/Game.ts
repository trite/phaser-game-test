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
        });
    }

    private setupDragAndDrop(): void {
        // Drag and drop is handled by individual tile components
        // This method is here for future drag/drop setup if needed
    }

    private onTileDroppedFromTray(tile: Tile): void {
        const pointer = this.input.activePointer;
        const boardPos = this.board.getBoardPositionFromWorldPos(pointer.worldX, pointer.worldY);
        
        if (boardPos && this.board.canPlaceTileAt(boardPos.row, boardPos.col)) {
            // Place tile on board
            if (this.board.placeTile(tile, boardPos.row, boardPos.col)) {
                // Remove from tray
                this.playerTray.removeTile(tile);
                
                // Update game state
                const trayIndex = this.gameState.playerTray.findIndex(t => t.id === tile.tileData.id);
                if (trayIndex !== -1) {
                    this.gameState.playerTray.splice(trayIndex, 1);
                }
                
                console.log(`Placed tile ${tile.tileData.value} at ${boardPos.row},${boardPos.col}`);
            }
        } else {
            // Return tile to tray
            this.playerTray.returnTileToTray(tile);
        }
    }

    private onEndTurnClicked(): void {
        console.log('End Turn clicked!');
        // For now, just log. Next story will handle turn logic.
    }
}
