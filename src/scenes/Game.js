import 'phaser';

const KEYBOARD_ANGULAR_ACC = 1;
const ANGULAR_SPEED_FRICTION = 0.85;
const PLAYER_SPEED = 5;

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
        const player = this.add.sprite( width / 2, height / 2, 'dragon_body');
        player.setOrigin(0.5, 0.5);

        this.player = player;
        player.angularSpeed = 0;

        

        // Connect to physics
        this.physics.add.existing(player, false);
        player.body.height = player.height - 30;
        player.body.width = player.width;
        //player.body.offset.x = player.body.width / 2 - 10;
        player.body.offset.y = player.body.height / 2;

        player.reset = function() {
            player.body.setVelocityX(0);
            player.body.setVelocityY(0);
            player.setPosition(width / 2, height / 2);
        }
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

        this._playerOnGround = false;

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
        const player = this.player;
        const { AKey, DKey } = this;

        // Keyboard controls to turn
        if (AKey.isDown) {
            player.angularSpeed -= KEYBOARD_ANGULAR_ACC;
        }
        if (DKey.isDown) {
            player.angularSpeed += KEYBOARD_ANGULAR_ACC;
        }

        player.angularSpeed *= ANGULAR_SPEED_FRICTION;

        player.angle += player.angularSpeed;

        // Make player move in direction they are facing 
        const angle = (player.angle - 90) * (Math.PI / 180);
        player.x += Math.cos(angle) * PLAYER_SPEED;
        player.y += Math.sin(angle) * PLAYER_SPEED;


        


        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            player.reset();
        }

    }
}

export default Game;