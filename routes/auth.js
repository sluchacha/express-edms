const validate = require("../middleware/validate");
const { User } = require("../models/user");
const Joi = require("joi");
const express = require("express");
const router = express.Router();

const validateAuth = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email().label("Email"),
    password: Joi.string().min(6).max(255).required().label("Password"),
  });
  return schema.validate(req);
};

router.post("/", validate(validateAuth), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await user.comparePassword(req.body.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();

  res.send(token);
});

module.exports = router;
