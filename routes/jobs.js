const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { Job, validateJob } = require("../models/job");
const { Organization } = require("../models/organization");

router.get("/", async (req, res) => {
  const jobs = await Job.find().select("-__v");
  res.send(jobs);
});

router.post("/", [auth, validate(validateJob)], async (req, res) => {
  const organization = await Organization.findById(req.body.organizationId);
  if (!organization) return res.status(400).send("Invalid organization.");

  let job = await Job.findOne({ code: req.body.code });
  if (job)
    return res
      .status(400)
      .send("The job with the specified code already exists.");

  job = new Job({
    code: req.body.code,
    name: req.body.name,
    description: req.body.description,
    noOfVacancies: req.body.noOfVacancies,
    organization: req.body.organizationId,
  });
  await job.save();

  res.send(job);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate({ path: "organization", select: "-__v" })
    .select("-__v");

  if (!job)
    return res.status(404).send("The job with the given ID was not found.");

  res.send(job);
});

module.exports = router;
