const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", { virtuals: true });

userSchema.methods.generateAuthToken = function () {
  const payload = { id: this._id, isAdmin: this.isAdmin, name: this.name };
  return jwt.sign(payload, config.get("jwtPrivateKey"), { expiresIn: "1d" });
};

userSchema.methods.register = async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return this.save();
};

/**
 *
 * @param {The users entered password} password
 * @returns a boolean value
 */
userSchema.methods.comparePassword = async function (password) {
  const isValidPassword = await bcrypt.compare(password, this.password);
  return isValidPassword;
};

const User = mongoose.model("User", userSchema);

const validateUser = (req) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required().label("Name"),
    email: Joi.string().min(5).max(255).required().email().label("Email"),
    password: Joi.string().min(6).max(255).required().label("Password"),
  });
  return schema.validate(req);
};

module.exports = {
  User,
  validateUser,
};
