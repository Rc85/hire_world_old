//const rimraf = require('rimraf');
//const os = require('os');
//const path = require('path');
const { teardown: tearDownDevServer } = require('jest-dev-server');

//const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async () => {
    console.log('Teardown Puppeteer');
    
    await tearDownDevServer();
    await global.__BROWSER_GLOBAL__.close();
}