import Button from './Button.js';

class FullscreenButton {
	constructor(game) {

		const { width, height } = game.sys.canvas;
		this.game = game;
		
		const button = new Button({
			game,
			x: width - 50,
            y: height - 50,
            sprite: 'FULLSCREEN_BUTTON',
            onclick: () => {
            	this.toggleFullscreen();
            }
		});

		button.sprite.depth = 1000;

		// Make F toggle fullscreen
		const FKey = game.input.keyboard.addKey('F');
        FKey.on('down', () => {
        	this.toggleFullscreen();
        });

		this.button = button;
	}

	toggleFullscreen() {
		const game = this.game;
		if (game.scale.isFullscreen)
        {
            game.scale.stopFullscreen();
        }
        else
        {
            game.scale.startFullscreen();
        }
	}
}

export default FullscreenButton;