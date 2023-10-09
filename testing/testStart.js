const annunciator = require('../lib/annunciator.js');

async function runTest() {
    const ann = new annunciator();
    await ann.initTest();
}

runTest();