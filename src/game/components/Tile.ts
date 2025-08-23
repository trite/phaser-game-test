import { GameObjects, Scene } from 'phaser';
import { TileData, Position } from '../types/GameState';

export class Tile extends GameObjects.Container {
    public tileData: TileData;
    private background: GameObjects.Rectangle;
    private text: GameObjects.Text;
    private isDragging: boolean = false;
    private originalPosition: Position = { x: 0, y: 0 };

    constructor(scene: Scene, x: number, y: number, tileData: TileData, size: number = 40) {
        super(scene, x, y);
        
        this.tileData = { ...tileData };
        this.originalPosition = { x, y };

        // Create tile background
        this.background = scene.add.rectangle(0, 0, size, size, 0xf0f0f0, 1);
        this.background.setStrokeStyle(2, 0x333333);
        this.add(this.background);

        // Create tile text
        this.text = scene.add.text(0, 0, this.tileData.value, {
            fontSize: '16px',
            color: '#000000',
            fontFamily: 'Arial'
        });
        this.text.setOrigin(0.5, 0.5);
        this.add(this.text);

        // Make interactive
        this.setSize(size, size);
        this.setInteractive({ draggable: true });
        
        // Set up drag events
        this.setupDragEvents();

        // Add to scene
        scene.add.existing(this);
    }

    private setupDragEvents(): void {
        this.on('dragstart', this.onDragStart, this);
        this.on('drag', this.onDrag, this);
        this.on('dragend', this.onDragEnd, this);
    }

    private onDragStart(): void {
        this.isDragging = true;
        this.setDepth(1000); // Bring to front while dragging
        this.setScale(1.1); // Slightly larger while dragging
        this.background.setFillStyle(0xe0e0e0); // Slightly darker while dragging
    }

    private onDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
        this.setPosition(dragX, dragY);
    }

    private onDragEnd(): void {
        this.isDragging = false;
        this.setDepth(0);
        this.setScale(1);
        this.background.setFillStyle(0xf0f0f0); // Reset color
        
        // Emit custom event for the game to handle drop logic
        this.emit('tileDropped', this);
    }

    public resetPosition(): void {
        this.setPosition(this.originalPosition.x, this.originalPosition.y);
    }

    public setOriginalPosition(x: number, y: number): void {
        this.originalPosition = { x, y };
    }

    public updateData(newData: Partial<TileData>): void {
        this.tileData = { ...this.tileData, ...newData };
    }

    public getIsDragging(): boolean {
        return this.isDragging;
    }
}