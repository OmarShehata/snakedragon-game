const KEYBOARD_ANGULAR_ACC = 1;
const ANGULAR_SPEED_FRICTION = 0.85;
const PLAYER_SPEED = 15;
//const PLAYER_SPEED = 1;

class Dragonsnake {
	constructor(xPos, yPos, playerNumber, game) {
		this.game = game;
		this.path = [];

		const head = game.add.sprite(xPos, yPos, 'dragon_body');
		head.setOrigin(0.5, 0.5);
		game.physics.add.existing(head, false);
		head.body.collideWorldBounds = true;

		this.headStepsArray = [];
		this.pieceArray = [];

		// Create body pieces
		const piecesNumber = 10;
		for (let i = 1; i <= piecesNumber; i++) {
			const spacing = 60;
			const piece = game.add.sprite(xPos, yPos + i * spacing, 'dragon_body');
			this.pieceArray.push(piece);

			if (i == 1) {
				piece.previous = head;
			} else {
				piece.previous = this.pieceArray[i - 2];
			}

			piece.index = i;

			piece.originalPosition = {
				x: piece.x, 
				y: piece.y
			}
		}

		this.originalPosition = { x: xPos, y: yPos };
		this.playerNumber = playerNumber;

		head.angularSpeed = 0;

		

		this.head = head;

		this.DKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.AKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.upArrowKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.WKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

		this.rightArrowKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.leftArrowKey = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
	}

	bounds() {
		// Find the min/max position of all pieces
		const allPieces = [this.head, ...this.pieceArray];

		const min = {x: this.head.x, y: this.head.y};
		const max = {x: this.head.x, y: this.head.y};

		for (let piece of allPieces) {
			if (min.x > piece.x) min.x = piece.x;
			if (min.y > piece.y) min.y = piece.y;

			if (max.x < piece.x) max.x = piece.x;
			if (max.y < piece.y) max.y = piece.y;
		}

		return { min, max };
	}

	isLeftDown() {
		if (this.playerNumber == 1) {
			return this.AKey.isDown;
		}

		if (this.playerNumber == 2) {
			return this.leftArrowKey.isDown;
		}
	}

	isForwardDown() {
		return true;
		if (this.playerNumber == 1) {
			return this.WKey.isDown;
		}

		if (this.playerNumber == 2) {
			return this.upArrowKey.isDown;
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
		const { head, headStepsArray } = this;

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
        if (this.isForwardDown()) {
        	const angle = (head.angle - 90) * (Math.PI / 180);
	        head.x += Math.cos(angle) * PLAYER_SPEED;
	        head.y += Math.sin(angle) * PLAYER_SPEED;

	        headStepsArray.push({
	        	x: head.x, 
	        	y: head.y, 
	        	angle: head.angle
	        });

	        // Make the body pieces follow the one before it
	        for (let piece of this.pieceArray) {
	        	const prev = piece.previous;

	        	const dx = prev.x - piece.x;
	        	const dy = prev.y - piece.y;
	        	const newAngle = Math.atan2(dy, dx);
	        	const dist = Math.sqrt(dx * dx + dy * dy);

	        	const distSpeed = 0.12;

	        	// piece.angle = newAngle * (180 / Math.PI) + 90;
	        	// piece.x += Math.cos(newAngle) * dist * distSpeed;
	        	// piece.y += Math.sin(newAngle) * dist * distSpeed;

	        	const step = headStepsArray[headStepsArray.length - 1 - piece.index * 4];
	        	if (step == undefined) continue;
	        	piece.x = step.x;
	        	piece.y = step.y;
	        	piece.angle = step.angle;
	        }

        } 
        

        

        // TODO: if player is out of bounds, turn torwads center
	}

	reset() {
		const { head } = this;

		head.body.setVelocityX(0);
        head.body.setVelocityY(0);
        head.setPosition(this.originalPosition.x, this.originalPosition.y);
        head.angle = 0;
        head.angularSpeed = 0;

        for (let piece of this.pieceArray) {
        	piece.x = piece.originalPosition.x;
        	piece.y = piece.originalPosition.y;
        }
	}


}

export default Dragonsnake;