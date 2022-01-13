const Joi = require("joi");
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 255,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1024,
  },
});

organizationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

organizationSchema.set("toJSON", { virtuals: true });

const Organization = mongoose.model("Organization", organizationSchema);

const validateOrganization = function (req) {
  const Schema = Joi.object({
    code: Joi.string().trim().required().max(50).label("Code"),
    name: Joi.string().trim().required().max(255).label("Name"),
    description: Joi.string().trim().max(1024).label("Description"),
  });

  return Schema.validate(req);
};

module.exports = {
  Organization,
  validateOrganization,
};
