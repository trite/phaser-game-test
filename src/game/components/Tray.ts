import { GameObjects, Scene } from 'phaser';
import { TileData } from '../types/GameState';
import { Tile } from './Tile';

export class Tray extends GameObjects.Container {
    private readonly maxTraySize: number;
    private readonly tileSize: number;
    private readonly spacing: number;
    private tiles: Tile[] = [];
    private background: GameObjects.Rectangle;

    constructor(scene: Scene, x: number, y: number, maxSize: number = 6, tileSize: number = 40) {
        super(scene, x, y);
        
        this.maxTraySize = maxSize;
        this.tileSize = tileSize;
        this.spacing = 10;
        
        this.createBackground();
        scene.add.existing(this);
    }

    private createBackground(): void {
        const trayWidth = (this.maxTraySize * this.tileSize) + ((this.maxTraySize - 1) * this.spacing) + 20;
        const trayHeight = this.tileSize + 20;
        
        this.background = this.scene.add.rectangle(0, 0, trayWidth, trayHeight, 0x8b4513, 0.8);
        this.background.setStrokeStyle(2, 0x654321);
        this.add(this.background);
    }

    public addTile(tileData: TileData): boolean {
        if (this.tiles.length >= this.maxTraySize) {
            return false; // Tray is full
        }

        const tileIndex = this.tiles.length;
        const tileX = this.getTileXPosition(tileIndex);
        
        const tile = new Tile(this.scene, tileX, 0, tileData, this.tileSize);
        tile.setOriginalPosition(this.x + tileX, this.y);
        
        // Listen for tile drop events
        tile.on('tileDropped', this.onTileDropped, this);
        
        this.add(tile);
        this.tiles.push(tile);
        
        return true;
    }

    public addExistingTile(tile: Tile): boolean {
        if (this.tiles.length >= this.maxTraySize) {
            return false; // Tray is full
        }

        const tileIndex = this.tiles.length;
        const tileX = this.getTileXPosition(tileIndex);
        
        // Update tile data to indicate it's no longer placed
        tile.updateData({ 
            isPlaced: false, 
            boardPosition: undefined 
        });
        
        // Remove tile from its current parent if it has one
        if (tile.parentContainer) {
            tile.parentContainer.remove(tile);
        }
        
        // Position the tile in the tray using local coordinates
        tile.setPosition(tileX, 0);
        tile.setOriginalPosition(this.x + tileX, this.y);
        
        // Listen for tile drop events
        tile.on('tileDropped', this.onTileDropped, this);
        
        this.add(tile);
        this.tiles.push(tile);
        
        return true;
    }

    public removeTile(tile: Tile): boolean {
        const index = this.tiles.indexOf(tile);
        if (index === -1) {
            return false;
        }

        // Remove event listener
        tile.off('tileDropped', this.onTileDropped, this);
        
        // Remove from container and array
        this.remove(tile);
        this.tiles.splice(index, 1);
        
        // Reposition remaining tiles
        this.repositionTiles();
        
        return true;
    }

    public getTile(index: number): Tile | null {
        if (index < 0 || index >= this.tiles.length) {
            return null;
        }
        return this.tiles[index];
    }

    public getAllTiles(): Tile[] {
        return [...this.tiles];
    }

    public isFull(): boolean {
        return this.tiles.length >= this.maxTraySize;
    }

    public isEmpty(): boolean {
        return this.tiles.length === 0;
    }

    public getSize(): number {
        return this.tiles.length;
    }

    public getMaxSize(): number {
        return this.maxTraySize;
    }

    private getTileXPosition(index: number): number {
        const totalWidth = (this.maxTraySize * this.tileSize) + ((this.maxTraySize - 1) * this.spacing);
        const startX = -(totalWidth / 2) + (this.tileSize / 2);
        return startX + (index * (this.tileSize + this.spacing));
    }

    private repositionTiles(): void {
        this.tiles.forEach((tile, index) => {
            const newX = this.getTileXPosition(index);
            tile.setPosition(newX, 0);
            tile.setOriginalPosition(this.x + newX, this.y);
        });
    }

    private onTileDropped(tile: Tile): void {
        // Emit event to parent game scene
        this.emit('tileDroppedFromTray', tile);
    }

    public returnTileToTray(tile: Tile): void {
        // Find the tile in our array and reset its position
        const index = this.tiles.indexOf(tile);
        if (index !== -1) {
            // Remove tile from its current parent if it has one
            if (tile.parentContainer && tile.parentContainer !== this) {
                tile.parentContainer.remove(tile);
                // Add it back to the tray container
                this.add(tile);
            }
            
            const tileX = this.getTileXPosition(index);
            tile.setPosition(tileX, 0);
            tile.setOriginalPosition(this.x + tileX, this.y);
        }
    }

    public containsPoint(x: number, y: number): boolean {
        const bounds = this.background.getBounds();
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
}