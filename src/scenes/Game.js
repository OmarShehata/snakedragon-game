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

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
        let NUM_TILES_X = width / TILE_SIZE;
        let NUM_TILES_Y = height / TILE_SIZE;
       
        const farmLocations = [
            [1, 1],
            [2, 3],
            [4, 2],
        ];

        // Create extra row of tiles because sometiems camera
        // zooms out too much in dual mode
        // NUM_TILES_Y += 3;
        // NUM_TILES_X += 3;

        const houseTypes = ['BG_TILE1', 'BG_TILE2', 'BG_TILE3', 'BG_TILE4', 'BG_TILE5', 'BG_TILE6', 'BG_TILE7', 'BG_TILE8'];

        for (let x = 0; x < NUM_TILES_X; x++) {
            for (let y = 0; y < NUM_TILES_Y; y++) {
                let type = 'BG_TILE_GRASS'

                for (let loc of farmLocations) {
                    if (x == loc[0] && y == loc[1]) {
                        type = houseTypes[Math.round(Math.random() * (houseTypes.length - 1))];
                    }
                }
                
                const tile = this.add.image(x * TILE_SIZE + bounds.x, y * TILE_SIZE + bounds.y, 'atlas', type);
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
            const cloud = this.add.sprite(0, 0, 'atlas', 'ENV_CLOUD_SMALL');
            cloud.depth = 1000;

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
        this.iconMin = this.add.sprite(0, 0, 'atlas', 'icon_crossLarge');
        this.iconMax = this.add.sprite(0, 0, 'atlas', 'icon_crossLarge');
        this.iconMax.alpha = 1;
        this.iconMin.alpha = 1;
        this.iconMin.depth = 1000;
        this.iconMax.depth = 1000;
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
        const that = this;
        if (this.clouds == undefined) return;
        const playerSpeed = this.dragonsnakeOne.getSpeed();
        for (let cloud of this.clouds) {
            if (cloud.speedX == undefined) {
                cloud.speedX = 0;
                cloud.speedY = 0;
                cloud.friction = 0.95;
                cloud.shake = false;
                cloud.Ox = cloud.x;
                cloud.Oy = cloud.y;
                cloud.shakeCounter = 0;
                cloud.rainCloudTransform = false;

                cloud.becomeRainCloud = function() {
                    console.log("Become raincloud!");
                    this.rainCloudTransform = true;
                    // Make all shaking clouds also rainclouds
                    let X = 0;
                    let Y = 0;
                    let c = 0;
                    for (let otherCloud of that.clouds) {
                        if (otherCloud.shake) {
                          otherCloud.rainCloudTransform = true;
                            X += otherCloud.x;
                            Y += otherCloud.y; 
                            c++;  
                        }
                        
                    }

                    X /= c; Y /= c;

                    for (let otherCloud of that.clouds) {
                        // See: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ease-function/
                        if (otherCloud.shake) {
                            otherCloud.setTint(0x000000);
                            let duration = 3000;
                            if (c == 1) duration = 300;
                            that.tweens.add({
                              targets: otherCloud,
                              x: { value: X, duration: duration, ease: 'Expo.easeIn' },
                              y: { value: Y, duration: duration, ease: 'Expo.easeIn' },
                              loop: 0,
                              onComplete: () => {
                                  otherCloud.alpha = 0;
                              }
                            })
                        }
                    }
                }

                cloud.resetShake = function() {
                    if (this.shake == false) return;
                    this.shake = false;
                    this.shakeCounter = 0;
                    this.x = this.Ox;
                    this.y = this.Oy;
                }
            }
             // Can't move clouds while split 
            if (isSoloMode == true && cloud.collidingPieces != undefined && cloud.collidingPieces.length > 0) {
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

            if (!cloud.rainCloudTransform) {
                cloud.x += cloud.speedX;
                cloud.y += cloud.speedY;
                cloud.speedX *= cloud.friction;
                cloud.speedY *= cloud.friction;
            }
            
            if (cloud.shake && !cloud.rainCloudTransform) {
                cloud.x = cloud.Ox + Math.random() * 20 - 10;
                cloud.y = cloud.Oy + Math.random() * 20 - 10;
                cloud.shakeCounter ++;

                if (cloud.shakeCounter > 60 * 3) {
                    // All clouds shaking in this frame are going to become a raincloud
                    cloud.becomeRainCloud();
                }
            }

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

        // this.iconMin.x = min.x;
        // this.iconMin.y = min.y;

        // this.iconMax.x = max.x;
        // this.iconMax.y = max.y;

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

    detectRainDance() {
        if (isSoloMode) {
            return;
        }

        // Visualize average X/Y
        const pos1 = this.dragonsnakeOne.averagePos();
        const pos2 = this.dragonsnakeTwo.averagePos();

        this.iconMin.x = pos1.x;
        this.iconMin.y = pos1.y;

        this.iconMax.x = pos2.x;
        this.iconMax.y = pos2.y;

        this.iconMin.alpha = 0;
        this.iconMax.alpha = 0;

        const dx = (pos1.x - pos2.x);
        const dy = (pos1.y - pos2.y);
        const distDragons = Math.sqrt(dx * dx + dy * dy);

        const averageOfAverage = {
            x: (pos1.x + pos2.x) / 2,
            y: (pos1.y + pos2.y) / 2
        };

        const thresholdForDragonCloseness = 200;
        const thresholdForCloudCloseness = 500;


        // Find all clouds close to this average of averages point. 
        for (let cloud of this.clouds) {
            const dx = (cloud.x - averageOfAverage.x);
            const dy = (cloud.y - averageOfAverage.y);
            const distClouds = Math.sqrt(dx * dx + dy * dy);

            if (distDragons < thresholdForDragonCloseness && 
                distClouds < thresholdForCloudCloseness && cloud.shake == false) {
                cloud.shake = true;
                cloud.Ox = cloud.x;
                cloud.Oy = cloud.y;
            }

            if (cloud.shake == true && !(distDragons < thresholdForDragonCloseness && distClouds < thresholdForCloudCloseness)) {
                cloud.resetShake();
            }
            
        }

        

        
    }

    update () {
        document.querySelector("#fps").innerHTML = `fps: ${Math.round(this.game.loop.actualFps)}`;

        this.dragonsnakeOne.update();
        this.dragonsnakeTwo.update();

        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.dragonsnakeOne.reset();
            this.dragonsnakeTwo.reset();
        }

        if (isSoloMode && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            isSoloMode = false;
            this.dragonsnakeTwo.isFrozen = false;
            this.dragonsnakeTwo.moveToOtherDragon(this.dragonsnakeOne);
        }

        if (!isSoloMode && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            //isSoloMode = true;
            //this.dragonsnakeTwo.isFrozen = true;
            this.dragonsnakeTwo.fadeAway();

            
        }
        if (!isSoloMode && this.dragonsnakeTwo.isFrozen) {
            isSoloMode = true;
            this.clouds.forEach(cloud => cloud.resetShake());
        }


        if (isSoloMode) {
            this.updateSoloCamera();
        } else {
            this.updateDualCamera();
        }

        this.detectRainDance();


        this.updateClouds();
    }
}

export default Game;