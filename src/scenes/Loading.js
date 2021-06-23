import 'phaser';

class Loading extends Phaser.Scene {
    constructor(config) {
    	super('Loading');
    }

    createText() {
    	var W = this.game.config.width;
    	var H = this.game.config.height;

    	var style = { fontFamily: 'Krub, sans-serif', fontSize: 60 };
    	var text = this.add.text(W/2, H/2, '0%', style);
    	text.setOrigin(0.5);

    	return text;
    }

    preload() {
        const directory = 'assets/sprites/';

        this.load.multiatlas('atlas', 'assets/sheet/sheet.json', 'assets/sheet/');

        const audio_name = 'assets/audio/audio_sprite';
        this.load.audioSprite('audio', audio_name + '.json', 
            [ audio_name + '.ogg', 
              audio_name + '.m4a',
              audio_name + '.mp3',
              audio_name + '.ac3' ]);


    	var loadingText = this.createText();

    	this.load.on('progress', function (value) {
    		loadingText.text = Math.round(value.toFixed(2) * 100) + " %";
    	});

    	this.load.on('complete', () => {
            //this.scene.start("End", {farmLand: []});
            this.cameras.main.fadeOut(500);
            const that = this;
            setTimeout(function() {
                that.scene.start("Menu");
            }, 500)
            
	    });
    }

    create() {

    }
}

export default Loading;