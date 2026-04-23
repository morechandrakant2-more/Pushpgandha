// utils/billHelper.js

const generateBillNo = (year, quarter, flat) => {
  if (!year || !quarter || !flat) return null;
  return `${year}${quarter}B${flat}`;
};

module.exports = {
  generateBillNo
};