const Joi = require("joi");
const mongoose = require("mongoose");

const awardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
});

const Award = mongoose.model("Award", awardSchema);

const validateAward = function (req) {
  const schema = Joi.object({
    name: Joi.string().trim().required().label("Name"),
  });

  return schema.validate(req, { allowUnknown: true });
};

module.exports = {
  Award,
  validateAward,
};
