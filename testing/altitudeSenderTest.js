const Emitter = require('events');

class altitudeSender extends Emitter {
    constructor() {
        super();
    }

    async decendFrom3000() {
        let altitude = 3000; // feet
        while (altitude > 0) {
            await this.sendAltitude(altitude);
            await this.sendVerticalSpeed(-600);
            altitude -= 10;
            await this.sleep(1000);
        }
        return 'done'
    }

    async flyLevel(time) {
        let altitude = 3000;
        let verticalSpeed = 0;
        while (time > 0) {
            await this.sendAltitude(altitude);
            await this.sendVerticalSpeed(verticalSpeed);
            time -= 1;
            await this.sleep(1000);
        }
    }

    async ascendTo3000() {
        let altitude = 0;
        while (altitude < 3000) {
            await this.sendAltitude(altitude);
            await this.sendVerticalSpeed(1500);
            altitude += 25;
            await this.sleep(1000);
        }
    }

    async sendAltitude(altitude) {
        this.emit('AGLAltitude', altitude);
    }
    async sendVerticalSpeed(verticalSpeed) {
        this.emit('verticalSpeed', verticalSpeed);
    }

    async sleep(ms) {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, ms)
        })
    }
}

module.exports = altitudeSender;