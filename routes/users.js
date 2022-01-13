const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { User, validateUser } = require("../models/user");

/**
 * Get the currently logged user
 */
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.send(user);
});

router.post("/", validate(validateUser), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  await user.register();

  const token = user.generateAuthToken();

  res.header("x-auth-token", token).send(_.pick(user, ["id", "name", "email"]));
});

module.exports = router;
