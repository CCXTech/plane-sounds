const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const altitudeCalculator = require('./altitudeCalculator');
const senseHatAPI = require('./senseHatAPI');
const altitudeTester = require('../testing/altitudeSenderTest');
const mqtt = require('mqtt');
//Sounds courtesy of https://www.narakeet.com/

const ROOT_TOPIC = "flightInfo/";
const MQTT_SERVER = "mqtt://localhost:1883";
const MQTT_TOPICS = [ROOT_TOPIC+"userInput"];

let mqttObj = {};


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
        this.ableToPlay = false;
        this.numSats = 0;
        this.offset = 0;
    }
    async init() {
        await this.readOffset();
        const altitude = new altitudeCalculator();
        const senseHat = new senseHatAPI();
        await altitude.setOffset(this.offset);

        altitude.on('altData', async (data) => {
            await this.HandleAltitude(data.adjustedAGLAltitude);
            console.log('Got AGL Alt: ' + data.adjustedAGLAltitude);
            this.numSats = data.numSats;
            await this.isAvailable();
            mqttObj.sendGpsData(data);
        })
        senseHat.on('verticalSpeed', async (verticalSpeed) => {
            await this.determineIfDescending(verticalSpeed);
            await this.determineIfAscending(verticalSpeed);
            console.log('Got Vertical Speed: ' + verticalSpeed);
            console.log('Is Descending: ' + this.isDescending);
            console.log('Is Ascending: ' + this.isAscending);
            console.log('Descending Signal: ' + this.decendingSignal);
            console.log('Ascending Signal: ' + this.ascendingSignal);
            mqttObj.sendVerticalSpeedData({
                verticalSpeed: verticalSpeed,
                isDescending: this.isDescending,
                isAscending: this.isAscending,
                descendingSignal: this.decendingSignal,
                ascendingSignal: this.ascendingSignal
            })
        })
        await altitude.init();
        await senseHat.init();
        await this.initMQTT();

    }

    async readOffset() {
        //Use fs to read the config json file
        const data = await fs.promises.readFile(path.join(__dirname, '../config/config.json'));
        const config = JSON.parse(data);
        this.offset = config.offset;
        return data

    }

    async writeOffset(offset) {
        const data = await this.readOffset();
        this.offset = offset;
        data.offset = this.offset;
        return fs.writeFile(path.join(__dirname, '../config/config.json'), JSON.stringify(data), (err) => {
            if (err) {
                console.log(err);
            }
        })
    }

    async initMQTT() {
        const client = mqtt.connect('mqtt://localhost:1883');
        client.on('connect', () => {
            client.subscribe(MQTT_TOPICS);
            client.on('message', async (topic, message) => {
                if (topic === ROOT_TOPIC + "userInput") {
                    const data = JSON.parse(message);
                    await this.writeOffset(data.offset);
                }
            });
            mqttObj.sendGpsData = (data) => {
                client.publish(ROOT_TOPIC + "gpsData", JSON.stringify(data));
            }
            mqttObj.sendVerticalSpeedData = (data) => {
                client.publish(ROOT_TOPIC + "verticalSpeed", JSON.stringify(data));
            }
            mqttObj.sendOffsetData = (data) => {
                client.publish(ROOT_TOPIC + "offsetInfo", JSON.stringify(data));
            }
        })
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
            console.log('Is Descending: ' + this.isDescending);
            console.log('Is Ascending: ' + this.isAscending);
            console.log('Descending Signal: ' + this.decendingSignal);
            console.log('Ascending Signal: ' + this.ascendingSignal);
        })
        await tester.decendFrom1500()
        await tester.ascendTo1500();
        await tester.flyLevel(2);
        await tester.decendFrom1500();
    }

    async isAvailable() {
        if (this.numSats > 9 && !this.ableToPlay) {
            await this.playAvailableSound();
            this.ableToPlay = true;
        } else if (this.numSats < 7 && this.ableToPlay) {
            await this.playOfflineSound();
            this.ableToPlay = false;
        }
    }

    async determineIfDescending(verticalSpeed) {
        //If we get 3 consecutive readings of negative vertical speed, we are descending
        if (verticalSpeed < 0) {
            this.decendingSignal.push(1);
            if (this.decendingSignal.length > 3) {
                this.decendingSignal.shift();
            }
        }
        else {
            this.decendingSignal = [0, 0, 0];
        }
        this.isDescending = !!this.decendingSignal.every((val, i, arr) => val > 0);
    }
    async determineIfAscending(verticalSpeed) {
        //If we get 3 consecutive readings of positive vertical speed, we are ascending
        if (verticalSpeed > 0) {
            this.ascendingSignal.push(1);
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
        if (this.isDescending && this.ableToPlay) {
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
        console.log('Reset called')
        if (this.onekPlayed && Date.now() - this.timeOneKPlayed > 20000) {
            this.onekPlayed = false;
        }
        if (this.fivehundredPlayed && Date.now() - this.timeFiveHundredPlayed > 20000) {
            this.fivehundredPlayed = false;
        }
        if (this.fourhundredPlayed && Date.now() - this.timeFourHundredPlayed > 20000) {
            this.fourhundredPlayed = false;
        }
        if (this.threehundredPlayed && Date.now() - this.timeThreeHundredPlayed > 20000) {
            this.threehundredPlayed = false;
        }
        if (this.twohundredPlayed && Date.now() - this.timeTwoHundredPlayed > 20000) {
            this.twohundredPlayed = false;
        }
        if (this.onehundredPlayed && Date.now() - this.timeOneHundredPlayed > 20000) {
            this.onehundredPlayed = false;
        }
        if (this.fiftyPlayed && Date.now() - this.timeFiftyPlayed > 20000) {
            this.fiftyPlayed = false;
        }
    }

    async playOnek() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '1000.mp3');
        this.onekPlayed = true;
        this.timeOneKPlayed = Date.now();
        console.log('Playing 1000')
    }
    async playFivehundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '500.mp3');
        this.fivehundredPlayed = true;
        this.timeFiveHundredPlayed = Date.now();
        console.log('Playing 500')
    }
    async playFourhundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '400.mp3');
        this.fourhundredPlayed = true;
        this.timeFourHundredPlayed = Date.now();
        console.log('Playing 400')
    }
    async playThreehundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '300.mp3');
        this.threehundredPlayed = true;
        this.timeThreeHundredPlayed = Date.now();
        console.log('Playing 300')
    }
    async playTwohundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '200.mp3');
        this.twohundredPlayed = true;
        this.timeTwoHundredPlayed = Date.now();
        console.log('Playing 200')
    }
    async playOnehundred() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '100.mp3');
        this.onehundredPlayed = true;
        this.timeOneHundredPlayed = Date.now();
        console.log('Playing 100')
    }
    async playFifty() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + '50.mp3');
        this.fiftyPlayed = true;
        this.timeFiftyPlayed = Date.now();
        console.log('Playing 50')
    }
    async playOfflineSound() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + 'offline.mp3');
        console.log('Playing offline')
    }
    async playAvailableSound() {
        exec('ffplay -autoexit -nodisp ' + this.filePrefix + 'available.mp3');
        console.log('Playing available')
    }
}


module.exports = annunciator;