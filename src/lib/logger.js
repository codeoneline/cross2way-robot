const winston = require("winston");
// require('winston-logstash');
require('winston-daily-rotate-file');
const moment = require('moment');
const util = require('util');
const MESSAGE = Symbol.for('message');
const SPLAT = Symbol.for('splat');
require('winston-syslog').Syslog;

const logServerUrl = process.env.LOG_HOST
const logServerPort = process.env.LOG_PORT

/**
 * logger support 4 level
 * @info
 * @debug 
 * @warn 
 * @error 
 */

class Logger {
  constructor(name, file, errorFile, level = 'info') {
    this.options = {
      host: logServerUrl,
      port: logServerPort,
      type: 'RFC5424'
    };
    this.logger = winston.createLogger({
      levels: winston.config.syslog.levels,
      level: level,
      format: winston.format(function(info, opts) {
        let prefix = util.format('%s %s %s %s', "check", moment().format('YYYY-MM-DD HH:mm:ss,SSS').trim(), name, info.level.toUpperCase());
        if (info[SPLAT]) {
          info[MESSAGE] = util.format('%s %s', prefix, util.format(info.message, ...info[SPLAT]));
        } else {
          info[MESSAGE] = util.format('%s %s', prefix, util.format(info.message));
        }
        // info[MESSAGE] = `${name} ${info.level.toUpperCase()} ${info.message}`
        return info;
      })(),
      transports: [
        //
        // - Write to all logs with level `level` and below to file
        // - Write all logs error (and below) to errorFile.
        //
        new winston.transports.Syslog(this.options),
        new winston.transports.Console(),
        new(winston.transports.DailyRotateFile)({
          filename: file,
          level: level,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '50m',
          maxFiles: '30d'
        })
      ]
    });
  }

  __line() {
    let logger = this;
    try {
      const e = new Error();
      const regex = /\((.*):(\d+):(\d+)\)$/
      const errLocation = e.stack.split("\n")[2];
      const match = regex.exec(errLocation);
      if (!match) {
        return errLocation.trim();
      }
      return match[1] + ":" + match[2];
    } catch (err) {
      logger.warn("Logger::__line error");
      logger.warn(err);
      return "";
    }
  }

  debug(...params) {
    try {
      this.logger.debug(...params);
    } catch ( e ) {
      console.debug("debug", ...params)
    }
  }

  info(...params) {
    try {
      this.logger.info(...params);
    } catch ( e ) {
      console.info("info", ...params)
    }
  }

  warn(...params) {
    try {
      this.logger.warning(...params);
    } catch (e) {
      console.warn("warn", ...params)
    }
  }

  error(...params) {
    try {
      this.logger.error(...params);
    } catch (e) {
      console.error("error", ...params)
    }
  }
}

module.exports = Logger;
