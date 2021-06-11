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
        
        this.setupKeyboard();
        

        // Create ground
        const { width, height } = game.sys.canvas;

        for (let i = 0; i < 10; i++) {
            this.add.sprite(i * 500, height - 100, 'ground');
        }

        // Diagonal size of screen 
        const diagonalSize = Math.sqrt(width * width + height * height);
        this.diagonalSize = diagonalSize;
        
        
        const ground2 = this.add.sprite(width/2 + 400, height - 300, 'ground_small');
        this.physics.add.existing(ground2, true);

        //this.cameras.main.setBounds(0, 0, width * 10, height * 10);
        //this.cameras.main.setSize(width * 10, height * 10);

        this.createPlayer();

        // this.physics.add.collider(this.player, [ground, ground2], (_player, _ground) => {
        //     if (_player.body.touching.down && _ground.body.touching.up) {
        //         this._playerOnGround = true;
        //     }
        // });

        // Make camera follow player 
        // See: https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html#startFollow__anchor
        // this.cameras.main.startFollow(this.player, false, 0.5, 0.5, 0, 100);
    }

    getDist() {
        return {
            dist: this.dist, diagonalSize: 
            this.diagonalSize, 
            factor: (this.dist / (this.diagonalSize - 300))
        }
    }

    update () {
        this.dragonsnakeOne.update();
        this.dragonsnakeTwo.update();


        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.dragonsnakeOne.reset();
            this.dragonsnakeTwo.reset();
        }

        const camera = this.cameras.main;
        const head1 = this.dragonsnakeOne.head;
        const head2 = this.dragonsnakeTwo.head;

        const dx = Math.abs(head1.x - head2.x);
        const dy = Math.abs(head1.y - head2.y);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const padding = 400;
        let zoomScale = dist / (this.diagonalSize - padding);
        camera.zoom = (1 / zoomScale) - 0.2;
        
        if (camera.zoom > 1) camera.zoom = 1;
        if (camera.zoom < 0.1) camera.zoom = 0.1;

        // if (zoomScale < 1) zoomScale = 1;
        // if (zoomScale < 0.1) zoomScale = 0.1;
        //this.dist = dist;
        
        

        const cx = (head1.x + head2.x) / 2;
        const cy = (head1.y + head2.y) / 2;
       
        camera.centerOn(cx, cy);

    }
}

export default Game;