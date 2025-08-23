import { Scene, GameObjects } from 'phaser';

export class Game extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: GameObjects.Image;
    
    // UI elements
    private titleText!: GameObjects.Text;
    private testBoard!: GameObjects.Rectangle;
    private testTray!: GameObjects.Rectangle;
    private endTurnButton!: GameObjects.Text;
    
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

        console.log('Game scene created!');

        // Create basic UI elements first
        this.createBackground();
        this.createTitle();
        this.createTestBoard();
        this.createTestTray();
        this.createEndTurnButton();
    }

    private createBackground(): void {
        this.background = this.add.image(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT / 2, 'background');
        this.background.setAlpha(0.3);
    }

    private createTitle(): void {
        this.titleText = this.add.text(this.SCREEN_WIDTH / 2, 30, 'Word Game - Board & Tray Test', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial Black'
        });
        this.titleText.setOrigin(0.5);
    }

    private createTestBoard(): void {
        const boardSize = Math.floor(this.SCREEN_HEIGHT * this.BOARD_HEIGHT_PERCENT);
        const boardX = this.SCREEN_WIDTH / 2;
        const boardY = (this.SCREEN_HEIGHT * this.BOARD_HEIGHT_PERCENT) / 2;
        
        this.testBoard = this.add.rectangle(boardX, boardY, boardSize, boardSize, 0xffffff, 0.8);
        this.testBoard.setStrokeStyle(2, 0x000000);
        
        // Add grid lines
        const cellSize = boardSize / 11;
        for (let i = 1; i < 11; i++) {
            // Vertical lines
            const vLineX = boardX - boardSize/2 + (i * cellSize);
            this.add.line(0, 0, vLineX, boardY - boardSize/2, vLineX, boardY + boardSize/2, 0x999999);
            
            // Horizontal lines
            const hLineY = boardY - boardSize/2 + (i * cellSize);
            this.add.line(0, 0, boardX - boardSize/2, hLineY, boardX + boardSize/2, hLineY, 0x999999);
        }
        
        // Add label
        this.add.text(boardX, boardY + boardSize/2 + 20, '11x11 Game Board', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    private createTestTray(): void {
        const trayY = this.SCREEN_HEIGHT - (this.SCREEN_HEIGHT * this.TRAY_HEIGHT_PERCENT) / 2;
        const trayX = this.SCREEN_WIDTH / 2 - 100;
        
        this.testTray = this.add.rectangle(trayX, trayY, 300, 60, 0x8b4513, 0.8);
        this.testTray.setStrokeStyle(2, 0x654321);
        
        // Add sample tiles
        for (let i = 0; i < 6; i++) {
            const tileX = trayX - 125 + (i * 45);
            const tile = this.add.rectangle(tileX, trayY, 40, 40, 0xf0f0f0, 1);
            tile.setStrokeStyle(2, 0x333333);
            
            // Add letter
            const letters = ['A', 'B', 'C', '1', '@', 'Z'];
            this.add.text(tileX, trayY, letters[i], {
                fontSize: '16px',
                color: '#000000'
            }).setOrigin(0.5);
        }
        
        // Add label
        this.add.text(trayX, trayY + 50, 'Player Tray (6 tiles)', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    private createEndTurnButton(): void {
        const buttonX = this.SCREEN_WIDTH / 2 + 200;
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
        
        this.endTurnButton.on('pointerdown', () => {
            console.log('End Turn clicked!');
            this.endTurnButton.setStyle({ backgroundColor: '#8a8a8a' });
        });
        
        this.endTurnButton.on('pointerup', () => {
            this.endTurnButton.setStyle({ backgroundColor: '#6a6a6a' });
        });
    }
}
