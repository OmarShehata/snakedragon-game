import 'phaser';
import Dragonsnake from '../Dragonsnake.js';

class Game extends Phaser.Scene {
    constructor(config) {
    	super('Game');
        window.game = this;
    }

    setupKeyboard() {
        this.rightArrowKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.leftArrowKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.upArrowKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downArrowKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        this.DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.SKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.WKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        this.RKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }


    createPlayer() {
        const { width, height } = game.sys.canvas;
        const dragonsnakeOne = new Dragonsnake( width / 2 - width / 4, height / 2, 1, this);
        const dragonsnakeTwo = new Dragonsnake( width / 2 + width / 4, height / 2, 2, this);

        this.dragonsnakeOne = dragonsnakeOne;
        this.dragonsnakeTwo = dragonsnakeTwo;
    }

    create() {
        this.createPlayer();
        this.setupKeyboard();
        

        // Create ground
        const { width, height } = game.sys.canvas;

        const ground = this.add.sprite(width/2, height - 100, 'ground');
        this.physics.add.existing(ground, true);

        const ground2 = this.add.sprite(width/2 + 400, height - 300, 'ground_small');
        this.physics.add.existing(ground2, true);

        // this.physics.add.collider(this.player, [ground, ground2], (_player, _ground) => {
        //     if (_player.body.touching.down && _ground.body.touching.up) {
        //         this._playerOnGround = true;
        //     }
        // });

        // Make camera follow player 
        // See: https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html#startFollow__anchor
        // this.cameras.main.startFollow(this.player, false, 0.5, 0.5, 0, 100);
    }

    update () {
        this.dragonsnakeOne.update();
        this.dragonsnakeTwo.update();


        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.dragonsnakeOne.reset();
            this.dragonsnakeTwo.reset();
        }

    }
}

export default Game;