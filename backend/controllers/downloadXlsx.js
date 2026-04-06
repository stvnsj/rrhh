



const ExcelJS = require("exceljs");

const conn = require("../services/db");
const AppError = require("../utils/AppError");
const xlsxUtils = require("../utils/exceljsUtils");

const header_row = [
  "Inicio",
  "Fin",
  "Facturas",
  "Boletas",
  "Transferencias",
  "Documentos",
  "Contratos",
  "Honorarios",
  "Finiquitos",
  "Bonos",
  "Descuentos",
  "Personal",
  "Global",
];

exports.report_xlsx = async (req, res, next) => {
  try {
    const date1 = req.body.fecha1;
    const date2 = req.body.fecha2;
    const proyecto_arr = req.body.empresaIds;

    if (!Array.isArray(proyecto_arr) || proyecto_arr.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "empresaIds debe ser un arreglo no vacío",
      });
    }

    const ids = proyecto_arr.map(Number).filter(Number.isInteger);

    if (ids.length !== proyecto_arr.length) {
      return res.status(400).json({
        status: "error",
        message: "Todos los ids deben ser enteros válidos",
      });
    }

    const valuesPlaceholders = ids.map(() => "(?)").join(", ");

    const sql_query = `
      DROP TEMPORARY TABLE IF EXISTS tmp_proyecto_id;
      CREATE TEMPORARY TABLE tmp_proyecto_id (id INT);
      INSERT INTO tmp_proyecto_id (id) VALUES ${valuesPlaceholders};
      CALL costo_report(?, ?);
    `;

    const params = [...ids, date1, date2];

    const rawResult = await new Promise((resolve, reject) => {
      conn.query(sql_query, params, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    /*
      With multipleStatements, the result usually looks like:
      [
        OkPacket,           -- DROP
        OkPacket,           -- CREATE TEMP TABLE
        OkPacket,           -- INSERT
        [ RowDataPacket... ]  or sometimes [[RowDataPacket...], OkPacket]
      ]
    */
    const lastArray = [...rawResult].reverse().find(Array.isArray);
    const reportRows = Array.isArray(lastArray?.[0]) ? lastArray[0] : lastArray;

    if (!Array.isArray(reportRows) || reportRows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No se encontraron datos para generar el reporte",
      });
    }

    const res_workbook = new ExcelJS.Workbook();

    // =========================
    // Sheet: Detalle
    // =========================
    const sheet = res_workbook.addWorksheet("Detalle");

    xlsxUtils.makeColNumFmt(
      sheet,
      [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      '"$"#,##0'
    );
    xlsxUtils.makeColWidth(sheet, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 15);

    let newRow = sheet.addRow(header_row);
    xlsxUtils.makeBorder(newRow, 1, 13);

    for (const row of reportRows.slice(0, -1)) {
      newRow = sheet.addRow([
        row["d1"],                // 1
        row["d2"],                // 2
        row["total_factura"],     // 3
        row["total_boleta"],      // 4
        row["total_transfer"],    // 5
        row["total_documento"],   // 6
        row["total_contrato"],    // 7
        row["total_honorario"],   // 8
        row["total_finiquito"],   // 9
        row["total_bono"],        // 10
        row["total_descuento"],   // 11
        row["total_personal"],    // 12
        row["total_global"],      // 13
      ]);

      xlsxUtils.makeBorder(newRow, 1, 13);

      xlsxUtils.makeFill(newRow, [1, 2], "AAAAAA");
      xlsxUtils.makeFill(newRow, [3, 4, 5], "FFF4AB");
      xlsxUtils.makeFill(newRow, [6], "FFF487");
      xlsxUtils.makeFill(newRow, [7, 8, 9, 10, 11], "C4E6FF");
      xlsxUtils.makeFill(newRow, [12], "9CD6FF");
      xlsxUtils.makeFill(newRow, [13], "FFB69E");
    }

    // =========================
    // Sheet: Total
    // =========================
    const sheet_total = res_workbook.addWorksheet("Total");
    xlsxUtils.makeColWidth(sheet_total, [1], 19);
    xlsxUtils.makeColWidth(sheet_total, [2], 15);

    const row = reportRows.at(-1);

    newRow = sheet_total.addRow(["Inicio", row["d1"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "AAAAAA");

    newRow = sheet_total.addRow(["Fin", row["d2"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "AAAAAA");

    newRow = sheet_total.addRow(["Total Facturas", row["total_factura"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "FFF4AB");

    newRow = sheet_total.addRow(["Total Boletas", row["total_boleta"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "FFF4AB");

    newRow = sheet_total.addRow(["Total Transferencias", row["total_transfer"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "FFF4AB");

    newRow = sheet_total.addRow(["F + B + T"]);
    sheet_total.getCell("B6").value = { formula: "SUM(B3:B5)" };
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "FFF566");

    newRow = sheet_total.addRow(["Total Contratos", row["total_contrato"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "C4E6FF");

    newRow = sheet_total.addRow(["Total Honorarios", row["total_honorario"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "C4E6FF");

    newRow = sheet_total.addRow(["Total Finiquitos", row["total_finiquito"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "C4E6FF");

    newRow = sheet_total.addRow(["Total Bonos", row["total_bono"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "C4E6FF");

    newRow = sheet_total.addRow(["Total Descuentos", row["total_descuento"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "C4E6FF");

    newRow = sheet_total.addRow(["Total Personal"]);
    sheet_total.getCell("B12").value = { formula: "SUM(B7:B11)" };
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "9CD6FF");

    newRow = sheet_total.addRow(["TOTAL GASTOS"]);
    sheet_total.getCell("B13").value = { formula: "B6 + B12" };
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "FFB69E");

    newRow = sheet_total.addRow(["Ingresos", row["total_ingreso"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "CDFFBD");

    newRow = sheet_total.addRow(["Utilidad", row["utilidad"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "CDFFBD");

    newRow = sheet_total.addRow(["Margen", row["margen"]]);
    xlsxUtils.makeBorder(newRow, 1, 2);
    xlsxUtils.makeFill(newRow, [1, 2], "CDFFBD");

    for (let r = 3; r <= 15; r++) {
      sheet_total.getCell(r, 2).numFmt = '"$"#,##0';
    }

    // If margen is percentage, use this instead:
    // sheet_total.getCell("B16").numFmt = '0.00%';

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="costo_report.xlsx"'
    );

    await res_workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return next(new AppError(err));
  }
};


const resumen_header_row = [
  "ID",
  "Nombre",
  "Inicio",
  "Fin",
  "Costo Real",
  "Estimación Costo",
  "Desviación Costo",
  "Precio Venta",
  "Utilidad",
  "Margen",
  "Duración",
  "Duración Estimada",
  "Desviación Duración",
];

const DATE_FMT = "dd/mm/yyyy";
// const DATE_FMT = "yyyy-mm-dd";

function extractProcedureRows(rawResult) {
  const candidates = [...rawResult].reverse().filter(Array.isArray);

  for (const item of candidates) {
    if (Array.isArray(item[0])) {
      const maybeRows = item[0];
      if (
        maybeRows.length === 0 ||
        (typeof maybeRows[0] === "object" && !Array.isArray(maybeRows[0]))
      ) {
        return maybeRows;
      }
    }

    if (
      item.length === 0 ||
      (typeof item[0] === "object" && !Array.isArray(item[0]))
    ) {
      return item;
    }
  }

  return [];
}

function n(v) {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

function sqlDateToExcel(v) {
  if (!v) return null;

  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : v;
  }

  if (typeof v === "string") {
    const s = v.slice(0, 10);
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;

    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);

    return new Date(year, month - 1, day);
  }

  return null;
}

exports.resumen_anual_xlsx = async (req, res, next) => {
  try {
    let anno = req.params.anno;

    if (!anno) {
      return res.status(400).json({
        status: "error",
        message: 'Debe enviar "anno", por ejemplo: 2025',
      });
    }

    if (/^\d{4}$/.test(String(anno))) {
      anno = `${anno}-01-01`;
    }

    const sql_query = `
      CALL proyectos_anno(?);
      CALL resumen_anual();
    `;

    const rawResult = await new Promise((resolve, reject) => {
      conn.query(sql_query, [anno], (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    const reportRows = extractProcedureRows(rawResult);

    if (!Array.isArray(reportRows) || reportRows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No se encontraron datos para generar el resumen anual",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Detalle");

    xlsxUtils.makeColWidth(sheet, [1], 10);
    xlsxUtils.makeColWidth(sheet, [2], 28);
    xlsxUtils.makeColWidth(sheet, [3, 4], 14);
    xlsxUtils.makeColWidth(sheet, [5, 6, 7, 8, 9], 18);
    xlsxUtils.makeColWidth(sheet, [10], 12);
    xlsxUtils.makeColWidth(sheet, [11, 12, 13], 18);

    let newRow = sheet.addRow(resumen_header_row);
    xlsxUtils.makeBorder(newRow, 1, 13);
    xlsxUtils.makeFill(newRow, [1, 13], "D9D9D9");

    for (const row of reportRows) {
      const gastoReal = n(row.gasto_real);
      const presupuestoTotal = n(row.presupuesto_total);
      const presupuestoOficial = n(row.presupuesto_oficial);
      const duracionReal = n(row.duracion_real);
      const duracionEstimada = n(row.duracion_estimada);

      newRow = sheet.addRow([
        row.id,
        row.nombre,
        sqlDateToExcel(row.inicio),
        sqlDateToExcel(row.fin),
        gastoReal,
        presupuestoTotal,
        null,
        presupuestoOficial,
        null,
        null,
        duracionReal,
        duracionEstimada,
        null,
      ]);

      const r = newRow.number;

      sheet.getCell(`G${r}`).value = {
        formula: `IFERROR((E${r}-F${r})/F${r},0)`,
      };

      sheet.getCell(`I${r}`).value = {
        formula: `H${r}-E${r}`,
      };

      sheet.getCell(`J${r}`).value = {
        formula: `IFERROR(I${r}/H${r},0)`,
      };

      sheet.getCell(`M${r}`).value = {
        formula: `IFERROR((K${r}-L${r})/L${r},0)`,
      };

      xlsxUtils.makeBorder(newRow, 1, 13);

      xlsxUtils.makeFill(newRow, [1, 2, 3, 4], "F2F2F2");
      xlsxUtils.makeFill(newRow, [5, 6, 7], "FFF4AB");
      xlsxUtils.makeFill(newRow, [8, 9, 10], "CDFFBD");
      xlsxUtils.makeFill(newRow, [11, 12, 13], "C4E6FF");
    }

    sheet.getColumn(3).numFmt = DATE_FMT;
    sheet.getColumn(4).numFmt = DATE_FMT;

    [5, 6, 8, 9].forEach((col) => {
      sheet.getColumn(col).numFmt = '"$"#,##0';
    });

    sheet.getColumn(7).numFmt = "0.00%";
    sheet.getColumn(10).numFmt = "0.00%";
    sheet.getColumn(13).numFmt = "0.00%";

    sheet.getColumn(11).numFmt = "0";
    sheet.getColumn(12).numFmt = "0";

    sheet.views = [{ state: "frozen", ySplit: 1 }];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="resumen_anual.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return next(new AppError(err));
  }
};