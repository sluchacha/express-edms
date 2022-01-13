const fs = require("fs");

/**
 *
 * @param {*absolute path to the file} filepath
 * @returns
 */
const fileExists = async (filepath) => {
  try {
    await fs.accessSync(filepath);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  fileExists,
};
