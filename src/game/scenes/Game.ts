import { Scene, GameObjects } from 'phaser';

export class Game extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: GameObjects.Image;
    msg_text!: GameObjects.Text;
    
    // Movement state tracking
    private movementState = {
        left: false,
        right: false,
        up: false,
        down: false
    };

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(512, 384, 'Hello World', {
            fontFamily: 'Arial Black', fontSize: 72, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Set up event-driven keyboard input
        this.setupKeyboardInput();

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }

    private setupKeyboardInput(): void
    {
        if (!this.input.keyboard) {
            return;
        }

        // Set up key down event listeners
        this.input.keyboard.on('keydown-LEFT', () => this.movementState.left = true);
        this.input.keyboard.on('keydown-RIGHT', () => this.movementState.right = true);
        this.input.keyboard.on('keydown-UP', () => this.movementState.up = true);
        this.input.keyboard.on('keydown-DOWN', () => this.movementState.down = true);
        this.input.keyboard.on('keydown-A', () => this.movementState.left = true);
        this.input.keyboard.on('keydown-D', () => this.movementState.right = true);
        this.input.keyboard.on('keydown-W', () => this.movementState.up = true);
        this.input.keyboard.on('keydown-S', () => this.movementState.down = true);

        // Set up key up event listeners
        this.input.keyboard.on('keyup-LEFT', () => this.movementState.left = false);
        this.input.keyboard.on('keyup-RIGHT', () => this.movementState.right = false);
        this.input.keyboard.on('keyup-UP', () => this.movementState.up = false);
        this.input.keyboard.on('keyup-DOWN', () => this.movementState.down = false);
        this.input.keyboard.on('keyup-A', () => this.movementState.left = false);
        this.input.keyboard.on('keyup-D', () => this.movementState.right = false);
        this.input.keyboard.on('keyup-W', () => this.movementState.up = false);
        this.input.keyboard.on('keyup-S', () => this.movementState.down = false);
    }

    update(_time: number, delta: number): void
    {
        const speed = 200; // pixels per second
        const deltaSeconds = delta * 0.001; // Convert milliseconds to seconds
        const movement = speed * deltaSeconds;

        // Apply movement based on current state
        if (this.movementState.left) {
            this.msg_text.x -= movement;
        }
        if (this.movementState.right) {
            this.msg_text.x += movement;
        }
        if (this.movementState.up) {
            this.msg_text.y -= movement;
        }
        if (this.movementState.down) {
            this.msg_text.y += movement;
        }
    }
}
