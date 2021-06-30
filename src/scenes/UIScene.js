import 'phaser';
import Button from '../Button.js';
import FullscreenButton from '../FullscreenButton.js';
import { initButtons } from '../Button.js';

class UIScene extends Phaser.Scene {
    constructor(config) {
        super({ key: 'UIScene', active: true });
        window.ui = this;

        this.lastTextIndex = -1;
        this.tweenArray = [];
    }

    _stopAllTweens() {
        // The disappear steps should never be added here
        // You want to add all "appear" tweens
        // so that if a disappear happens after, they don't conflict
        // and the disappear takes precedence
        for (let tween of this.tweenArray) {
            tween.stop();
        }
        this.tweenArray = [];
    }

    setTutorialStep(stepKey) {
        if (this.tutorialStep == 0 && stepKey == 'dragon-out') {
            this._stopAllTweens();
            this.tutorialStep = 1;
            this.scene.get('Game').showFarmCircles();
            // Tween in next step
            this.tweens.add({
                targets: this.tutorialPanelArray[0],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            let tween = this.tweens.add({
                targets: this.tutorialPanelArray[1],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);
            // Show farm icon
            tween = this.tweens.add({
                targets: this.farmIcon,
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);
        }

        if (this.tutorialStep == 1 && stepKey == 'finished-clouds') {
            this._stopAllTweens();
            this.tutorialStep = 2;
            this.tweens.add({
                targets: this.tutorialPanelArray[1],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            let tween = this.tweens.add({
                targets: this.tutorialPanelArray[2],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);

            // Hide previous icon and show new icon
            this.tweens.add({
                targets: this.farmIcon,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            tween = this.tweens.add({
                targets: this.dragonIcon1,
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            tween = this.tweens.add({
                targets: this.dragonIcon2,
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);
        }

        if (this.tutorialStep == 2 && stepKey == 'rain-on-farm') {
            this._stopAllTweens();
            this.tutorialStep = 3;
            this.tweens.add({
                targets: this.tutorialPanelArray[2],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.lastTextIndex = 3;
            let tween = this.tweens.add({
                targets: this.tutorialPanelArray[3],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);

            // Hide previous icon and show new icon
            this.tweens.add({
                targets: this.dragonIcon1,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });
            this.tweens.add({
                targets: this.dragonIcon2,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });
        }

        if (this.tutorialStep == 2 && stepKey == 'flood-farm') {
            this._stopAllTweens();
            this.tutorialStep = 3;
            this.tweens.add({
                targets: this.tutorialPanelArray[2],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.lastTextIndex = 5;
            let tween = this.tweens.add({
                targets: this.tutorialPanelArray[5],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);

            this.tweens.add({
                targets: this.dragonIcon1,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });
            this.tweens.add({
                targets: this.dragonIcon2,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });
        }

        if (this.tutorialStep == 2 && stepKey == 'rain-outside') {
            this._stopAllTweens();
            this.tutorialStep = 3;
            this.tweens.add({
                targets: this.tutorialPanelArray[2],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.lastTextIndex = 4;
            let tween = this.tweens.add({
                targets: this.tutorialPanelArray[4],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);

            this.tweens.add({
                targets: this.dragonIcon1,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });
            this.tweens.add({
                targets: this.dragonIcon2,
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });
        }

        if (this.tutorialStep == 3 && stepKey == 'dismissed-rain') {
            this._stopAllTweens();
            this.tutorialStep = 4;
            this.tweens.add({
                targets: this.tutorialPanelArray[this.lastTextIndex],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            let tween = this.tweens.add({
                targets: this.tutorialPanelArray[6],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            this.tweenArray.push(tween);

            // Automatically make final panel disappear
            const that = this;
            setTimeout(function() {
                that.scene.get('Game').removeTutorialCameraOffset();
                that.tweens.add({
                    targets: that.tutorialPanelArray[6],
                    alpha: { value: 0, duration: 500, ease: 'Linear' },
                });

            }, 10 * 1000)//10 seconds
        }
    }

    setupTutorial() {
        this.tutorialStep = 0;
        this.tutorialPanelArray = [];

        this._makePanel('PANEL_TUTORIAL_1');
        this._makePanel('PANEL_TUTORIAL_2');
        this._makePanel('PANEL_TUTORIAL_3_NODRAGONS');
        // index 3 (rain to farm), 4 (rain outside), 5 (flood)
        this._makePanel('PANEL_TUTORIAL_4A'); this._makePanel('PANEL_TUTORIAL_4B'); this._makePanel('PANEL_TUTORIAL_4C');
        this._makePanel('PANEL_TUTORIAL_5');

        this.tutorialPanelArray[0].alpha = 1;

        // Create the dragon dance tutorial icon
        const dragonIcon1 = this.add.image(850, 850, 'atlas', 'PANEL_TUTORIAL_DANCE_DRAGON1')
        this.dragonIcon1 = dragonIcon1;
        dragonIcon1.setOrigin(136 / 209, 104 / 181);
        dragonIcon1.alpha = 0;
        const dragonIcon2 = this.add.image(800, 850, 'atlas', 'PANEL_TUTORIAL_DANCE_DRAGON2')
        this.dragonIcon2 = dragonIcon2;
        dragonIcon2.alpha = 0;
        dragonIcon2.setOrigin(75 / 174, 75 / 209);

        this.farmIcon = this.add.image(850, 850, 'atlas', 'PANEL_TUTORIAL_FARM')
        this.farmIcon.alpha = 0;
    }

    _makePanel(name) {
        const panel = this.add.image(500, 850, 'atlas', name);
        panel.alpha = 0;
        this.tutorialPanelArray.push(panel);
    }

    toggleHelp(bool) {
        if (bool == undefined) {
            bool = !(this.helpSummary.alpha == 1);
        }
        if (bool) {
            this.closeButton.sprite.alpha = 1;
            this.helpSummary.alpha = 1;
        } else {
            this.closeButton.sprite.alpha = 0;
            this.helpSummary.alpha = 0;
        }
    }

    setupUI() {
        this.destroyed = false;
        initButtons(this);
        const fullscreenButton = new FullscreenButton(this);
        this.fullscreenButton = fullscreenButton;
        // Create help button 
        const helpButton = new Button({ 
            game: this, 
            x: 950, 
            y: 50,
            sprite: 'BUTTON__INTERROGATION',
            onclick: () => {
                this.toggleHelp();
            }
        }); 
        
        this.helpButton = helpButton;

        // Help summary
        const helpSummary = this.add.image(100, 100, 'atlas', 'PANEL_INSTRUCTIONS SUMMARY');
        helpSummary.depth = 5000;
        helpSummary.setOrigin(0, 0);
        // Close summary button 
        const closeButton = new Button({ 
            game: this, 
            x: 870, 
            y: 150,
            sprite: 'BUTTON_X',
            onclick: () => {
                 this.toggleHelp(false);
            }
        }); 
        closeButton.sprite.baseScale = 0.8;
        closeButton.sprite.scale = 0.8;
        closeButton.sprite.depth = helpSummary.depth + 1;
        helpSummary.scale = 1.1;
        this.helpSummary = helpSummary;
        this.closeButton = closeButton;
        window.closeButton = closeButton;
        this.toggleHelp(false);

        this.cameras.main.fadeIn(1000);
        const cloudIcon = this.add.image(0, 0, 'atlas', 'ENV_CLOUD_SMALL')
        cloudIcon.setScrollFactor(0);
        cloudIcon.depth = 2000;

        cloudIcon.scale = 0.4;
        const padding = 10;

        cloudIcon.x = (cloudIcon.width / 2) * cloudIcon.scale + padding;
        cloudIcon.y = (cloudIcon.height / 2) * cloudIcon.scale + padding;

        const style = { fontFamily: 'Coiny-Regular, sans-serif', fontSize: 50 };
        const text = this.add.text(cloudIcon.x + 80, cloudIcon.y - 20, '70', style);
        text.setOrigin(0.0);

        this.text = text;
        this.cloudIcon = cloudIcon;
        this.count = 0;
    }

    updateCloudNumber(num, diff) {
        this.num = num;

        if (diff == undefined) {
             this.text.text = `${num}`;
            return;
        }

        if (this.diff == undefined) {
            this.diff = diff;
        } else {
            this.diff += diff;
        }
        this.count = 60 * 5;
        
        this.text.text = `${num} (-${this.diff})`;
        
    }
    update() {
        if (this.destroyed) {
            return;
        }

        if (this.dragonIcon1) {
            this.dragonIcon1.angle += 1;
        this.dragonIcon2.angle -= 1;
        }
        //  
        

        this.count --;
        if (this.count < 0 && this.diff != undefined) {
            this.diff = undefined;
            this.text.text = String(this.num);
        }
    }

    destroyUI() {
        this.cameras.main.fade(3000, 0, 0, 0);
        setTimeout(() => {
            this.cloudIcon.destroy();
            this.text.destroy();

            this.helpSummary.destroy();
            this.closeButton.sprite.destroy();
            this.helpButton.sprite.destroy();
            this.fullscreenButton.button.sprite.destroy();
            this.destroyed = true;
        }, 3000);
        
    }
}

export default UIScene;