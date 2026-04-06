function buildStyles() {
  return {
    header: {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9EAF7" },
      },
    },

    cell: {
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      alignment: { vertical: "middle" },
    },

    date: {
      numFmt: "dd/mm/yyyy",
    },

    money: {
      numFmt: '#,##0',
      alignment: { horizontal: "right" },
    },

    success: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "C9FFC4" },
      },
    },

    warning: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2CC" },
      },
    },

    error: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4CCCC" },
      },
    },
  };
}

module.exports = { buildStyles };