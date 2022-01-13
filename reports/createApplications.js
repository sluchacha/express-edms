const fs = require("fs");
const PDFDocument = require("pdfkit");
const PDFTable = require("voilab-pdf-table");
const moment = require("moment");

const createReport = (data) => {
  let doc = new PDFDocument({
    size: "A4",
    margin: 50,
    layout: "landscape",
  });

  generateHeader(doc);
  generateJobInformation(doc, data);
  generateApplicationsTable(doc, data);
  generateFooter(doc);

  return doc;
  //doc.end();
  //doc.pipe(fs.createWriteStream(filepath));
};

const generateHeader = (doc) => {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Busia County Public Service Board", 0, 57, { align: "center" })
    .fontSize(10)
    .text("P.O. Box Private Bag,", 200, 50, { align: "right" })
    .text("50400, Busia,", 200, 65, { align: "right" })
    .text("Kenya.", 200, 80, { align: "right" })
    .moveDown();
};

const generateFooter = (doc) => {
  doc
    .fontSize(10)
    .text(
      `Printed On ${formatDate(new Date())}`,
      doc.page.margins.left,
      doc.page.height - 70,
      {
        align: "center",
        width: doc.page.width - doc.page.margins.right,
      }
    );
};

const generateJobInformation = (doc, { job }, y = 100) => {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Applications", 50, y)
    .fontSize(10)
    .text(`Printed On: ${formatDate(new Date())}`, 300, y + 10, {
      align: "right",
    });

  generateHr(doc, y + 25);

  const jobInfoTop = y + 25 + 15;

  doc
    .fontSize(10)
    .text(`Organization:`, 50, jobInfoTop)
    .font("Helvetica-Bold")
    .text(job.organization.name, 150, jobInfoTop)
    .font("Helvetica")
    .text(`Position:`, 50, jobInfoTop + 15)
    .font("Helvetica-Bold")
    .text(job.name, 150, jobInfoTop + 15)
    .font("Helvetica")
    .text(`Code:`, 50, jobInfoTop + 30)
    .font("Helvetica-Bold")
    .text(job.code, 150, jobInfoTop + 30)

    .font("Helvetica")
    .text(`No of vacancies:${job.noOfVacancies}`, 0, jobInfoTop + 30, {
      align: "right",
    })
    .moveDown();

  generateHr(doc, jobInfoTop + 45);
};

const generateApplicationsTable = (pdf, { applications }) => {
  pdf.moveDown();

  let table = new PDFTable(pdf, {
    bottomMargin: 30,
  });

  table
    // add some plugins (here, a 'fit-to-width' for a column)
    .addPlugin(
      new (require("voilab-pdf-table/plugins/fitcolumn"))({
        column: "qualifications",
      })
    )
    .onHeaderAdd((tb) => {
      //set header color
      pdf.font("Helvetica-Bold");
    })
    .onHeaderAdded((tb) => {
      //reset to standard color
      pdf.font("Helvetica");
    })
    // set defaults to your columns
    .setColumnsDefaults({
      headerBorder: "B", //["L", "T", "B", "R"],
      border: "B", //["L", "T", "B", "R"],
      headerBorderOpacity: 1,
      borderOpacity: 0.5,
      align: "right",
      padding: [5, 5, 5, 5],
    })
    // add table columns
    .addColumns([
      {
        id: "applicant",
        header: "Name\nID or PP.No\nDOB & Telephone",
        width: 200,
        align: "left",
        renderer: function (tb, { applicant }) {
          return `${applicant.fullname}\nID: ${
            applicant.nationalId
          }\nDOB: ${formatDate(applicant.dob)}\nTelephone: ${
            applicant.telephone
          }`;
        },
      },
      {
        id: "gender",
        header: "Gender\n&\nDisability",
        width: 50,
        cache: false, //so that you can draw
        align: "center",
        renderer: function (tb, { isDisabled, applicant }, draw, column, pos) {
          if (!draw) {
            return isDisabled
              ? `${applicant.gender}\nDISABLED`
              : applicant.gender;
          }
          tb.pdf
            .text("\n", pos.x, pos.y, { continued: false })
            .text(applicant.gender, { continued: false });
          if (isDisabled) {
            tb.pdf
              .fillColor("red")
              .text("DISABLED", { underline: false })
              .fillColor("black");
          }
        },
      },
      {
        id: "region",
        header: "County\nSub-county\nWard",
        align: "left",
        width: 100,
        renderer: function (tb, { applicant }) {
          return `${applicant.county}\n${applicant.subcounty}\n${applicant.ward}`;
        },
      },
      {
        id: "qualifications",
        header: "Qualifications",
        align: "left",
        renderer: function (tb, { qualifications }) {
          return qualifications
            .map(
              (a) => `${a.title} - ${a.grade} (${formatDate(a.attainedDate)})\n`
            )
            .join("");
        },
      },
      {
        id: "ppr",
        header: "Positions of\nProgressive\nResponsibility",
        align: "left",
        width: 100,
      },
      {
        id: "chaptersix",
        header: "Chapter\nSix\nDocuments",
        align: "left",
        cache: false, //so that you can draw
        width: 80,
        renderer: function (tb, data, draw, column, pos) {
          const files = data.files.filter(
            (a) =>
              a.title !== "COVER LETTER" &&
              a.title !== "NATIONAL ID" &&
              a.title !== "IS DISABLED"
          );
          if (files.length == 0) return "NOT ATTACHED";

          if (!draw) {
            return files.map((a) => a.title);
          }
          tb.pdf
            .text("\n", pos.x, pos.y, { continued: false })
            .fillColor("blue");
          files.map((a) => {
            tb.pdf
              .text(a.title, {
                continued: true,
                underline: true,
                link: a.uri,
              })
              .text(" ", { continued: true, underline: false });
          });
          tb.pdf.fillColor("black");
        },
      },
    ])
    // add events (here, we draw headers on each new page)
    .onPageAdded(function (tb) {
      tb.addHeader();
    })
    .onPageAdd(function (tb, row, ev) {
      tb.pdf.addPage();
      // cancel event so the automatic page add is not triggered
      ev.cancel = true;
    });

  // if no page already exists in your PDF, do not forget to add one
  //pdf.addPage();

  // draw content, by passing data to the addBody method
  table.addBody(applications);
};

const generateHr = (doc, y) => {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
};

const formatDate = (date) => {
  return moment(date).format("DD/MM/YYYY");
};

module.exports = {
  createReport,
};
