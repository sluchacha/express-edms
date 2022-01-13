const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { Applicant, validateApplicant } = require("../models/applicant");
const { Application } = require("../models/application");
const express = require("express");
const router = express.Router();

router.get("/", [auth], async (req, res) => {
  const applicants = await Applicant.find().select("-__v").sort("fullname");
  res.send(applicants);
});

router.post("/", [auth, validate(validateApplicant)], async (req, res) => {
  //Check if applicant exists
  let applicant = await Applicant.findOne({ nationalId: req.body.nationalId });

  if (applicant) return res.status(400).send("The applicant already exists.");

  applicant = new Applicant({
    fullname: req.body.fullname,
    nationalId: req.body.nationalId,
    dob: req.body.dob,
    telephone: req.body.telephone,
    gender: req.body.gender,
    county: req.body.county,
    subcounty: req.body.subcounty,
    ward: req.body.ward,
  });

  await applicant.save();

  res.send(applicant);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateApplicant)],
  async (req, res) => {
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      {
        fullname: req.body.fullname,
        nationalId: req.body.nationalId,
        dob: req.body.dob,
        telephone: req.body.telephone,
        gender: req.body.gender,
        county: req.body.county,
        subcounty: req.body.subcounty,
        ward: req.body.ward,
      },
      { new: true }
    );

    if (!applicant)
      return res
        .status(404)
        .send("The applicant with the given ID was not found.");

    res.send(applicant);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  //Check whether there is any related data
  const application = await Application.findOne({ applicant: req.params.id });

  if (application)
    return res
      .status(400)
      .send(
        "The applicant with the given ID CANNOT be deleted. There is related data."
      );

  const applicant = await Applicant.findByIdAndRemove(req.params.id);

  if (!applicant)
    return res
      .status(404)
      .send("The applicant with the given ID was not found.");

  res.send(applicant);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const applicant = await Applicant.findById(req.params.id).select("-__v");

  if (!applicant)
    return res
      .status(404)
      .send("The applicant with the given ID was not found.");

  res.send(applicant);
});

module.exports = router;
