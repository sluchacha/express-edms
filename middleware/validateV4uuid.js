const { version: uuidVersion, validate: uuidValidate } = require("uuid");
module.exports = function (req, res, next) {
  const { uuid } = req.params;

  const isValid = uuidValidate(uuid) && uuidVersion(uuid) === 4;
  if (!isValid) return res.status(404).send("Invalid reference");

  next();
};
