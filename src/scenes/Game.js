import 'phaser';
import Dragonsnake from '../Dragonsnake.js';
let isSoloMode = true;

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

    generateBackground() {
        const bounds = game.cameras.main.getBounds();
        const { width, height } = bounds;
        const TILE_SIZE = 1024;
        const NUM_TILES_X = width / TILE_SIZE;
        const NUM_TILES_Y = height / TILE_SIZE;
       
        const farmLocations = [
            [1, 1],
            [2, 3],
            [4, 2],
        ];


        for (let x = 0; x < NUM_TILES_X; x++) {
            for (let y = 0; y < NUM_TILES_Y; y++) {
                let type = 'tile_grass'

                for (let loc of farmLocations) {
                    if (x == loc[0] && y == loc[1]) {
                        type = "tile_farm1";
                    }
                }
                
                const tile = this.add.image(x * TILE_SIZE + bounds.x, y * TILE_SIZE + bounds.y, type);
                tile.setOrigin(0, 0)
            }
        }
    }

    generateClouds() {
        // Generate clouds randomly
        const numClouds = 70;
        this.clouds = [];
        const bounds = game.cameras.main.getBounds();
        const padding = 400;

        for (let i = 0; i < numClouds; i++) {
            const cloud = this.add.sprite(0, 0, 'cloud_small');

            cloud.scale = 0.5;
            cloud.x = bounds.x + padding + Math.random() * (bounds.width - padding);
            cloud.y = bounds.y + padding + Math.random() * (bounds.height - padding);
            cloud.alpha = 0.5;
            cloud.originalAlpha = cloud.alpha;
            game.physics.add.existing(cloud, false);
            cloud.body.setCircle(150);

            this.clouds.push(cloud);
        }

        this.dragonsnakeOne.setupCollider(this.clouds);
        this.dragonsnakeTwo.setupCollider(this.clouds);
    }

    create() {
        this.iconMin = this.add.sprite(0, 0, 'icon_crossLarge');
        this.iconMax = this.add.sprite(0, 0, 'icon_crossLarge');
        this.iconMax.alpha = 0;
        this.iconMin.alpha = 0;
        this.setupKeyboard();

        // Create ground
        const { width, height } = game.sys.canvas;

        // Diagonal size of screen 
        const diagonalSize = Math.sqrt(width * width + height * height);
        this.diagonalSize = diagonalSize;
        
        const WORLD_SIZE = 1024 * 2;
        this.cameras.main.setBounds(-WORLD_SIZE, -WORLD_SIZE, WORLD_SIZE * 3, WORLD_SIZE * 2);
        this.physics.world.setBounds(-WORLD_SIZE, -WORLD_SIZE, WORLD_SIZE * 3, WORLD_SIZE * 2);

        this.createPlayer();

        this.generateBackground();
        this.generateClouds();

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

    updateClouds() {
        if (this.clouds == undefined) return;
        const playerSpeed = this.dragonsnakeOne.getSpeed();

        for (let cloud of this.clouds) {
            if (cloud.speedX == undefined) {
                cloud.speedX = 0;
                cloud.speedY = 0;
                cloud.friction = 0.95;
            }

            if (cloud.collidingPieces != undefined && cloud.collidingPieces.length > 0) {
              // For each colliding piece, make the cloud move parallel to it 
              // Then add up all those velocities to make up the final distance
              for (let piece of cloud.collidingPieces) {
                  const angle = (piece.angle - 180) * (Math.PI/180);
                  const power = 0.15;
                  // cloud.speedX += Math.cos(angle) * power;
                  // cloud.speedY += Math.sin(angle) * power;
                  cloud.speedX = Math.cos(angle) * playerSpeed;
                  cloud.speedY = Math.sin(angle) * playerSpeed;
              }
            }

            cloud.x += cloud.speedX;
            cloud.y += cloud.speedY;
            cloud.speedX *= cloud.friction;
            cloud.speedY *= cloud.friction;

            cloud.collidingPieces = [];
        }
    }

    updateSoloCamera() {
        const camera = this.cameras.main;
        const { min, max } = this.dragonsnakeOne.bounds();

        const padding = 800;
        const dx = Math.abs(max.x - min.x) + padding;
        const dy = Math.abs(max.y - min.y) + padding;

        const targetZoomH = (camera.height / dy);
        const targetZoomW = (camera.width / dx);

        let targetZoom = Math.min(targetZoomH, targetZoomW);
        if (targetZoom > 0.6) targetZoom = 0.6;

        camera.zoom += (targetZoom - camera.zoom) * 0.05;

        const cx = (max.x + min.x) / 2;
        const cy = (max.y + min.y) / 2;
       
        camera.centerOn(cx, cy);
    }

    updateDualCamera() {
        const camera = this.cameras.main;
        const head1 = this.dragonsnakeOne.head;
        const head2 = this.dragonsnakeTwo.head;

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

        const padding = 800;
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

    update () {
        document.querySelector("#fps").innerHTML = `fps: ${Math.round(this.game.loop.actualFps)}`;

        this.dragonsnakeOne.update();
        //this.dragonsnakeTwo.update();

        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.dragonsnakeOne.reset();
            this.dragonsnakeTwo.reset();
        }

        

        if (isSoloMode) {
            this.updateSoloCamera();
        } else {
            this.updateDualCamera();
        }

        


        this.updateClouds();
    }
}

export default Game;