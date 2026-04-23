const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

module.exports = (req, res) => {
  const { flat, year, quarter } = req.params;

  const doc = new PDFDocument({ margin: 40 });

// ----------Due date logic
  const getDueDate = (quarter, year) => {
  switch (quarter) {
    case "Q1":
    case "Q1 (APR-JUN)":
      return `30/04/${year}`;

    case "Q2":
    case "Q2 (JUL-SEP)":
      return `31/07/${year}`;

    case "Q3":
    case "Q3 (OCT-DEC)":
      return `31/10/${year}`;

    case "Q4":
    case "Q4 (JAN-MAR)":
      return `31/01/${year + 1}`;

    default:
      return "-";
  }
};
// Amount in words
  const numberToWords = (num) => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
    "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  };

  return convert(Math.floor(num));
};

  // Footer as a signature

  const drawFooter = () => {
    const bottomMargin = 50;
    const signatureY = doc.page.height - bottomMargin - 40;

    doc.moveTo(350, signatureY - 10)
       .lineTo(550, signatureY - 10)
       .stroke();

    doc.font("Helvetica");
    doc.text("For Pushpgandha Society", 350, signatureY);
    doc.text("Secretary / Chairman / Treasurer", 350, signatureY + 15);
  };

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=flat_${flat}_${year}_${quarter}.pdf`
  );

  doc.pipe(res);

  const pageHeight = doc.page.height;
  const bottomMargin = 50;

  const checkPageBreak = (height = 20) => {
    if (doc.y + height > pageHeight - bottomMargin) {
      doc.addPage();
    }
  };

  const safeNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "" : num.toFixed(2);
  };

  const addToTotal = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // ✅ FONT SETUP 
const regularFont = path.join(__dirname, "../fonts/NotoSansDevanagari-Regular.ttf"); 
const boldFont = path.join(__dirname, "../fonts/NotoSansDevanagari-Bold.ttf"); 

if (fs.existsSync(regularFont)) doc.font(regularFont);

  // ================= HEADER =================
  doc.fillColor("red")
    .fontSize(16)
    .text("पुष्पगंधा को-ऑप. हाउसिंग सोसायटी लि., ठाणे.", { align: "center" });

  doc.fillColor("black")
    .fontSize(10)
    .text("( रजि. नं. टी. एन. एच. एस. जी. टी. सी. १९४५/१९६६ - ६७ )", { align: "center" });

  doc.moveDown(0.5);

  doc.text(
    "एफ - २, सेक्टर - २, श्रीनगर पोलिस चौकी समोर, श्रीनगर, वागळे इस्टेट, ठाणे - ४०० ६०४.",
    { align: "center" }
  );

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  const today = new Date().toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.moveDown();
  doc.text(`Date: ${today}`, { align: "right" });

  doc.moveDown(0.5);
  doc.fontSize(16).text("Maintenance Bill", { align: "center" });

  doc.moveDown(0.3);

  try {
    const rows = db.prepare(`
      SELECT * FROM maintenance
      WHERE flat = ? AND year = ? AND quarter = ?
    `).all(flat, year, quarter);

    if (!rows.length) {
      doc.text("No data found");
      doc.end();
      return;
    }

    rows.forEach((u) => {
      let y = doc.y + 2;

      // ================= BILL INFO =================
      doc.rect(50, y, 500, 30).stroke();
      doc.moveTo(150, y).lineTo(150, y + 30).stroke();
      doc.moveTo(300, y).lineTo(300, y + 30).stroke();
      doc.moveTo(420, y).lineTo(420, y + 30).stroke();

      doc.fontSize(9);

      doc.text("Bill No.", 60, y + 3);
      doc.text("Bill Date", 160, y + 3);
      doc.text("Flat No.", 310, y + 3);
      doc.text("Due Date", 430, y + 3);

      const todayShort = new Date().toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      doc.text(u.bill_no || "-", 60, y + 15);
      doc.text(todayShort, 160, y + 15);
      doc.text(flat, 310, y + 15);

      const dueDate = getDueDate(quarter, parseInt(year));
      doc.text(dueDate, 430, y + 15);

      y += 40;

      // ================= PERIOD =================
      doc.rect(50, y, 500, 30).stroke();
      doc.text(`Period: ${quarter} ${year}`, 60, y + 5);
      doc.text(`Name: ${u.name}`, 60, y + 15);

      y += 40;

      // ================= TABLE =================
      const items = [
        ["All Municipal Dues", u.municipalTax],
        ["Service Charges", u.service],
        ["Sinking Fund", u.sinkingFund],
        ["Maintenance & Repair", u.maintenance],
        ["Parking Charges", u.parking],
        ["Interest Due", u.interest],
        ["Water Charges", u.water],
        ["Electricity Charges", u.electricity],
        ["Insurance", u.insurance],
        ["Non Occupancy", u.nonOccupancy],
        ["Training Fund", u.training],
        ["Adjustment", u.adjustments],
        ["Penalty Charges", u.penaltyCharges],
      ];

      let currentY = y;
      let total = 0;
      let sr = 1;

      // HEADER ROW
      doc.font("Helvetica-Bold");
      doc.rect(50, currentY, 500, 20).stroke();
      doc.text("Sr", 60, currentY + 5);
      doc.text("Description", 100, currentY + 5);
      doc.text("Amount", 420, currentY + 5, { width: 100, align: "right" });

      currentY += 20;

      doc.font("Helvetica");

      items.forEach(([name, value]) => {
        const height = 20;
        checkPageBreak(height);

        doc.rect(50, currentY, 500, height).stroke();
        doc.moveTo(80, currentY).lineTo(80, currentY + height).stroke();
        doc.moveTo(420, currentY).lineTo(420, currentY + height).stroke();

        doc.text(sr++, 60, currentY + 5);
        doc.text(name, 100, currentY + 5);

        const safeVal = safeNumber(value);

        doc.text(safeVal, 420, currentY + 5, {
          width: 100,
          align: "right",
        });

        total += addToTotal(value);

        currentY += height;
      });

      // ================= REMARK =================
      if (u.adjustmentRemark) {
        const textHeight = doc.heightOfString(u.adjustmentRemark, {
          width: 450,
        });

        const boxHeight = textHeight + 20;

        checkPageBreak(boxHeight);

        doc.rect(50, currentY, 500, boxHeight).stroke();

        doc.text("Adjustment Remark:", 60, currentY + 5);

        doc.text(u.adjustmentRemark, 60, currentY + 20, {
          width: 450,
        });

        currentY += boxHeight;
      }

      // ================= TOTAL =================
      doc.font("Helvetica-Bold");

      doc.text("Total Payable", 300, currentY + 10);
      doc.text(total.toFixed(2), 420, currentY + 10, {
        width: 100,
        align: "right",
      });

      currentY += 40;

      // ================= WORDS =================
      doc.font("Helvetica");
      const words = numberToWords(total).toUpperCase();

      doc.font("Helvetica-Bold");
      doc.text( `Amount in Words: ${words} RUPEES ONLY`, 50, currentY );
      doc.font("Helvetica");
      
      currentY += 50;
        });
      drawFooter();
      // ✅ END ONLY AFTER EVERYTHING
      doc.end();
  } catch (err) {
    console.error(err);
    doc.text("Error generating PDF");
    doc.end();
  }
};