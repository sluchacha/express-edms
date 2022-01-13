const express = require("express");
const helmet = require("helmet");
const error = require("../middleware/error");
const users = require("../routes/users");
const auth = require("../routes/auth");
const organizations = require("../routes/organizations");
const jobs = require("../routes/jobs");
const applicants = require("../routes/applicants");
const applications = require("../routes/applications");
const reports = require("../routes/reports");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/organizations", organizations);
  app.use("/api/jobs", jobs);
  app.use("/api/applicants", applicants);
  app.use("/api/applications", applications);
  app.use("/api/reports", reports);
  app.use(error);
};
