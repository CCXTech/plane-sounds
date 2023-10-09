const altitudeCalculator = require('./lib/altitudeCalculator');
const announciator = require('./lib/annunciator');
const emmiter = require('events');
const exec = require('child_process').exec;
const path = require('path');
const filePrefix = path.join(__dirname, 'sounds/');

const altitude = new altitudeCalculator();
let sattelites = 0;

let ann = null;


async function start() {
    await playInitialSound();



    altitude.on('numSats' , (numSats) => {
        sattelites = numSats;
        isAvailable();
    })

    await altitude.init();

}

async function isAvailable() {
    if (sattelites > 5 && ann == null) {
        await playAvailableSound();
        ann = new announciator();
        await ann.init();
    } else if (sattelites < 5 && ann != null) {
        await playOfflineSound();
        ann = null;
    }
}

async function playInitialSound() {
    await exec('ffplay -autoexit ' + filePrefix + 'init.mp3')
}

async function playOfflineSound() {
    await exec('ffplay -autoexit ' + filePrefix + 'offline.mp3')
}

async function playAvailableSound() {
    await exec('ffplay -autoexit ' + filePrefix + 'Available.mp3')
}

start();