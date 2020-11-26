const logEngine = process.env.LOG_ENGINE
let log = null
if (logEngine === process.env.LOG_ENGINE_WINSTON) {
  const Logger = require('./logger')
  log = new Logger('osm-oracle','log/robot.log', 'log/robot_error.log', process.env.LOG_LEVEL)
  
  log.info("lib log winston init");
} else {
  const log4js = require('log4js');
  const config = require('../../config/log4js.js');
  log4js.configure(config);
  
  log = log4js.getLogger("app");
  
  log.info("lib log4js init");
}

module.exports = log;
