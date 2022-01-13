const Joi = require("joi");
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Applicant",
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  qualifications: [
    {
      type: new mongoose.Schema({
        award: {
          type: String,
          required: true,
          trim: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        grade: {
          type: String,
          required: true,
          trim: true,
        },
        attainedDate: {
          type: Date,
          required: true,
        },
      }),
    },
  ],
  ppr: {
    // Position of progressive responsibility
    type: String,
    trim: true,
    maxlength: 255,
  },
  files: [
    {
      type: new mongoose.Schema({
        title: { type: String, required: true, trim: true, uppercase: true },
        filename: { type: String, required: true },
        uri: { type: String, required: true },
        encoding: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        creationDate: { type: Date, default: Date.now },
      }),
    },
  ],
  dateOfApplication: {
    type: Date,
    default: Date.now,
  },
});

applicationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

applicationSchema.set("toJSON", { virtuals: true });

const Application = mongoose.model("Application", applicationSchema);

const validateApplication = (req) => {
  const schema = Joi.object({
    jobId: Joi.objectId().required().label("Job"), //Joi.string().required().hex(),
    applicantId: Joi.objectId().required().label("Applicant"), //Joi.string().required().hex(),
    qualifications: Joi.array().unique("title").items({
      award: Joi.string().trim().required(),
      title: Joi.string().trim().required(),
      grade: Joi.string().trim().required(),
      attainedDate: Joi.date().required(),
    }),
    ppr: Joi.string().trim(),
  });

  return schema.validate(req, { allowUnknown: true });
};

module.exports = {
  Application,
  validateApplication,
};
