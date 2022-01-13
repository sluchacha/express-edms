const Joi = require("joi");
const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 255,
  },
  nationalId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 8,
  },
  dob: {
    type: Date,
    required: true,
  },
  telephone: [{ type: String, trim: true }],
  gender: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  county: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 50,
  },
  subcounty: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 50,
  },
  ward: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 50,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
});

applicantSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

applicantSchema.set("toJSON", { virtuals: true });

const Applicant = mongoose.model("Applicant", applicantSchema);

const validateApplicant = (req) => {
  const schema = Joi.object({
    fullname: Joi.string().trim().max(255).required().label("Full Name"),
    nationalId: Joi.string().trim().min(8).required().label("National ID"),
    dob: Joi.date().required().label("DOB"),
    telephone: Joi.array().unique().min(1).items(Joi.string()),
    gender: Joi.string().trim().required().label("Gender"),
    county: Joi.string().trim().max(50).required().label("County"),
    subcounty: Joi.string().trim().max(50).required().label("Sub-county"),
    ward: Joi.string().trim().max(50).required().label("Ward"),
  });
  return schema.validate(req, { allowUnknown: true });
};

module.exports = {
  Applicant,
  validateApplicant,
};
