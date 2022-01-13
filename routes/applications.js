const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { Job } = require("../models/job");
const { Application, validateApplication } = require("../models/application");
const { Applicant } = require("../models/applicant");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const router = express.Router();
const path = require("path");

const FILE_MIME_TYPES = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/bmp": "bmp",
  "application/pdf": "pdf",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let error = "Invalid file type.";

    const isValid = FILE_MIME_TYPES[file.mimetype];
    if (isValid) error = null;

    cb(error, "./public/docs/applications");
  },
  filename: function (req, file, cb) {
    // console.log(file);
    const extension = FILE_MIME_TYPES[file.mimetype];
    cb(null, `${uuidv4()}.${extension}`);
  },
});

const upload = multer({ storage });

const getBasePath = function (req) {
  return `${req.protocol}://${req.get("host")}/static/`;
};

const checkApplicationDependencies = async (req, res) => {
  const job = await Job.findById(req.body.jobId);
  if (!job) return res.status(400).send("Invalid job.");

  const applicant = await Applicant.findById(req.body.applicantId);
  if (!applicant) return res.status(400).send("Invalid applicant.");

  return [job, applicant];
};

router.get("/", [auth], async (req, res) => {
  const applications = await Application.find()
    .populate({
      path: "job",
      select: "-description -__v",
      populate: { path: "organization", select: "code name" },
    })
    .populate("applicant", "-__v -creationDate")
    .select("-__v")
    .sort("dateOfApplication");

  res.send(applications);
});

router.post("/", [auth, validate(validateApplication)], async (req, res) => {
  const [job, applicant] = await checkApplicationDependencies(req, res);

  let application = await Application.findOne({
    job: req.body.jobId,
    applicant: req.body.applicantId,
  });

  if (application)
    return res
      .status(400)
      .send(
        "A similar application has already been recorded for the given job by the said applicant."
      );

  application = new Application({
    job: job._id,
    applicant: applicant._id,
    isDisabled: req.body.isDisabled,
    qualifications: req.body.qualifications,
    ppr: req.body.ppr,
  });

  await application.save();

  res.send(application);
});

router.put(
  "/:id",
  [auth, validateObjectId, validate(validateApplication)],
  async (req, res) => {
    const [job, applicant] = await checkApplicationDependencies(req, res);

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        job: job.id,
        applicant: applicant.id,
        isDisabled: req.body.isDisabled,
        qualifications: req.body.qualifications,
        ppr: req.body.ppr,
      },
      { new: true }
    );

    if (!application)
      return res
        .status(404)
        .send("The application with the given ID was not found.");

    res.send(application);
  }
);
//Check if application with that id exists before uploading files
router.put(
  "/:id/documents",
  [
    auth,
    validateObjectId,
    upload.fields([
      { name: "cover_letter", maxCount: 1 },
      { name: "national_id", maxCount: 1 },
      { name: "is_disabled", maxCount: 1 },
      { name: "kra", maxCount: 1 },
      { name: "dci", maxCount: 1 },
      { name: "eacc", maxCount: 1 },
      { name: "helb", maxCount: 1 },
      { name: "crb", maxCount: 1 },
    ]),
  ],
  async (req, res) => {
    const count = req.files.length;
    const basePath = getBasePath(req);
    const {
      cover_letter = [],
      national_id = [],
      is_disabled = [],
      kra = [],
      dci = [],
      eacc = [],
      helb = [],
      crb = [],
    } = req.files;
    const a = [
      ...cover_letter,
      ...national_id,
      ...is_disabled,
      ...kra,
      ...dci,
      ...eacc,
      ...helb,
      ...crb,
    ];
    const files = a.map((file) => {
      const uri = `${basePath}docs/applications/${file.filename}`;
      const item = {
        title: file.fieldname.replace("_", " "),
        filename: file.filename,
        uri,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
      };
      return item;
    });

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        files,
      },
      { new: true }
    );

    if (!application)
      return res
        .status(404)
        .send("The application with the given ID was not found.");

    res.send(application);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const application = await Application.findByIdAndRemove(req.params.id);

  if (!application)
    return res
      .status(404)
      .send("The application with the given ID was not found.");

  res.send(application);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: "job",
      select: "organization name noOfVacancies",
      populate: { path: "organization", select: "name" },
    })
    .populate("applicant", "-__v -creationDate")
    .select("-__v");

  if (!application)
    return res
      .status(404)
      .send("The application with the given ID was not found.");

  res.send(application);
});

router.get("/applicant/:id", [auth, validateObjectId], async (req, res) => {
  const application = await Application.find({
    applicant: req.params.id,
  })
    .populate({
      path: "job",
      select: "-__v",
      populate: { path: "organization", select: "name" },
    })
    .select("-__v");

  if (!application)
    return res
      .status(404)
      .send("The application with the given ID was not found.");

  res.send(application);
});

router.get("/job/:id", [auth, validateObjectId], async (req, res) => {
  const application = await Application.find({
    job: req.params.id,
  }).populate("applicant -__v");

  if (!application)
    return res
      .status(404)
      .send("The application with the given ID was not found.");

  res.send(application);
});

module.exports = router;
