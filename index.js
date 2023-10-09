const exec = require('child_process').exec;
const path = require('path');
const filePrefix = path.join(__dirname, 'sounds/');
const annunciator = require('./lib/annunciator.js');

async function start() {
    await playInitialSound();
    await sleep(5000);

    const ann = new annunciator();
    await ann.init();


}

async function playInitialSound() {
    await exec('ffplay -autoexit ' + filePrefix + 'init.mp3')
}

async function sleep(ms) {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, ms)
    })
}

start();