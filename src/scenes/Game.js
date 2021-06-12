import 'phaser';
import Dragonsnake from '../Dragonsnake.js';

class Game extends Phaser.Scene {
    constructor(config) {
    	super('Game');
        window.game = this;
        window.zoom = 0.6;
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
        this.iconMin = this.add.sprite(0, 0, 'icon_crossLarge');
        this.iconMax = this.add.sprite(0, 0, 'icon_crossLarge');
        this.iconMax.alpha = 0;
        this.iconMin.alpha = 0;
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

        const WORLD_SIZE = 1024 * 2;
        this.cameras.main.setBounds(-WORLD_SIZE, -WORLD_SIZE, WORLD_SIZE * 3, WORLD_SIZE * 3);
        this.physics.world.setBounds(-WORLD_SIZE, -WORLD_SIZE, WORLD_SIZE * 3, WORLD_SIZE * 3);

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

        //camera.zoom = window.zoom;

        const boundsOne = this.dragonsnakeOne.bounds();
        const boundsTwo = this.dragonsnakeTwo.bounds();

        const min = {
            x: Math.min(boundsOne.min.x, boundsTwo.min.x),
            y: Math.min(boundsOne.min.y, boundsTwo.min.y),
        }; 
        const max = {
            x: Math.max(boundsOne.max.x, boundsTwo.max.x),
            y: Math.max(boundsOne.max.y, boundsTwo.max.y),
        };

        this.iconMin.x = min.x;
        this.iconMin.y = min.y;

        this.iconMax.x = max.x;
        this.iconMax.y = max.y;

        const padding = 100;
        const dx = Math.abs(max.x - min.x) + padding;
        const dy = Math.abs(max.y - min.y) + padding;

        const targetZoomH = (camera.height / dy);
        const targetZoomW = (camera.width / dx);

        let targetZoom = Math.min(targetZoomH, targetZoomW);


        if (targetZoom > 0.6) targetZoom = 0.6;

        camera.zoom += (targetZoom - camera.zoom) * 0.16;


        const cx = (max.x + min.x) / 2;
        const cy = (max.y + min.y) / 2;
       
        camera.centerOn(cx, cy);

    }
}

export default Game;