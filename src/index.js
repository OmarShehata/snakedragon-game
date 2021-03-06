import 'phaser';
import Loading from './scenes/Loading';
import Game from './scenes/Game';
import UIScene from './scenes/UIScene';
import End from './scenes/End';
import Menu from './scenes/Menu';

var game = new Phaser.Game({
    type: Phaser.AUTO, // Choose WebGL or Canvas automatically
    parent: 'game', // The ID of the div in index.html
    // width: 1120,
    // height: 630,
    width: 1000,
    height: 1000,
    backgroundColor: 'rgb(0, 0, 0)',
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT ,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            //gravity: { y: 7000 },
            debug: false
        }
    },
    scene: [Loading, Game, UIScene, End, Menu]
});

