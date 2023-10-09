const Emitter = require('events');

class altitudeSender extends Emitter {
    constructor() {
        super();
    }

    async decendFrom1500() {
        let altitude = 1500; // feet
        while (altitude > 0) {
            await this.sendAltitude(altitude);
            await this.sendVerticalSpeed(-600);
            altitude -= 10;
            await this.sleep(1000);
        }
        return 'done'
    }

    async flyLevel(time) {
        let altitude = 1500;
        let verticalSpeed = 0;
        while (time > 0) {
            await this.sendAltitude(altitude);
            await this.sendVerticalSpeed(verticalSpeed);
            time -= 1;
            await this.sleep(1000);
        }
    }

    async ascendTo1500() {
        let altitude = 0;
        while (altitude < 1500) {
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