const NodeEnvironment = require('jest-environment-node');
const puppeteer = require('puppeteer');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

class PuppeteerEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }

    async setup() {
        console.log('Setup Test Environment');
        await super.setup();
        const wsEndPoint = fs.readFileSync(path.join(DIR, 'wsEndPoint'), 'utf8');

        if (!wsEndPoint) {
            throw new Error('wsEndpoint not found');
        }

        this.global.__BROWSER__ = await puppeteer.connect({
            browserWSEndpoint: wsEndPoint
        });
    }

    async teardown() {
        console.log('Teardown Test Environment');
        await super.teardown();
    }

    runScript(script) {
        return super.runScript(script);
    }
}

module.exports = PuppeteerEnvironment;