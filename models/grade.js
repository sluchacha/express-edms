const Joi = require("joi");
const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  award: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Award",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
});

const Grade = mongoose.model("Award", gradeSchema);

const validateGrade = function (req) {
  const schema = Joi.object({
    awardId: Joi.objectId().required().label("Award ID"),
    name: Joi.string().trim().required().label("Name"),
  });

  return schema.validate(req, { allowUnknown: true });
};

module.exports = {
  Grade,
  validateGrade,
};
