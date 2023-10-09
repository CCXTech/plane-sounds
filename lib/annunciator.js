const exec = require('child_process').exec;
const path = require('path');
const altitudeCalculator = require('./altitudeCalculator');
const senseHatAPI = require('./senseHatAPI');
const altitudeTester = require('../testing/altitudeSenderTest');

class annunciator{
    constructor() {
        this.verticalSpeed = 0;
        this.AGLAltitude = 0;
        this.isDescending = false;
        this.decendingSignal = [0, 0, 0]
        this.isAscending = false;
        this.ascendingSignal = [0, 0, 0]
        this.onekPlayed = false;
        this.fivehundredPlayed = false;
        this.fourhundredPlayed = false;
        this.threehundredPlayed = false;
        this.twohundredPlayed = false;
        this.onehundredPlayed = false;
        this.fiftyPlayed = false;
        this.timeOneKPlayed = 0;
        this.timeFiveHundredPlayed = 0;
        this.timeFourHundredPlayed = 0;
        this.timeThreeHundredPlayed = 0;
        this.timeTwoHundredPlayed = 0;
        this.timeOneHundredPlayed = 0;
        this.timeFiftyPlayed = 0;
        this.filePrefix = path.join(__dirname, '../sounds/');
    }
    async init() {
        const altitude = new altitudeCalculator();
        const senseHat = new senseHatAPI();

        altitude.on('AGLAltitude', async (AGLAltitude) => {
            await this.HandleAltitude(AGLAltitude);
        })
        senseHat.on('verticalSpeed', async (verticalSpeed) => {
            await this.determineIfDescending(verticalSpeed);
            await this.determineIfAscending(verticalSpeed);
        })
        await altitude.init();
        await senseHat.init();

    }

    async initTest() {
        const tester = new altitudeTester();

        tester.on('AGLAltitude', async (AGLAltitude) => {
            await this.HandleAltitude(AGLAltitude);
            console.log('Got AGL Alt: ' + AGLAltitude);

        })
        tester.on('verticalSpeed', async (verticalSpeed) => {
            await this.determineIfDescending(verticalSpeed);
            await this.determineIfAscending(verticalSpeed);
            console.log('Got Vertical Speed: ' + verticalSpeed);
        })
        await tester.ascendTo3000();
        await tester.flyLevel(10);
        await tester.decendFrom3000();
    }

    async determineIfDescending(verticalSpeed) {
        //If we get 3 consecutive readings of negative vertical speed, we are descending
        if (verticalSpeed < 0) {
            this.decendingSignal.push(verticalSpeed);
            if (this.decendingSignal.length > 3) {
                this.decendingSignal.shift();
            }
        }
        else {
            this.decendingSignal = [0, 0, 0];
        }
        this.isDescending = !!this.decendingSignal.every((val, i, arr) => val < 0);
    }
    async determineIfAscending(verticalSpeed) {
        //If we get 3 consecutive readings of positive vertical speed, we are ascending
        if (verticalSpeed > 0) {
            this.ascendingSignal.push(verticalSpeed);
            if (this.ascendingSignal.length > 3) {
                this.ascendingSignal.shift();
            }
        }
        else {
            this.ascendingSignal = [0, 0, 0];
        }
        this.isAscending = !!this.ascendingSignal.every((val, i, arr) => val > 0);
        if (this.isAscending) {
            this.resetPlayed();
        }
    }

    async HandleAltitude(alt) {
        this.AGLAltitude = alt;
        if (this.isDescending) {
            if (this.AGLAltitude < 1025 && this.AGLAltitude > 975 && !this.onekPlayed) {
                await this.playOnek();
            }
            else if (this.AGLAltitude < 525 && this.AGLAltitude > 475 && !this.fivehundredPlayed) {
                await this.playFivehundred();
            }
            else if (this.AGLAltitude < 425 && this.AGLAltitude > 375 && !this.fourhundredPlayed) {
                await this.playFourhundred();
            }
            else if (this.AGLAltitude < 325 && this.AGLAltitude > 275 && !this.threehundredPlayed) {
                await this.playThreehundred();
            }
            else if (this.AGLAltitude < 225 && this.AGLAltitude > 175 && !this.twohundredPlayed) {
                await this.playTwohundred();
            }
            else if (this.AGLAltitude < 125 && this.AGLAltitude > 75 && !this.onehundredPlayed) {
                await this.playOnehundred();
            }
            else if (this.AGLAltitude < 60 && this.AGLAltitude > 10 && !this.fiftyPlayed) {
                await this.playFifty();
            }
        }

    }

    resetPlayed() {
        if (this.onekPlayed && Date.now() - this.timeOneKPlayed > 10000) {
            this.onekPlayed = false;
        }
        if (this.fivehundredPlayed && Date.now() - this.timeFiveHundredPlayed > 10000) {
            this.fivehundredPlayed = false;
        }
        if (this.fourhundredPlayed && Date.now() - this.timeFourHundredPlayed > 10000) {
            this.fourhundredPlayed = false;
        }
        if (this.threehundredPlayed && Date.now() - this.timeThreeHundredPlayed > 10000) {
            this.threehundredPlayed = false;
        }
        if (this.twohundredPlayed && Date.now() - this.timeTwoHundredPlayed > 10000) {
            this.twohundredPlayed = false;
        }
        if (this.onehundredPlayed && Date.now() - this.timeOneHundredPlayed > 10000) {
            this.onehundredPlayed = false;
        }
        if (this.fiftyPlayed && Date.now() - this.timeFiftyPlayed > 10000) {
            this.fiftyPlayed = false;
        }
    }

    async playOnek() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '1000.ogg');
        this.onekPlayed = true;
        this.timeOneKPlayed = Date.now();
        console.log('Playing 1000')
    }
    async playFivehundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '500.ogg');
        this.fivehundredPlayed = true;
        this.timeFiveHundredPlayed = Date.now();
        console.log('Playing 500')
    }
    async playFourhundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '400.ogg');
        this.fourhundredPlayed = true;
        this.timeFourHundredPlayed = Date.now();
        console.log('Playing 400')
    }
    async playThreehundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '300.ogg');
        this.threehundredPlayed = true;
        this.timeThreeHundredPlayed = Date.now();
        console.log('Playing 300')
    }
    async playTwohundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '200.ogg');
        this.twohundredPlayed = true;
        this.timeTwoHundredPlayed = Date.now();
        console.log('Playing 200')
    }
    async playOnehundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '100.ogg');
        this.onehundredPlayed = true;
        this.timeOneHundredPlayed = Date.now();
        console.log('Playing 100')
    }
    async playFifty() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '50.ogg');
        this.fiftyPlayed = true;
        this.timeFiftyPlayed = Date.now();
        console.log('Playing 50')
    }

}

module.exports = annunciator;