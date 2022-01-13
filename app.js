const express = require("express");
const app = express();
const path = require("path");

//to serve files from the public directory
app.use("/static", express.static(path.join(__dirname, "public")));

require("./startup/cors")(app);
require("./startup/morgan")(app);
require("./startup/validation")();
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/config")();
require("./startup/db")();

module.exports = app;
