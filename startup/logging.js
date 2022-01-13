require("express-async-errors");
const winston = require("winston");
/* require("winston-mongodb");
const config = require("config"); */

module.exports = function () {
  //if not in production log to console
  if (process.env.NODE_ENV !== "production") {
    winston.add(
      new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true,
        format: winston.format.combine(
          winston.format.prettyPrint(),
          winston.format.colorize()
        ),
      })
    );
  } else {
    //Log to files
    winston.add(
      new winston.transports.File({
        filename: "logs/uncaughtExceptions.log",
        handleExceptions: true,
        handleRejections: true,
      })
    );

    winston.add(
      new winston.transports.File({
        filename: "logs/logfile.log",
      })
    );

    //Log to database
    /* winston.add(
      winston.transports.MongoDB({
        db: config.get("db"),
      })
    ); */
  }
};
