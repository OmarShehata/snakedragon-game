import 'phaser';
import Button from '../Button.js';
import FullscreenButton from '../FullscreenButton.js';
import { initButtons } from '../Button.js';

class Menu extends Phaser.Scene {
    constructor(config) {
    	super('Menu');

        this.frame = 0;
        this.frames = [];
        this.fadeOut = false;
        window.menuScene = this;
    }

    advance(skipTutorial) {
        const currentFrame = this.frames[this.frame];
        const nextFrame = this.frames[this.frame + 1];
        if (nextFrame == undefined) {
            if (this.fadeOut == false) {
                this.fadeOut = true;
                this.cameras.main.fadeOut(1000);
                const that = this;
                setTimeout(function() {
                    that.cleanup();
                    // FOR DEBUG
                    //that.scene.start("End", {farmLand: []});
                    
                    that.scene.start("Game", {
                        skipTutorial
                    });
                }, 1000);
            }
            return;
        }

        

        currentFrame.alpha = 0;
        nextFrame.alpha = 1;
        this.frame += 1;

        if (this.frame == 1) {
            this.dragonAnimationPieces.forEach(p => {p.alpha = 1;});
        } else {
            this.dragonAnimationPieces.forEach(p => {p.alpha = 0;});
        }
    }

    makeImage(imageName) {
        const item = this.add.image(0, 0, 'atlas', imageName);
        item.setOrigin(0);
        item.scale = (1000 / 1200);

        if (this.frames.length > 0) item.alpha = 0;

        this.frames.push(item);
    }

    cleanup() {
        for (let frame of this.frames) {
            frame.destroy();
        }
        this.frame = 0;
        this.frames = [];
        this.fadeOut = false;
    }

    create() {
         this.cameras.main.fadeIn(500);

        this.makeImage('SCREEN_TITLE')
        // this.makeImage('SCREEN_TUTORIAL_1')
        // this.makeImage('SCREEN_TUTORIAL_2')
        // this.makeImage('SCREEN_TUTORIAL_3')

        const { width, height } = game.sys.canvas;
        const screenDragon = this.add.image(width / 2 + 150, height - 300, 'atlas', 'SCREEN_DRAGON_TUTORIAL');
        screenDragon.Ox = screenDragon.x; 

        this.tweens.add({
            targets: screenDragon,
            x: { value: (width / 2 - 150), duration: 1000, ease: 'Linear' },
            loop: -1,
            loopDelay: 1000,
        });

        const cloud1 = this.add.image(width / 2 - 100, height - 300 - 30, 'atlas', 'ENV_CLOUD_SMALL');
        cloud1.scale = 0.25;
        cloud1.Ox = cloud1.x;

        const cloud2 = this.add.image(width / 2 - 150, height - 300 + 30, 'atlas', 'ENV_CLOUD_SMALL');
        cloud2.scale = 0.25;
        cloud2.Ox = cloud2.x;

        const cloud3 = this.add.image(width / 2 - 200, height - 300 + 10, 'atlas', 'ENV_CLOUD_SMALL');
        cloud3.scale = 0.25;
        cloud3.Ox = cloud3.x;
     
        this.dragonAnimationPieces = [screenDragon, cloud1, cloud2, cloud3];
        this.dragonAnimationPieces.forEach(p => {p.alpha = 0;});

        // Add play button 
        initButtons(this);
        const playButton = new Button({ 
            game: this, 
            x: width / 2, 
            y: 300,
            sprite: 'BUTTON_PLAY',
            onclick: () => {
                this.advance();
            }
        });
        window.playButton = playButton;
        
        // Add skip tutorial button 
        // Only show it if user has already played before
        const hasPlayedBefore = localStorage.getItem('played-before');
        if (hasPlayedBefore) {
            const skipTutorialButton = new Button({ 
                game: this, 
                x: 590, 
                y: 300,
                sprite: 'BUTTON_SKIP',
                onclick: () => {
                    this.advance(true);
                }
            });
            window.skipTutorialButton = skipTutorialButton;

            playButton.sprite.x = 370;
        }

        const fullscreenButton = new FullscreenButton(this);

        window.mute = (localStorage.getItem('mute') == "true");
        this.sound.setMute(window.mute);

        // this.input.on('pointerup', pointer => {
        //     this.advance();
        // });
        // this.input.keyboard.on('keydown', key => {
        //     this.advance();
        // });
    }

    update() {
        const dragon = this.dragonAnimationPieces[0];
        for (let i = 1; i < this.dragonAnimationPieces.length; i++) {
            const cloud = this.dragonAnimationPieces[i];
            if (dragon.x - dragon.width / 2 < cloud.x) {
                cloud.x = dragon.x - dragon.width / 2;
            }

            if (Math.abs(dragon.x - dragon.Ox) < 10) {
                cloud.x = cloud.Ox;
            }
        }
    }
}

export default Menu;