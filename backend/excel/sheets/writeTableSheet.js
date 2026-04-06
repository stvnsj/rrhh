const { buildStyles } = require("../styles/workbookStyles");

function applyStyle(cell, ...styles) {
  for (const style of styles) {
    if (!style) continue;

    if (style.font) {
      cell.font = { ...(cell.font || {}), ...style.font };
    }

    if (style.alignment) {
      cell.alignment = { ...(cell.alignment || {}), ...style.alignment };
    }

    if (style.numFmt) {
      cell.numFmt = style.numFmt;
    }

    if (style.fill) {
      cell.fill = style.fill;
    }

    if (style.border) {
      cell.border = style.border;
    }
  }
}

function writeTableSheet(workbook, { name, columns, rows, rowStyle = null }) {
  const ws = workbook.addWorksheet(name);
  const styles = buildStyles();

  ws.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  const headerRow = ws.getRow(1);
  headerRow.height = 20;

  headerRow.eachCell((cell) => {
    applyStyle(cell, styles.header);
  });

  for (const rowData of rows) {
    const row = ws.addRow(rowData);

    row.eachCell((cell, colNumber) => {
      const column = columns[colNumber - 1];

      applyStyle(cell, styles.cell);

      if (rowStyle && styles[rowStyle]) {
        applyStyle(cell, styles[rowStyle]);
      }

      if (column?.kind === "date") {
        applyStyle(cell, styles.date);
      }

      if (column?.kind === "money") {
        applyStyle(cell, styles.money);
      }
    });
  }

    ws.autoFilter = {
    from: {
        row: 1,
        column: 1,
    },
    to: {
        row: 1,
        column: columns.length,
    },
    };

  ws.views = [{ state: "frozen", ySplit: 1 }];

  return ws;
}

module.exports = { writeTableSheet };