import 'phaser';

class UIScene extends Phaser.Scene {
    constructor(config) {
        super({ key: 'UIScene', active: true });
        window.ui = this;
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