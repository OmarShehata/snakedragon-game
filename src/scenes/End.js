import 'phaser';

class End extends Phaser.Scene {
    constructor(config) {
    	super('End');
        window.endScene = this;
    }

    makeImage(imageName) {
        const item = this.add.image(0, 0, 'atlas', imageName);
        item.setOrigin(0);
        item.scale = (1000 / 1200);
    }

    makeScenario(num) {
        var W = this.game.config.width;
        var H = this.game.config.height;

        const alignMap = {
            0: 'right',
            1: 'left',
            2: 'center',
            3: 'right',
            4: 'left'
        };

        const style = { 
            fontFamily: 'Roboto, sans-serif', 
            fontSize: 30,
            // stroke: '#000000',
            // strokeThickness: 10
            padding: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            align: alignMap[num]
            //fixedWidth: W * 0.8
         };
        const text = this.add.text(W/2, H/2, '', style);
        text.setOrigin(0.5, 0.5);
        text.depth = 10;
        this.text = text;
        text.alpha = 0;

        this.tweens.add({
            targets: text,
            alpha: { value: 1, duration: 3000, ease: 'Linear' },
            delay: 2000
        });

        
        if (num == 0) {
            this.makeImage('SCREEN_ENDING_BENEVOLENTGOD');

            text.y -= 150;

            if (gameanalytics) gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Pious");
            text.text = 
`You favored those who pray to the mighty Snakedragon.

You brought them rain, and with it, peace and prosperity.

Unfortunately, the villagers stopped doing any work, 
they thought prayer would solve all their problems.

And thus, they are now all dead...
`
        }
        if (num == 1) {
            this.makeImage('SCREEN_ENDING_CHAOTICDEITY');
            text.y -= 70;

            if (gameanalytics) gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Atheist");
            text.text = 
`You favored those who do not believe in the mighty Snakedragon.

You brought them rain, and with it, peace and prosperity.

The villagers destroyed all 
their idols and temples.

If there is a god up there, 
it's not one that listens to them.

Without prayers, you've lost 
the ability to summon the rain spirit.

And thus, the villagers starved...
`
        }
         if (num == 2) {
             this.makeImage('SCREEN_ENDING_EGALITARIANGOD');

             text.y -= 150;

             if (gameanalytics) gameanalytics.GameAnalytics.addDesignEvent("EndScenario:CivilWar");
            text.text = 
`You treated everyone equally. All believers and non-believers of 
the mighty Snakedragon got rain, and with it, peace and prosperity.

The villagers bickered. Which faction was right? Was there really
a dragon god answering their prayers and shepherding the rain clouds?

Or was it all just luck?

The once peaceful village descended into war and chaos...
`
        }


        if (num == 3) {
            this.makeImage('SCREEN_ENDING_STORM DRAGON');

            //text.y -= 100;
            text.x += 210;
            if (gameanalytics) gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Flood");
            text.text = 
`You brought rain to many farms. 

Torrential rain.

Their farms flooded. 
And the people starved.

You were so eager to help, 
that they drowned in your blessing.

Or perhaps this was the intentional 
work of an angry god...
`
        }

        if (num == 4) {
            this.makeImage('SCREEN_ENDING_STINGY GOD');
            text.x -= 150;

            if (gameanalytics) gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Arid");
            text.text = 
`You brought very little 
rain to the villagers. 

They prayed, desperately, 
but no one answered their call.

They have all starved to death.
`
        }

        
    }

    create(data) {
        this.cameras.main.fadeIn(1000);
        const farmLand = data.farmLand;
        let planted = 0;
        let flooded = 0;
        let arid = 0;

        let plantedPious = 0;
        let floodedPious = 0;
        let aridPious = 0;

        for (let farm of farmLand) {
            if (farm.plot.planted && !farm.plot.flooded) {
                planted ++;
                if (farm.isPious) plantedPious ++;
            }
            if (farm.plot.flooded) {
                flooded ++;
                if (farm.isPious) floodedPious ++;
            } 
            if (!farm.plot.flooded && !farm.plot.planted) {
                arid ++;
                if (farm.isPious) aridPious ++;
            }
        }

        let plantedAtheist = planted - plantedPious;
        let floodedAtheist = flooded - floodedPious;
        let aridAtheist = arid - aridPious;

        //this.sound.playAudioSprite('audio', 'end');
        this.endSong = this.sound.addAudioSprite('audio');
        this.endSong.play('end');
        this.tweens.add({
            targets: this.endSong,
            volume: { value: 1, duration: 1000, ease: 'Linear' },
        });

        console.log({
            planted, flooded, arid, 
            plantedPious, floodedPious, aridPious
        })

        if (flooded > planted) {
            // You have flooded many villagers farms
            // You were too eager to help. You have shown them your power, but now they are dead...
            this.makeScenario(3);
        }
        else if (plantedPious > plantedAtheist && planted > 0) {
            // You favored the pious, the people are dead, because prayers cannot feed them!
            this.makeScenario(0);
        }

        else if (plantedAtheist > plantedPious && planted > 0) {
            // The people have torn down their idols and temples, because clearly, prayer doesn't work
            // The snakedragon spirit is furious, and devours them all. That'll teach 'em!
            this.makeScenario(1);
        }

        else if (plantedAtheist == plantedPious && planted > 0) {
            // Both pious and non pious have found good fortune. 
            // ANd so...civil war
            this.makeScenario(2);
        }
         else {
            // You did not plant enough, the villagers are dead.
            this.makeScenario(4);
        }


    }
}

export default End;