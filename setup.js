const fs = require('fs');
const puppeteer = require('puppeteer');
//const mkdirp = require('mkdirp');
//const os = require('os');
//const path = require('path');
const { setup: setupDevServer } = require('jest-dev-server');

//const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async() => {
    console.log('Starting server and launching puppeteer');
    
    await setupDevServer({
        command: `node . --port=9000`,
        launchTimeout: 50000,
        port: 9000
    });

    /* const browser = await puppeteer.launch();
    global.__BROWSER_GLOBAL__ = browser; */
}