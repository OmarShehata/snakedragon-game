import 'phaser';

class UIScene extends Phaser.Scene {
    constructor(config) {
        super({ key: 'UIScene', active: true });
        window.ui = this;

        this.lastTextIndex = -1;
    }

    _debugRemoveTutorial() {
        for (let t of this.textObjectArray) {
            t.alpha = 0;
        }

        this.textOverlay.alpha = 0;
        this.tutorialStep = -1;
    }

    setTutorialStep(stepKey) {
        if (this.tutorialStep == 0 && stepKey == 'dragon-out') {
            this.tutorialStep = 1;
            this.scene.get('Game').showFarmCircles();
            // Tween in next step
            this.tweens.add({
                targets: this.textObjectArray[0],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.tweens.add({
                targets: this.textObjectArray[1],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
        }

        if (this.tutorialStep == 1 && stepKey == 'finished-clouds') {
            this.tutorialStep = 2;
            this.tweens.add({
                targets: this.textObjectArray[1],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.tweens.add({
                targets: this.textObjectArray[2],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
        }

        if (this.tutorialStep == 2 && stepKey == 'rain-on-farm') {
            this.tutorialStep = 3;
            this.tweens.add({
                targets: this.textObjectArray[2],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.lastTextIndex = 3;
            this.tweens.add({
                targets: this.textObjectArray[3],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
        }

        if (this.tutorialStep == 2 && stepKey == 'flood-farm') {
            this.tutorialStep = 3;
            this.tweens.add({
                targets: this.textObjectArray[2],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.lastTextIndex = 5;
            this.tweens.add({
                targets: this.textObjectArray[5],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
        }

        if (this.tutorialStep == 2 && stepKey == 'rain-outside') {
            this.tutorialStep = 3;
            this.tweens.add({
                targets: this.textObjectArray[2],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.lastTextIndex = 4;
            this.tweens.add({
                targets: this.textObjectArray[4],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
        }

        if (this.tutorialStep == 3 && stepKey == 'dismissed-rain') {
            this.tutorialStep = 4;
            this.tweens.add({
                targets: this.textObjectArray[this.lastTextIndex],
                alpha: { value: 0, duration: 500, ease: 'Linear' },
                delay: 0
            });

            this.tweens.add({
                targets: this.textObjectArray[6],
                alpha: { value: 1, duration: 500, ease: 'Linear' },
                delay: 500
            });
            // Automatically make final panel disappear
            const that = this;
            setTimeout(function() {
                that.scene.get('Game').removeTutorialCameraOffset();
                that.tweens.add({
                    targets: that.textObjectArray[6],
                    alpha: { value: 0, duration: 500, ease: 'Linear' },
                });

                that.tweens.add({
                    targets: that.textOverlay,
                    alpha: { value: 0, duration: 500, ease: 'Linear' },
                });


            }, 3000)
        }
    }

    isTutorialOn() {
        return true;
    }

    setupTutorial() {
        this.tutorialStep = 0;
        this.textObjectArray = [];

        const textOverlay = this.add.image(0, 700, 'atlas', 'tutorial-overlay');
        textOverlay.setOrigin(0, 0);
        textOverlay.alpha = 0.7;
        this.textOverlay = textOverlay;

        const X = 200;
        const Y = 750;
        const style = { 
            fontFamily: 'Krub, sans-serif', 
            fontSize: 50, 
            align: 'center',
            //backgroundColor: 'rgba(255, 0, 0, 0.3)',
             };
        const t1 =  
`Move with W or UP

Turn with A/D or left/right
        `;
        const textObject = this.add.text(X, Y, t1, style);
        //textObject.setOrigin(0.0);
        this.textObjectArray.push(textObject);

        // Step two text
const t2 = 
`Push clouds onto farms

(into the marked yellow circles)`;
        const textStep2 = this.add.text(X, Y, t2, style);
        textStep2.alpha = 0;
        this.textObjectArray.push(textStep2);

        const t3 = 
`Press SPACE to toggle rain spirit
Dance together tight for 3 seconds
 near clouds to make it rain 
 (TODO: show image)`;
        const textStep3 = this.add.text(X - 80, Y, t3, style);
        textStep3.alpha = 0;
        this.textObjectArray.push(textStep3);


        // index 3
        const  tRainOnFarm = 
`You brought rain to the farm!
Press SPACE again to remove rain spirit`;
        const tRainOnFarm_text = this.add.text(X - 100, Y, tRainOnFarm, style);
        tRainOnFarm_text.alpha = 0;
        this.textObjectArray.push(tRainOnFarm_text);
        // 4
        const  tRainOutside = 
`You brought rain, but not on the farm...
Press SPACE again to remove rain spirit`;
        const tRainOutside_text = this.add.text(X - 100, Y, tRainOutside, style);
        tRainOutside_text.alpha = 0;
        this.textObjectArray.push(tRainOutside_text);
        // 5
        const  tFlood = 
`You flooded the farm! Try using less clouds
Press SPACE again to remove rain spirit`;
        const tFlood_text = this.add.text(X - 100, Y, tFlood, style);
        tFlood_text.alpha = 0;
        this.textObjectArray.push(tFlood_text);


        // 6
        const  bringRainToFollowers = 
`Bring rain to your followers
Or don't up to you! (Show idols in farms)`;
        const bringRainToFollowers_text = this.add.text(X, Y, bringRainToFollowers, style);
        bringRainToFollowers_text.alpha = 0;
        this.textObjectArray.push(bringRainToFollowers_text);
    }

    setupUI() {
        this.cameras.main.fadeIn(1000);
        const cloudIcon = this.add.image(0, 0, 'atlas', 'ENV_CLOUD_SMALL')
        cloudIcon.setScrollFactor(0);
        cloudIcon.depth = 2000;

        cloudIcon.scale = 0.4;
        const padding = 10;

        cloudIcon.x = (cloudIcon.width / 2) * cloudIcon.scale + padding;
        cloudIcon.y = (cloudIcon.height / 2) * cloudIcon.scale + padding;

        const style = { fontFamily: 'Krub, sans-serif', fontSize: 50 };
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
        this.count --;
        if (this.count < 0 && this.diff != undefined) {
            this.diff = undefined;
            this.text.text = String(this.num);
        }
    }

    destroyUI() {
        this.cameras.main.fade(3000, 0, 0, 0);
        // this.cloudIcon.destroy();
        // this.text.destroy();
    }
}

export default UIScene;