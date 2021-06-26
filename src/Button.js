class Button {
	constructor(options) {
		const {
			game, 
            x,
            y,
            sprite,
            onclick
		} = options;

		const button = game.add.image(x, y, 'atlas', sprite);
		button.setInteractive({ useHandCursor: true });
		button.isButton = true;
		button.onclick = onclick;
		this.sprite = button;
	}
}

function initButtons(game) {
	game.input.on('pointerover', function (event, gameObjects) {
		for (let object of gameObjects) {
			if (object.isButton) {
				object.scale = 1.1;
			}
		}
    });

    game.input.on('pointerup', (event, gameObjects) => {
        for (let object of gameObjects) {
			if (object.isButton) {
				object.onclick();
			}
		}
    });

    game.input.on('pointerout', function (event, gameObjects) {
        for (let object of gameObjects) {
			if (object.isButton) {
				object.scale = 1;
			}
		}
    });
}

export { initButtons };
export default Button;