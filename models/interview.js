const Joi = require("joi");
const mongoose = require("mongoose");

//@TODO - Incomplete schema
const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Interview = mongoose.model("Interview", interviewSchema);

const validateInterview = function (req) {
  const schema = Joi.object({
    application: Joi.objectId().required().label("Application ID"),
    userId: Joi.objectId().required().label("User ID"),
  });

  return schema.validate(req, { allowUnknown: true });
};

module.exports = {
  Interview,
  validateInterview,
};
