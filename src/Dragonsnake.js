const KEYBOARD_ANGULAR_ACC = 1;
const ANGULAR_SPEED_FRICTION = 0.85;
const PLAYER_SPEED = 18 * 0.75;
//const PLAYER_SPEED = 1;

const SYMMETRY_MODE = true;

class Dragonsnake {
	constructor(xPos, yPos, playerNumber, game) {
		this.game = game;
		this.path = [];
		const SCALE = 0.5;

		let dragon_head_name = 'CH_DRAGON1_HEAD';
		let dragon_body_name = 'CH_DRAGON1_MIDDLE';
		let dragon_tail_name = 'CH_DRAGON1_TAIL';
		if (playerNumber == 2) {
			dragon_head_name = 'CH_DRAGON2_HEAD';
			dragon_body_name = 'CH_DRAGON2_MIDDLE';
			dragon_tail_name = 'CH_DRAGON2_TAIL';
		}

		const head = game.add.sprite(xPos, yPos, 'atlas', dragon_head_name);
		head.setOrigin(0.35, 0.5);
		game.physics.add.existing(head, false);
		head.body.collideWorldBounds = true;
		head.head = head;
		head.scale = SCALE;
		head.depth = 500 - playerNumber * 50;
		head.body.setCircle(1);

		head.headCollider = game.add.sprite(0, 0, 'atlas', 'icon_crossLarge');
		game.physics.add.existing(head.headCollider, false);
		head.headCollider.body.collideWorldBounds = true;
		head.headCollider.body.setCircle(50, -25, -25);

		if (playerNumber == 2) {
			head.alpha = 0;
		}

		this.headStepsArray = [];
		this.pieceArray = [];

		this.isFrozen = playerNumber == 2;
		this.isFadingAway = false;

		// Create body pieces
		const piecesNumber = 20;
		for (let i = 1; i <= piecesNumber; i++) {
			let spacing = 100;
			let spriteName = dragon_body_name;

			if (i == piecesNumber) {
				spriteName = dragon_tail_name;
			}

			const piece = game.add.sprite(xPos, yPos, 'atlas', spriteName);
			piece.scale = SCALE;
			piece.setOrigin(0.5, 0.5);

			piece.depth = head.depth - i;
			game.physics.add.existing(piece, false);

			if (spriteName == dragon_tail_name) {
				piece.setOrigin(0.2, 0.5);
				piece.body.setCircle(1);
			}

			this.pieceArray.push(piece);
			if (playerNumber == 2) {
				piece.alpha = 0;
			}

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

			piece.head = head;
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

	setupCollider(clouds) {
		// const allPieces = [this.head, ...this.pieceArray];
		const allPieces = [this.head.headCollider];
		const that = this;

		const collider = this.game.physics.add.collider(allPieces, clouds, (dragonPiece, cloudPiece) => {
			// Make cloud disappear
			//cloudPiece.alpha = 0;

			// Do not push clouds when going slow
			if (that.head.speedMode != 'fast') {
				return;
			}
			cloudPiece.isColliding = true;
		});

		collider.overlapOnly = true;
	}

	reachedFullLength() {
		return this.headStepsArray.length > 120;
	}

	averagePos() {
		const allPieces = [this.head, ...this.pieceArray];

		const pos = {x:0, y:0};
		for (let piece of allPieces) {
			pos.x += piece.x;
			pos.y += piece.y;
		}

		pos.x /= allPieces.length;
		pos.y /= allPieces.length;

		return pos;

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
			return this.AKey.isDown || this.leftArrowKey.isDown;
		}

		if (this.playerNumber == 2) {
			if (SYMMETRY_MODE) {
				return !(this.AKey.isDown || this.leftArrowKey.isDown);
			}
			return this.leftArrowKey.isDown;
		}
	}

	isForwardDown() {
		if (this.playerNumber == 1) {
			return this.WKey.isDown || this.upArrowKey.isDown;
		}

		if (this.playerNumber == 2) {
			if (SYMMETRY_MODE) {
				return this.WKey.isDown || this.upArrowKey.isDown;
			}
			return this.upArrowKey.isDown;
		}
	}

	isRightDown() {
		if (this.playerNumber == 1) {
			return this.DKey.isDown || this.rightArrowKey.isDown;
		}

		if (this.playerNumber == 2) {
			if (SYMMETRY_MODE) {
				return !(this.DKey.isDown || this.rightArrowKey.isDown);
			}
			return this.rightArrowKey.isDown;
		}
	}

	getSpeed() {
		return PLAYER_SPEED;
	}

	moveToOtherDragon(dragon1) {
		// Move all pieces to the other dragon's pieces
		// And clear this dragon's move array
		const allPieces = [this.head, ...this.pieceArray];
		const otherPieces = [dragon1.head, ...dragon1.pieceArray];

		for (let i = 0; i < allPieces.length; i++) {
			const piece = allPieces[i];
			const otherPiece = otherPieces[i];
			piece.x = otherPiece.x;
			piece.y = otherPiece.y;
			piece.angle = otherPiece.angle;
		}

		this.head.alpha = 1;

		this.headStepsArray = [];
	}

	fadeAway() {
		this.isFadingAway = true;
		this.fadeIndex = 0;
	}

	update() {
		const allPieces = [this.head, ...this.pieceArray];

		if (this.isFrozen) {
			// Move this to the other dragon
			// To make the camera transition from "dual" to "solo"
			const otherDragon = this.otherDragon.head;

			for (let piece of allPieces) {
				piece.alpha = 0;

				const dx = otherDragon.x - piece.x; 
				const dy = otherDragon.y - piece.y; 
				const dist = Math.sqrt(dx * dx + dy * dy);
				const angle = Math.atan2(dy, dx);
				piece.x += Math.cos(angle) * dist * 0.05;
				piece.y += Math.sin(angle) * dist * 0.05;
			}

			return;
		}

		if (this.isFadingAway) {
			let allIsInvisible = true;

			for (let i = 0; i < allPieces.length; i++) {
				const piece = allPieces[i];
				if (piece.alpha > 0) {
					piece.alpha -= 0.05;
					allIsInvisible = false;
				}
				
			}

			if (allIsInvisible) {
				this.isFadingAway = false;
				this.isFrozen = true;

				if (this.hoverTweens != undefined) {
					for (let tween of this.hoverTweens) {
			    		tween.stop();
			    	}
					this.hoverTweens = undefined;
				}
				return;
			}
		}

		const { head, headStepsArray } = this;

        // Keyboard controls to turn
        if (this.isLeftDown() && this.isForwardDown()) {
            head.angularSpeed -= KEYBOARD_ANGULAR_ACC;
        }
        if (this.isRightDown() && this.isForwardDown()) {
            head.angularSpeed += KEYBOARD_ANGULAR_ACC;
        }

        if (this.isForwardDown()) {
        	head.angularSpeed *= ANGULAR_SPEED_FRICTION;
        	head.angle += head.angularSpeed;
        }
        

        // Make player move in direction they are facing
        let speed = PLAYER_SPEED * 0.0;
        head.speedMode = 'slow'
        if (this.isForwardDown()) {
        	speed = PLAYER_SPEED;
        	head.speedMode = 'fast'
        }

        // Make dragon hover when not moving
        if (speed == 0 && this.hoverTweens == undefined) {
        	this.hoverTweens = [];
        	for (let piece of allPieces) {
        		piece.originalY = piece.y;
        		const tween = this.game.tweens.add({
	                targets: piece,
	                y: { value: piece.y - 20, duration: 1500, ease: 'Cubic.easeInOut' },
	                loop: -1,
	                yoyo: true
	            });

	            this.hoverTweens.push(tween);
        	}
        } 
        // Destroy hover tween when dragon is moving 
        if (this.hoverTweens != undefined && speed != 0) {
        	for (let tween of this.hoverTweens) {
        		tween.stop();
        	}
        	// Offset all the steps' Y based on how much the head.y - its originalY
        	// this is so that when you exit the tween it doesn't jump 
        	// for (let piece of allPieces) {
        	// 	piece.y = piece.originalY;
        	// 	piece.originalY = undefined;
        	// }
        	const diffY = head.originalY - head.y;
        	for (let step of headStepsArray) {
        		step.y -= diffY;
        	}
        	this.hoverTweens = undefined;
        }
        if (this.hoverTweens != undefined) {
        	return;
        }



        const angle = (head.angle + 180) * (Math.PI / 180);
        head.x += Math.cos(angle) * speed;
        head.y += Math.sin(angle) * speed;
        head.headCollider.x = head.x + Math.cos(angle) * 100;
        head.headCollider.y = head.y + Math.sin(angle) * 100;

        if (this.isForwardDown()) {
	        headStepsArray.push({
	        	x: head.x, 
	        	y: head.y, 
	        	angle: head.angle
	        });
	    }

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

        	const step = headStepsArray[headStepsArray.length - 1 - piece.index * 6];
        	if (step == undefined) {
        		if (!this.isFadingAway) piece.alpha = 0;
        		continue;
        	}
        	if (!this.isFadingAway) piece.alpha = 1;
        	piece.x = step.x;
        	piece.y = step.y;
        	piece.angle = step.angle;
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