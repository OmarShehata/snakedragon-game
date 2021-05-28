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
        let directory = 'assets/sprites/';
        this.load.atlas('player', directory + 'player.png', directory + 'player.json');

        // let audio_name = 'assets/audio/hikari_audio_sprite';
        // this.load.audioSprite('audio', audio_name + '.json', 
        //     [ audio_name + '.ogg', 
        //       audio_name + '.m4a',
        //       audio_name + '.mp3',
        //       audio_name + '.ac3' ]);


    	var loadingText = this.createText();

    	this.load.on('progress', function (value) {
    		loadingText.text = Math.round(value.toFixed(2) * 100) + " %";
    	});

    	this.load.on('complete', () => {
            loadingText.text = "Ready! Click to play";
            this.scene.start("Game");
            
            // this.input.on('pointerup', pointer => {
            //     this.scene.start("Game");
            // });
	    });
    }

    create() {

    }
}

export default Loading;