import { Scene, GameObjects } from 'phaser';

export class Game extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: GameObjects.Image;
    msg_text!: GameObjects.Text;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasd!: Record<string, Phaser.Input.Keyboard.Key>;

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

        // Set up keyboard input with proper error handling
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D') as Record<string, Phaser.Input.Keyboard.Key>;
        }

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }

    update(_time: number, delta: number): void
    {
        // Early return if keyboard input is not available
        if (!this.cursors || !this.wasd) {
            return;
        }

        const speed = 200; // pixels per second
        const deltaSeconds = delta * 0.001; // Convert milliseconds to seconds
        const movement = speed * deltaSeconds;

        // Handle horizontal movement
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.msg_text.x -= movement;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.msg_text.x += movement;
        }

        // Handle vertical movement
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.msg_text.y -= movement;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.msg_text.y += movement;
        }
    }
}
