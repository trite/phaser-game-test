import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    wasd: any;

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
        });
        this.msg_text.setOrigin(0.5);

        // Set up keyboard input for arrow keys and WASD
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D');

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        });
    }

    update ()
    {
        const speed = 200;

        // Check arrow keys and WASD for movement
        if (this.cursors.left.isDown || this.wasd.A.isDown)
        {
            this.msg_text.x -= speed * this.game.loop.delta / 1000;
        }
        else if (this.cursors.right.isDown || this.wasd.D.isDown)
        {
            this.msg_text.x += speed * this.game.loop.delta / 1000;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown)
        {
            this.msg_text.y -= speed * this.game.loop.delta / 1000;
        }
        else if (this.cursors.down.isDown || this.wasd.S.isDown)
        {
            this.msg_text.y += speed * this.game.loop.delta / 1000;
        }
    }
}
