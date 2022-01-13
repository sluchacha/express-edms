const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const validateV4uuid = require("../middleware/validateV4uuid");
const { Job } = require("../models/job");
const { Application } = require("../models/application");
const { fileExists } = require("../general/utils");
const express = require("express");
const router = express.Router();
const path = require("path");

router.get(
  "/applications/job/:id",
  [validateObjectId],
  async (req, res, next) => {
    const job = await Job.findById(req.params.id)
      .populate({ path: "organization", select: "-__v" })
      .select("-__v");

    if (!job) return res.status(400).send("Invalid Job.");

    const applications = await Application.find({
      job: req.params.id,
    })
      .populate("applicant -__v -creationDate")
      .select("-__v")
      .sort("dateOfApplication");

    if (!applications)
      return res
        .status(404)
        .send("No applications available for the given job ID.");

    const data = { job, applications };
    const pdf = require("../reports/createApplications").createReport(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=applications.pdf"
    );
    pdf.pipe(res);
    pdf.end();
  }
);

/**
 * PDF route that will serve pdf files
 */
router.get("/pdf/:uuid", validateV4uuid, async (req, res) => {
  let filepath = path.join(
    __dirname,
    "..",
    `public/docs/applications/${req.params.uuid}.pdf`
  );

  //Check if file exists
  const exists = await fileExists(filepath);
  if (!exists) return res.status(404).send("File does not exist");

  //Stream pdf files
  let file = fs.createReadStream(
    `./public/docs/applications/${req.params.uuid}.pdf`
  );

  res.setHeader("Content-Type", "application/pdf");
  file.pipe(res);
});

module.exports = router;
