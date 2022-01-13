const Joi = require("joi");
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
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
    required: true,
    trim: true,
    maxlength: 1024,
  },
  noOfVacancies: {
    type: Number,
    max: 500,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  datePublished: {
    type: Date,
  },
  status: {
    type: String, //Not Published, Accepting Applications, Short Listing, Interviews, Closed
    default: "Not Published",
  },
});

jobSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

jobSchema.set("toJSON", { virtuals: true });

const Job = mongoose.model("Job", jobSchema);

const validateJob = function (req) {
  const schema = Joi.object({
    code: Joi.string().trim().required().max(50).label("Code"),
    name: Joi.string().trim().required().max(255).label("Name"),
    description: Joi.string().trim().required().max(1024).label("Description"),
    noOfVacancies: Joi.number()
      .required()
      .integer()
      .max(500)
      .label("No of vacancies"),
    organizationId: Joi.string().required().hex(), //Joi.objectId().required().label("Organization"),
  });
  return schema.validate(req, { allowUnknown: true });
};

module.exports = {
  Job,
  validateJob,
};
