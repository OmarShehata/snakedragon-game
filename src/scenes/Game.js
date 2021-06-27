import 'phaser';
import Dragonsnake from '../Dragonsnake.js';


let isSoloMode = true;
const FARM_TUTORIAL_RADIUS = 410;
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
        window.mute = false;
        this.numOfClouds = 0;
        this.endCounter = 0;
        this.rainDrops = [];

        this.tutorialCameraOffset = 150;
        console.log("v5");
    }

    cleanup() {
        isSoloMode = true;
        for (let cloud of this.rainClouds) {
            cloud.destroy();
        }
        this.rainClouds = [];

        for (let farm of this.farmLand) {
            farm.plot.destroy();
            farm.destroy();
        }
        this.farmLand = [];

        for (let drop of this.rainDrops) {
            drop.destroy();
        }
        this.rainDrops = [];

        this.numOfClouds = 0;
        this.endCounter = 0;
        this.tutorialCameraOffset = 150;
        this.startRainDanceTutStep = undefined;
        this.dismissSpiritTutStep = undefined;
        this.finishedCloudTutorial = undefined;
        this.initCloudsTutorial = undefined;
        this.numOfCloudsPushedInToFarm = undefined;
        this.ending = undefined
        this.initCameraForce = undefined
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
        this.MKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }


    createPlayer() {
        const { width, height } = game.sys.canvas;
        const playerX =  width / 2 - width / 4;
        const playerY =  height / 2;

        const dragonsnakeOne = new Dragonsnake(playerX, playerY, 1, this);
        const dragonsnakeTwo = new Dragonsnake( width / 2 + width / 4, height / 2, 2, this);
        dragonsnakeTwo.otherDragon = dragonsnakeOne;

        this.dragonsnakeOne = dragonsnakeOne;
        this.dragonsnakeTwo = dragonsnakeTwo;

        // Initial cloud where the dragon comes out 
        const playerCloud = this.add.sprite(480, playerY, 'atlas', 'ENV_CLOUD_BIG');
        playerCloud.depth = dragonsnakeOne.head.depth + 10;
        this.playerCloud = playerCloud;
    }

    showFarmCircles() {
        const farmCircles = this.add.graphics();
        farmCircles.lineStyle(25, 0xfff959);
        const farmRadius = FARM_TUTORIAL_RADIUS;
        farmCircles.depth = 1000;
        farmCircles.alpha = 0;

        this.tweens.add({
            targets: farmCircles,
            alpha: { value: 1, duration: 500, ease: 'Linear' },
        });

        for (let farm of this.farmLand) { 
            const { x, y } = farm.plot;
            farmCircles.beginPath();
            farmCircles.arc(x, y, farmRadius, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false, 0.02);
            farmCircles.strokePath();
            farmCircles.closePath();
        }

        this.farmCircles = farmCircles;
    }

    setupUI() {
        this.scene.get('UIScene').setupUI();
        this.scene.get('UIScene').updateCloudNumber(this.numOfClouds);

        if (this.skipTutorial != true) {
            this.scene.get('UIScene').setupTutorial();
        }
        
    }

    generateBackground() {
        const bounds = game.cameras.main.getBounds();
        const { width, height } = bounds;
        const TILE_SIZE = 1024;
        let NUM_TILES_X = width / TILE_SIZE;
        let NUM_TILES_Y = height / TILE_SIZE;
       
        const farmLocations = [
            [1, 1, true],
            [3, 2, false],
            [5, 1, true],
            [4, 0, false]
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
                        let index = Math.round(Math.random() * (houseTypes.length - 1));
                        if (x == 5) {
                            // On right edge. Pick index where statue would be visible
                            index = 5;
                        }
                        if (y == 0) {
                            // On top edge. 
                            index = 1;
                        }
                        if (x == 1) {
                            index = 0
                        }
                        if (x == 3) {
                            index = 4;
                        } 
                        type = houseTypes[index];
                        //houseTypes.splice(index, 1);
                        isFarmLand = true;
                        isPious = loc[2];
                    }
                }
                
                const tile = this.add.image(x * TILE_SIZE + bounds.x, y * TILE_SIZE + bounds.y, 'atlas', type + (isPious ? '_PIOUS' : ''));
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

        // Create border
        

        const topLeftCorner = this.add.image(bounds.x + 512, bounds.y + 512, 'atlas', 'border_corner');
        topLeftCorner.angle = 90;
        topLeftCorner.depth = 600;

        const topRightCorner = this.add.image(
            bounds.x + bounds.width - 512, 
            bounds.y + 512,
            'atlas', 'border_corner');
        topRightCorner.depth = 600;
        topRightCorner.angle = 180;

        const bottomLeftCorner = this.add.image(
            bounds.x + 512, 
            bounds.y + bounds.height - 512, 
            'atlas', 'border_corner');
        bottomLeftCorner.depth = 600;

        const bottomRightCorner = this.add.image(
            bounds.x + bounds.width - 512, 
            bounds.y + bounds.height - 512, 
            'atlas', 'border_corner');
        bottomRightCorner.depth = 600;
        bottomRightCorner.angle = -90;

        // LEFT
        let numBorderTiles = (height / 1024);
        for (let i = 1; i < numBorderTiles - 1; i++) {
            const tile = this.add.image(bounds.x + 256, bounds.y + i * 1024, 'atlas', 'border1');
            tile.setOrigin(0, 0);
            tile.angle = 90;
            tile.depth = 600;
        }
        // RIGHT
        for (let i = 1; i < numBorderTiles - 1; i++) {
            const tile = this.add.image(bounds.x + bounds.width - 256, bounds.y + i * 1024 + 1024, 'atlas', 'border1');
            tile.setOrigin(0, 0);
            tile.angle = -90;
            tile.depth = 600;
        }
        // TOP
        numBorderTiles = (width / 1024);
        for (let i = 1; i < numBorderTiles - 1; i++) {
            const tile = this.add.image(
                bounds.x + i * 1024 + 1024, 
                bounds.y + 256, 
                'atlas', 'border1');
            tile.setOrigin(0, 0);
            tile.angle = -180;
            tile.depth = 600;
        }
        // BOTTOM
        numBorderTiles = (width / 1024);
        for (let i = 1; i < numBorderTiles - 1; i++) {
            const tile = this.add.image(
                bounds.x + i * 1024, 
                bounds.y + bounds.height - 256, 
                'atlas', 'border1');
            tile.setOrigin(0, 0);
            tile.depth = 600;
        }
    }

    generateClouds() {
        // Generate clouds randomly
        const numClouds = 80;
        this.clouds = [];
        const bounds = game.cameras.main.getBounds();
        const padding = 0;
        this.numOfClouds = numClouds;

        const startX = bounds.x + 512;
        const endX = bounds.x + bounds.width - 512;
        const startY = bounds.y + 512;
        const endY = bounds.y + bounds.height - 512;

        for (let i = 0; i < numClouds; i++) {
            const cloud = this.add.sprite(0, 0, 'atlas', 'ENV_CLOUD_SMALL');
            cloud.depth = 1000;

            cloud.scale = 0.5;
            cloud.x = startX + Math.random() * (endX - startX);
            cloud.y = startY + Math.random() * (endY - startY);

            // cloud.x = bounds.x + 512 + i * 30;
            // cloud.y = bounds.y + 512 + i * 30;
            // cloud.x = bounds.x + bounds.width - 512 - i * 30;
            // cloud.y = bounds.y + bounds.height - 512 - i * 30;

            // Avoid clouds near spawn point
            const spawn = {x: 250, y: 500};
            const threshold = 500;
            let dx = cloud.x - spawn.x;
            let dy = cloud.y - spawn.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < threshold) {
                const angle = Math.atan2(dy, dx);
                cloud.x += Math.cos(angle) * threshold;
                cloud.y += Math.sin(angle) * threshold;
            }
            // And near any farms
            for (let farm of this.farmLand) { 
                dx = (farm.plot.x) - cloud.x; 
                dy = (farm.plot.y) - cloud.y; 
                dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 300) {
                    const angle = Math.atan2(dy, dx);
                    cloud.x -= Math.cos(angle) * 300;
                    cloud.y -= Math.sin(angle) * 300;
                }
            }

            cloud.alpha = 0.5;
            cloud.originalAlpha = cloud.alpha;
            game.physics.add.existing(cloud, false);
            cloud.body.setCircle(80, 40, 40);

            this.clouds.push(cloud);
        }


        this.dragonsnakeOne.setupCollider(this.clouds);
        this.dragonsnakeTwo.setupCollider(this.clouds);
    }

    create(data) {
        const skipTutorial = data.skipTutorial;
        this.skipTutorial = skipTutorial;
        this.cameras.main.fadeIn(1000);

        // Logging
        if (window.gameanalytics) gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Start, "level1");



        this.iconMin = this.add.sprite(0, 0, 'atlas', 'icon_crossLarge');
        this.iconMax = this.add.sprite(0, 0, 'atlas', 'icon_crossLarge');
        this.iconMax.alpha = 0;
        this.iconMin.alpha = 0;
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

        this.sound.pauseOnBlur = true;
        // this.windLoop1 = this.sound.playAudioSprite('audio', 'wind1', {
        //     loop: true
        // });

        // this.windLoop2 = this.sound.playAudioSprite('audio', 'wind2', {
        //     loop: true
        // });

        this.windLoop1 = this.sound.addAudioSprite('audio');
        this.windLoop1.play('wind1', { loop: true });

        this.windLoop2 = this.sound.addAudioSprite('audio');
        this.windLoop2.play('wind2', { loop: true });
        this.windLoop2.volume = 0;

        window.mute = (localStorage.getItem('mute') == "true");
        this.sound.setMute(window.mute);

        this.setupUI();
    }

    fadeOutAudio() {
        this.tweens.add({
                targets: this.windLoop1,
                volume: { value: 0, duration: 2900, ease: 'Linear' },
            });
            this.tweens.add({
                targets: this.windLoop2,
                volume: { value: 0, duration: 2900, ease: 'Linear' },
            });
    }

    crossFadeAudio(soloMode) {
        if (this.ending) return;

        const duration = 2000;

        if (!soloMode) {
            this.tweens.add({
                targets: this.windLoop1,
                volume: { value: 0, duration: duration, ease: 'Linear' },
            });
            this.tweens.add({
                targets: this.windLoop2,
                volume: { value: 1, duration: duration, ease: 'Linear' },
            });
        } else {
            this.tweens.add({
                targets: this.windLoop2,
                volume: { value: 0, duration: duration, ease: 'Linear' },
            });
            this.tweens.add({
                targets: this.windLoop1,
                volume: { value: 1, duration: duration, ease: 'Linear' },
            });
        }
    }

    getDist() {
        return {
            dist: this.dist, diagonalSize: 
            this.diagonalSize, 
        }
    }

    makeRainDrop(x, y, delayMs) {
        const rainDrop = this.add.sprite(x, y, 'atlas', 'RAIN_DROP');
        rainDrop.alpha = 0;
        rainDrop.counter = (delayMs + 1000) * 60;
        rainDrop.depth = 1000 - 1;

        this.tweens.add({
            targets: rainDrop,
            alpha: { value: 1, duration: 300, ease: 'Linear' },
            delay: delayMs
        });
        this.tweens.add({
            targets: rainDrop,
            y: { value: y + 300, duration: 1000, ease: 'Linear' },
            delay: delayMs
        });
        this.tweens.add({
            targets: rainDrop,
            alpha: { value: 0, duration: 300, ease: 'Linear' },
            delay: 600 + delayMs,
        });

        this.rainDrops.push(rainDrop);
    }

    makeRainCloud(x, y, cloudNumber) {
        const rainCloud = this.add.sprite(x, y, 'atlas', 'ENV_CLOUD_RAIN');
        rainCloud.depth = 1000;
        rainCloud.alpha = 0.7;
        // cloudNumber should be min 3, max 50
        const MAX = 50;
        let factor;
        if (cloudNumber < 3) {
            factor = 0;
        }
        else if (cloudNumber > MAX) {
            factor = 1
        } else {
            factor = (cloudNumber - 3) / (MAX - 3);
        }

        let doTutorial = false;

        if (this.startRainDanceTutStep) {
            this.startRainDanceTutStep = false;
            this.dismissSpiritTutStep = true;
            doTutorial = true;
            // Fade away yellow circles
            this.tweens.add({
                targets: this.farmCircles,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
            });
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

        

        this.numOfClouds -= cloudNumber;
        this.scene.get('UIScene').updateCloudNumber(this.numOfClouds, cloudNumber);
        let foundFarm = false;

        // Find the farmland closest to it, decide whether to move it to the next phase
        for (let farm of this.farmLand) {
            const dist = this.computeDistance(farm.plot, rainCloud);
            const cloudSize = rainCloud.scale * rainCloud.width; 
            if (dist <= cloudSize + 100) {
                const forceFlood = cloudNumber >= 20;
                this.advanceFarm(farm, forceFlood);
                foundFarm = true;
                if (doTutorial && !forceFlood) {
                    this.scene.get('UIScene').setTutorialStep('rain-on-farm');
                }
                if (doTutorial && forceFlood) {
                    this.scene.get('UIScene').setTutorialStep('flood-farm');
                }
            }

           
        }
        // If farmland is more than 10 is automatically floods

        if (doTutorial && !foundFarm) {
            this.scene.get('UIScene').setTutorialStep('rain-outside');
        }

        // Rain drops
        // The rain cloud disappears after 3000 + 3000 milliseconds
        const totalDuration = 3000 + 3000 - 1000;
        const numDrops = totalDuration / 150;
        const width = rainCloud.scale * rainCloud.width - 200;
        for (var i = 0; i < numDrops; i++) {
          this.makeRainDrop(x + Math.random() * width - width / 2, y, i * 150)
        } 
    }

    advanceFarm(farm, forceFlood) {
        if (forceFlood) {
            farm.plot.planted = true;
        }
        if (farm.plot.planted != true) {
            farm.plot.planted = true;
            farm.plot.setTexture('atlas', plotTypes.vegetables);
            this.sound.playAudioSprite('audio', 'rain');
        } else {
            farm.plot.flooded = true;
            farm.plot.setTexture('atlas', plotTypes.flooded);
            this.sound.playAudioSprite('audio', 'rain_too_much');
        }
    }

    computeDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y; 
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist;
    }

    initRainDanceTutorial() {
        this.startRainDanceTutStep = true;
    }

    advanceBeyondCloudTutorialStep() {
        const uiScene = this.scene.get('UIScene');
        if (this.finishedCloudTutorial) {
            return;
        }

        if (uiScene.tutorialStep != 1) return;

        this.finishedCloudTutorial = true;
        uiScene.setTutorialStep('finished-clouds');

        this.initRainDanceTutorial();
    }

    initCloudsTutorialDetection() {
        if (this.initCloudsTutorial) {
            return;
        }
        this.initCloudsTutorial = true;
        this.numOfCloudsPushedInToFarm = 0;

        // Mark clouds that are already in the farm circles
        for (let cloud of this.clouds) {
            for (let farm of this.farmLand) { 
                const dx = (farm.plot.x) - cloud.x; 
                const dy = (farm.plot.y) - cloud.y; 
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < FARM_TUTORIAL_RADIUS) {
                    cloud.farmTutorial = farm; 
                    //cloud.setTint(0xFF0000); 
                }
            }
        }
    }

    updateClouds() {
        const that = this;
        const bounds = this.cameras.main.getBounds();
        if (this.clouds == undefined) return;
        const playerSpeed = this.dragonsnakeOne.getSpeed();
        for (let cloud of this.clouds) {
            if (cloud.speedX == undefined) {//init cloud variables
                cloud.speedX = 0;
                cloud.speedY = 0;
                cloud.friction = 0.9;
                cloud.shake = false;
                cloud.Ox = cloud.x;
                cloud.Oy = cloud.y;
                cloud.shakeCounter = 0;
                cloud.rainCloudTransform = false;
                cloud.isOutOfBounds = false;
                cloud.distanceToClick = 200 + Math.random() * 100; 
                cloud.clickCounter = 0;
                cloud.clicked = false;
                cloud.canBeClicked = true;
                cloud.clickedFarm = undefined;

                cloud.setOutOfBounds = () => {
                    if (cloud.isOutOfBounds) {
                        return;
                    }
                    cloud.isOutOfBounds = true;
                    this.numOfClouds --;
                    this.scene.get('UIScene').updateCloudNumber(this.numOfClouds, 1);
                };

                cloud.becomeRainCloud = function() {
                    this.rainCloudTransform = true;
                    // Make all shaking clouds also rainclouds
                    let X = 0;
                    let Y = 0;
                    let c = 1;//include current cloud
                    for (let otherCloud of that.clouds) {
                        if (otherCloud.shake && otherCloud.rainCloudTransform != true) {
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
            }// end init cloud variables

            // Make clouds "click" into farms
            // But they can be unclicked after af ew seconds
            for (let farm of this.farmLand) { 
                const dx = (farm.plot.x) - cloud.x; 
                const dy = (farm.plot.y) - cloud.y; 
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < cloud.distanceToClick && cloud.canBeClicked) {
                    cloud.clicked = true;
                    cloud.clickCounter = 60 * 2;
                    cloud.canBeClicked = false;
                    cloud.clickedFarm = farm.plot;
                }

                const clickedFarm = cloud.clickedFarm;
                if (!cloud.canBeClicked && dist > cloud.distanceToClick && 
                    (clickedFarm != undefined && clickedFarm.x == farm.plot.x && clickedFarm.y == farm.plot.y)) {
                    cloud.canBeClicked = true;
                    cloud.clickedFarm = undefined;
                }
            }

            if (cloud.clicked) {
                cloud.clickCounter --;
                if (cloud.clickCounter < 0) {
                    cloud.clicked = false;
                    cloud.isColliding = false;
                }
            }


            // If tutorial is active, check if any new clouds have entered farm circles
            // And the cloud wasn't already in the circle
            if (this.initCloudsTutorial && this.finishedCloudTutorial != true) {
                for (let farm of this.farmLand) { 
                    // And if the cloud already has a farm, it's not this farm
                    const dx = (farm.plot.x) - cloud.x; 
                    const dy = (farm.plot.y) - cloud.y; 
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < FARM_TUTORIAL_RADIUS) {
                        if (cloud.farmTutorial == undefined) {
                            // All good, cloud was not already in a farm
                            this.numOfCloudsPushedInToFarm ++;
                            cloud.farmTutorial = farm;
                            if (this.numOfCloudsPushedInToFarm > 3) {
                                this.advanceBeyondCloudTutorialStep();
                            }
                        } else {
                            // Cloud was already in a farm, check if it's in a diff farm now 
                            if (cloud.farmTutorial.x != farm.x || cloud.farmTutorial.y != farm.y) {
                                this.numOfCloudsPushedInToFarm ++;
                                cloud.farmTutorial = farm;
                                if (this.numOfCloudsPushedInToFarm > 3) {
                                    this.advanceBeyondCloudTutorialStep();
                                }
                            }
                        }
                        
                    }
                }
            }

             // Can't move clouds while split 
            if (isSoloMode == true 
                && cloud.clicked != true
                && cloud.isColliding 
                && !cloud.isOutOfBounds) {
              // For each colliding piece, make the cloud move parallel to it 
              // Then add up all those velocities to make up the final distance
              // Figure out dist to dragon head 
              const head = this.dragonsnakeOne.head; 
              // const dx = head.x - cloud.x;
              // const dy = head.y - cloud.y;
              // const radiusDist = 300;
              // if (Math.abs(dx) < radiusDist && Math.abs(dy) < radiusDist) {
              //     const dist = Math.sqrt( dx * dx + dy * dy );
              //     if (dist < radiusDist) {
              //          const playerAngle = (head.angle - 180) * (Math.PI/180);
              //          const playerCloudAngle = Math.atan2(dy, dx);

              //          cloud.speedX = Math.cos(playerAngle) * playerSpeed;
              //          cloud.speedY = Math.sin(playerAngle) * playerSpeed;
              //     }
              // }

              //for (let piece of cloud.collidingPieces) {
                  const playerAngle = (head.angle - 180) * (Math.PI/180);
                  cloud.speedX = Math.cos(playerAngle) * playerSpeed;
                  cloud.speedY = Math.sin(playerAngle) * playerSpeed;
              //}
            }

            if (cloud.isOutOfBounds && cloud.alpha > 0) {
                cloud.alpha -= 0.1;
            }

            if (!cloud.rainCloudTransform) {
                cloud.x += cloud.speedX;
                cloud.y += cloud.speedY;
                cloud.speedX *= cloud.friction;
                cloud.speedY *= cloud.friction;

                // Detect if out of bounds
                if (!cloud.isOutOfBounds) {
                  if (cloud.x < bounds.x + cloud.width / 2) {
                        cloud.setOutOfBounds();
                   }  
                   if (cloud.y < bounds.y + cloud.height / 2) {
                        cloud.setOutOfBounds();
                   }  
                   if (cloud.x > bounds.x + bounds.width - cloud.width / 2) {
                        cloud.setOutOfBounds();
                   }  
                   if (cloud.y > bounds.y + bounds.height - cloud.height / 2) {
                        cloud.setOutOfBounds();
                   }  
                }
                
            }
            
            if (cloud.shake && !cloud.rainCloudTransform && !cloud.isOutOfBounds) {
                cloud.x = cloud.Ox + Math.random() * 20 - 10;
                cloud.y = cloud.Oy + Math.random() * 20 - 10;
                cloud.shakeCounter ++;

                if (cloud.shakeCounter > 60 * 3) {
                    // All clouds shaking in this frame are going to become a raincloud
                    cloud.becomeRainCloud();
                }
            }

            if (!this.dragonsnakeOne.isForwardDown() || !isSoloMode) {
                cloud.isColliding = false;
            }
        }
    }

    updateSoloCamera(force) {
        const camera = this.cameras.main;
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
           
        // Offset for tutorial 
        // if (this.scene.get('UIScene').isTutorialOn()) {
        //     camera.centerOn(cx, cy + 150);
        // } else {
        //     camera.centerOn(cx, cy);
        // }

        // Don't move camera while dragon is hovering
        if (this.dragonsnakeOne.hoverTweens != undefined && force != true) {
            //return;
        }
        // See: https://github.com/photonstorm/phaser/blob/8373e6f81a3b61c617534f1a219cbdd774385279/src/cameras/2d/BaseCamera.js#L639


        //console.log(camera.scrollY - cy);

        const targetX = cx - (camera.width * 0.5);
        const targetY = cy - (camera.height * 0.5);
        camera.scrollX += (targetX - camera.scrollX) * 0.16;
        camera.scrollY += (targetY - camera.scrollY) * 0.16;
        //camera.centerOn(cx, cy + this.tutorialCameraOffset);
        
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
        // Visualize average X/Y
        const pos1 = this.dragonsnakeOne.averagePos();
        const pos2 = this.dragonsnakeTwo.averagePos();

        // this.iconMin.x = pos1.x;
        // this.iconMin.y = pos1.y;

        // this.iconMax.x = pos2.x;
        // this.iconMax.y = pos2.y;

        this.iconMin.x = this.dragonsnakeOne.head.x;
        this.iconMin.y = this.dragonsnakeOne.head.y;

        this.iconMin.alpha = 0;
        this.iconMax.alpha = 0;

        const dx = (pos1.x - pos2.x);
        const dy = (pos1.y - pos2.y);
        const distDragons = Math.sqrt(dx * dx + dy * dy);

        const averageOfAverage = {
            x: (pos1.x + pos2.x) / 2,
            y: (pos1.y + pos2.y) / 2
        };

        const thresholdForDragonCloseness = 400;
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

            if (cloud.shake == true 
                && 
                !(distDragons < thresholdForDragonCloseness 
                    && distClouds < thresholdForCloudCloseness
                    && !isSoloMode && this.dragonsnakeOne.isForwardDown())) {
                cloud.resetShake();
            }
            
        }
        
    }

    triggerEnd() {
        if (this.ending) {
            return;
        }
        this.ending = true;
        if (window.gameanalytics) gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Complete, "level1");
        
        this.cameras.main.fade(3000, 0, 0, 0);
        this.scene.get('UIScene').destroyUI();
        const that = this;
        setTimeout(function() {
            
            //that.scene.get('UIScene').scene.stop()
            that.scene.start("End", { farmLand: that.farmLand });
            that.scene.get('Game').scene.stop();
            that.cleanup();
            that.windLoop1.stop();
            that.windLoop2.stop();

        }, 3000);

        this.fadeOutAudio();

    }

    removeTutorialCameraOffset() {
        // Allow the player to skip tutorial next time they play 
        localStorage.setItem('played-before', true);

        this.tweens.add({
            targets: this,
            tutorialCameraOffset: { value: 0, duration: 1000, ease: 'Quadratic.easeInOut' },
        });
    }

    update () {
        // Cleanup raindrops
        for (let i = 0; i < this.rainDrops.length; i++) {
            const drop = this.rainDrops[i];
            drop.counter --;
            if (drop.counter <= 0) {
                drop.destroy();
                this.rainDrops.splice(i, 1);
            }
        }

        if (document.querySelector("#fps")) {
            document.querySelector("#fps").innerHTML = `fps: ${Math.round(this.game.loop.actualFps)}`;
        }

        if (this.numOfClouds < 30 && this.endCounter == 0) {
            this.endCounter = -1;
        }

        if (this.endCounter < 0) {
            this.endCounter --;
            if (this.endCounter < -60 * 2) {
                this.triggerEnd();
            }
        }

        this.dragonsnakeOne.update();
        this.dragonsnakeTwo.update();

        // Remove spawn cloud after dragon moves enough
        if (this.playerCloud.alpha > 0 && this.dragonsnakeOne.reachedFullLength()) {
            this.playerCloud.alpha -= 0.01;
            this.scene.get('UIScene').setTutorialStep('dragon-out');
            this.initCloudsTutorialDetection();
        }

        if (Phaser.Input.Keyboard.JustDown(this.RKey) && window.secretDebugDragon == true) {
            // Trigger end screen
            this.triggerEnd();
        }

        if (Phaser.Input.Keyboard.JustDown(this.MKey)) {
            window.mute = !window.mute;
            this.sound.setMute(window.mute);
            localStorage.setItem('mute', window.mute);
        }

        if (isSoloMode && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            isSoloMode = false;
            this.crossFadeAudio(isSoloMode);
            this.dragonsnakeTwo.isFrozen = false;
            this.dragonsnakeTwo.moveToOtherDragon(this.dragonsnakeOne);
        }

        if (!isSoloMode && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            //isSoloMode = true;
            //this.dragonsnakeTwo.isFrozen = true;
            this.dragonsnakeTwo.fadeAway();

            if (this.dismissSpiritTutStep) {
                this.dismissSpiritTutStep = false;
                this.scene.get('UIScene').setTutorialStep('dismissed-rain');
            }
        }
        if (!isSoloMode && this.dragonsnakeTwo.isFrozen) {
            isSoloMode = true;
             this.crossFadeAudio(isSoloMode);
            this.clouds.forEach(cloud => cloud.resetShake());
        }


        // if (isSoloMode) {
        //     this.updateSoloCamera();
        // } else {
        //     this.updateDualCamera();
        // }
        this.updateSoloCamera();
        if (this.initCameraForce != true) {
            this.updateSoloCamera(true);
            this.initCameraForce = true;
        }

        this.detectRainDance();


        this.updateClouds();
    }
}

export default Game;