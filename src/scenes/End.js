import 'phaser';

class End extends Phaser.Scene {
    constructor(config) {
    	super('End');
    }

    makeScenario(num) {
        var W = this.game.config.width;
        var H = this.game.config.height;
        const style = { fontFamily: 'Krub, sans-serif', fontSize: 30 };
        const text = this.add.text(W/2, H/2, '', style);
        text.setOrigin(0.5, 0.5);

        if (num == 0) {
            gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Pious");
            text.text = 
`You favored those who pray to the mighty Snakedragon.

You brought them rain, and with it, peace and prosperity.

Unfortunately, the villagers stopped doing any work,
they thought prayer would solve all their problems.

And thus, they are now all dead...

(maybe you shouldn't have helped the pious farmers so much...)
`
        }
        if (num == 1) {
            gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Atheist");
            text.text = 
`You favored those who do not believe in the mighty Snakedragon.

You brought them rain, and with it, peace and prosperity.

The villagers have destroyed all their idols and temples.
If there is a god up there, it's clearly not one that listens to them.

This pissed off the mighty Snakedragon, who killed them all 
in a fit of rage.

This has made other villages much more pious. So you decide to 
pay them a visit to answer their prayer...
`
        }
         if (num == 2) {
             gameanalytics.GameAnalytics.addDesignEvent("EndScenario:CivilWar");
            text.text = 
`You treated everyone equally. All believers and non-believers of 
the mighty Snakedragon got rain, and with it, peace and prosperity.

The villagers bickered. Which faction was right? Was there really
a dragon god answering their prayers and shepherding the rain clouds?

Or was it luck?

The village broke out in civil war. They are all dead.

Maybe best to pick a side...
`
        }


        if (num == 3) {
            gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Flood");
            text.text = 
`You brought rain to many farms. Torrential rain.

Their farms flooded. And the people starved.

You were so eager to help, that they drowned in your blessing.

Or perhaps this was the intentional work of an angry Snakedragon god.

It's best to bring a little less rain to the villagers.
`
        }

        if (num == 4) {
            gameanalytics.GameAnalytics.addDesignEvent("EndScenario:Arid");
            text.text = 
`You brought very little rain to the villagers. 

They prayed, desperately, but no one answered their call for rain.

They have all starved to death.

It's best to bring a little more rain to the villagers.
`
        }

        
    }

    create(data) {
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