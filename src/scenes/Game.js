import 'phaser';
import Dragonsnake from '../Dragonsnake.js';
let isSoloMode = true;
const plotTypes = {
    'empty': 'ENV_PLOT_EMPTY',
    'vegetables': 'ENV_PLOT_VEGETABLES',
    'flooded': 'ENV_PLOT_FLOODED'
}

class Game extends Phaser.Scene {
    constructor(config) {
    	super('Game');
        window.game = this;
        this.rainClouds = [];
        this.farmLand = [];
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
            [1, 1, true],
            [2, 3, false],
            [4, 2, true],
            [5, 0, false]
        ];

        // Create extra row of tiles because sometiems camera
        // zooms out too much in dual mode
        // NUM_TILES_Y += 3;
        // NUM_TILES_X += 3;

        const houseTypes = ['BG_TILE1', 'BG_TILE2', 'BG_TILE3', 'BG_TILE4', 'BG_TILE5', 'BG_TILE6', 'BG_TILE7', 'BG_TILE8'];
        const plotOffsets = {
            BG_TILE1: {x: 180, y: 400},
            BG_TILE2: {x: 166, y: 630},
            BG_TILE3: {x: 440, y: 390, rotated: true},
            BG_TILE4: {x: 630, y: 350, rotated: true},
            BG_TILE5: {x: 180, y: 400},
            BG_TILE6: {x: 166, y: 630},
            BG_TILE7: {x: 440, y: 390, rotated: true},
            BG_TILE8: {x: 630, y: 350, rotated: true},
        }

        const plotSize = {width: 370, height: 297}

        for (let x = 0; x < NUM_TILES_X; x++) {
            for (let y = 0; y < NUM_TILES_Y; y++) {
                let type = 'BG_TILE_GRASS'
                let isFarmLand = false;
                let isPious;

                for (let loc of farmLocations) {
                    if (x == loc[0] && y == loc[1]) {
                        const index = Math.round(Math.random() * (houseTypes.length - 1));
                        type = houseTypes[index];
                        houseTypes.splice(index, 1);
                        isFarmLand = true;
                        isPious = loc[2];
                    }
                }
                
                const tile = this.add.image(x * TILE_SIZE + bounds.x, y * TILE_SIZE + bounds.y, 'atlas', type);
                tile.setOrigin(0, 0);

                if (isFarmLand) {
                    this.farmLand.push(tile);
                    const offset = plotOffsets[type];
                    tile.plot = this.add.image(
                        tile.x + offset.x + plotSize.width / 2, 
                        tile.y + offset.y + plotSize.height / 2, 
                        'atlas', plotTypes.empty);
                    tile.isPious = isPious;

                    if (offset.rotated) {
                        tile.plot.angle = 90;
                    }
                }
            }
        }
    }

    generateClouds() {
        // Generate clouds randomly
        const numClouds = 100;
        this.clouds = [];
        const bounds = game.cameras.main.getBounds();
        const padding = 400;

        for (let i = 0; i < numClouds; i++) {
            const cloud = this.add.sprite(0, 0, 'atlas', 'ENV_CLOUD_SMALL');
            cloud.depth = 1000;

            cloud.scale = 0.5;
            cloud.x = bounds.x + padding + Math.random() * (bounds.width - padding);
            cloud.y = bounds.y + padding + Math.random() * (bounds.height - padding);

            // cloud.x =  Math.random() * 500 - 1000;
            // cloud.y =  Math.random() * 500 - 1000;

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

    makeRainCloud(x, y, cloudNumber) {
        const rainCloud = this.add.sprite(x, y, 'atlas', 'ENV_CLOUD_RAIN');
        rainCloud.depth = 1000;
        rainCloud.alpha = 0.7;
        // cloudNumber should be min 3, max 15
        const MAX = 15;
        let factor;
        if (cloudNumber < 3) {
            factor = 0;
        }
        else if (cloudNumber > MAX) {
            factor = 1
        } else {
            factor = (cloudNumber - 3) / (MAX - 3);
        }

        rainCloud.scale = 0.25 + factor * 0.75;
        this.rainClouds.push(rainCloud);

        // Make it float a bit and then disappear 
        const duration = 2000;
        this.tweens.add({
          targets: rainCloud,
          y: { value: y - 20, duration: duration, ease: 'Quadratic.easeInOut' },
          loop: -1,
          yoyo: true
        });

        this.tweens.add({
          targets: rainCloud,
          alpha: { value: 0, duration: 3000, ease: 'Linear' },
          delay: 3000
        });

        // Find the farmland closest to it, decide whether to move it to the next phase
        for (let farm of this.farmLand) {
            const dist = this.computeDistance(farm.plot, rainCloud);
            const cloudSize = rainCloud.scale * rainCloud.width; 
            if (dist <= cloudSize + 100) {
                const forceFlood = cloudNumber >= 10;
                this.advanceFarm(farm, forceFlood);
            }
        }
        // If farmland is more than 10 is automatically floods
    }

    advanceFarm(farm, forceFlood) {
        if (farm.plot.planted != true) {
            farm.plot.planted = true;
            farm.plot.setTexture('atlas', plotTypes.vegetables);
        } else {
            farm.plot.flooded = true;
            farm.plot.setTexture('atlas', plotTypes.flooded);
        }
    }

    computeDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y; 
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist;
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

                    let duration = 3000;
                    if (c == 1) duration = 300;

                    setTimeout(function() {
                        that.makeRainCloud(X, Y, c);
                    }, duration);

                    for (let otherCloud of that.clouds) {
                        // See: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ease-function/
                        if (otherCloud.shake) {
                            otherCloud.setTint(0x000000);
                            
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