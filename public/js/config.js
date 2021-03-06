var Config = {};
Config.debug = true;
Config.framerate = 60;
Config.smallDeviceSizeFactor = .5;
Config.devicePerformanceFactor = .5;
Config.touch = {};
Config.touch.horizontalFactor = 1.2;
Config.touch.verticalFactor = 1.0;
Config.touch.horizontalThreshold = 50;
Config.touch.verticalThreshold = 30;
Config.rain = {};
Config.rain.density = 2;
Config.rain.densityFactorMin = 0;
Config.rain.densityFactorMax = 6;
Config.rain.angle = 40;
Config.rain.angleFactorMin = .5;
Config.rain.angleFactorMax = 1;
Config.rain.angleDecreaseFactor = .95;
Config.drop = {};
Config.drop.strokeWidth = 2;
Config.drop.speedMin = 60;
Config.drop.speedMax = 90;
Config.drop.speedFactorMin = .5;
Config.drop.speedFactorMax = 1;
Config.drop.sizeMin = 15;
Config.drop.sizeMax = 250;
Config.drop.sizeFactorMin = .5;
Config.drop.sizeFactorMax = 1;
Config.lightning = {};
Config.lightning.threshold = .9;
Config.lightning.chance = .1;
Config.lightning.duration = 6;
Config.sound = {};
Config.sound.cutOff = .2;
Config.sound.thunderInterval = 5;
(function(window) {
    if (Math.min(window.screen.width, window.screen.height) < 400) {
        var factor = Config.smallDeviceSizeFactor;
        Config.drop.strokeWidth *= factor;
        Config.drop.sizeMin *= factor;
        Config.drop.sizeMax *= factor;
    }
    if (!Device.desktop) {
        Config.rain.density *= Config.devicePerformanceFactor;
    }
}(window));