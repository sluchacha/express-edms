const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

const {
  Organization,
  validateOrganization,
} = require("../models/organization");

const { Job } = require("../models/job");

router.get("/", async (req, res) => {
  const organizations = await Organization.find().select("-__v").sort("name");

  res.send(organizations);
});

router.post("/", [auth, validate(validateOrganization)], async (req, res) => {
  const organization = new Organization({
    code: req.body.code,
    name: req.body.name,
    description: req.body.description,
  });
  organization.save();

  res.send(organization);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const organization = await Organization.findById(req.params.id);

  if (!organization)
    return res
      .status(404)
      .send("The organization with the given ID was not found.");

  res.send(organization);
});

router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  //Check for any related data
  const job = await Job.findOne({ organization: req.params.id });

  if (job)
    return res
      .status(404)
      .send(
        "The organization with the given ID CANNOT be deleted. There is related data."
      );

  const organization = await Organization.findByIdAndRemove(req.params.id);

  if (!organization)
    return res
      .status(404)
      .send("The organization with the given ID was not found.");

  res.send(organization);
});

module.exports = router;
