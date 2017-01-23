// load config
let config = require('../../config');
let LOG = config.log;

// util
function log(logStr) {
    if (LOG) {
        console.log(logStr);
    }
}

module.exports = {
    log: log
}
