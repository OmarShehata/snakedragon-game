const KEYBOARD_ANGULAR_ACC = 1;
const ANGULAR_SPEED_FRICTION = 0.85;
const PLAYER_SPEED = 5;

class Dragonsnake {
	constructor(xPos, yPos, playerNumber, game) {
		this.game = game;
		const head = game.add.sprite(xPos, yPos, 'dragon_body');
		head.setOrigin(0.5, 0.5);
		this.originalPosition = { x: xPos, y: yPos };
		this.playerNumber = playerNumber;

		head.angularSpeed = 0;

		game.physics.add.existing(head, false);

		this.head = head;

		this.DKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.AKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

		this.rightArrowKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.leftArrowKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
	}

	isLeftDown() {
		if (this.playerNumber == 1) {
			return this.AKey.isDown;
		}

		if (this.playerNumber == 2) {
			return this.leftArrowKey.isDown;
		}
	}

	isRightDown() {
		if (this.playerNumber == 1) {
			return this.DKey.isDown;
		}

		if (this.playerNumber == 2) {
			return this.rightArrowKey.isDown;
		}
	}

	update() {
		const { head } = this;

        // Keyboard controls to turn
        if (this.isLeftDown()) {
            head.angularSpeed -= KEYBOARD_ANGULAR_ACC;
        }
        if (this.isRightDown()) {
            head.angularSpeed += KEYBOARD_ANGULAR_ACC;
        }

        head.angularSpeed *= ANGULAR_SPEED_FRICTION;

        head.angle += head.angularSpeed;

        // Make player move in direction they are facing 
        const angle = (head.angle - 90) * (Math.PI / 180);
        head.x += Math.cos(angle) * PLAYER_SPEED;
        head.y += Math.sin(angle) * PLAYER_SPEED;
	}

	reset() {
		const { head } = this;

		head.body.setVelocityX(0);
        head.body.setVelocityY(0);
        head.setPosition(this.originalPosition.x, this.originalPosition.y);
	}


}

export default Dragonsnake;