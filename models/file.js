const Joi = require("joi");
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 255,
  },
  code: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  description: {
    type: String,
    maxlength: 1024,
  },
  url: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
      maxlength: 50,
    },
  ],
  creationDate: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model("File", fileSchema);

const validateFile = function (req) {
  const schema = Joi.object({
    filename: Joi.string()
      .trim()
      .guid({ version: "uuidv4" })
      .required()
      .label("File name"),
    subject: Joi.string().trim().max(255).label("Subject"),
    code: Joi.string().trim().max(50).label("Reference"),
    description: Joi.string().max(1024).label("Description"),
    url: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .required()
      .label("URL"),
  });
  return schema.validate(req);
};

module.exports = {
  File,
  validateFile,
};
