const ExcelJS = require("exceljs");
const { writeTableSheet } = require("../sheets/writeTableSheet");

exports.creat_factura_report = (
  carga_data,
  pendiente_data,
  no_encontrada_data
) => {
  const workbook = new ExcelJS.Workbook();

  writeTableSheet(workbook, {
    name: "Cargadas",
    columns: [
      { header: "Rut", key: "rut", width: 18 },
      { header: "Folio", key: "folio", width: 14 },
      { header: "Fecha", key: "fecha", width: 14, kind: "date" },
      { header: "Valor", key: "valor", width: 14, kind: "money" },
      { header: "Razón Social", key: "razon_social", width: 28 },
      { header: "Proyecto", key: "proyecto", width: 24 },
      { header: "Categoria", key: "categoria", width: 20 },
      { header: "Tipo Documento", key: "tipo_documento", width: 16 },
    ],
    rows: carga_data,
    rowStyle: "success",
  });

  writeTableSheet(workbook, {
    name: "Pendientes",
    columns: [
      { header: "Rut", key: "rut", width: 18 },
      { header: "Folio", key: "folio", width: 14 },
      { header: "Fecha", key: "fecha", width: 14, kind: "date" },
      { header: "Valor", key: "valor", width: 14, kind: "money" },
      { header: "Razón Social", key: "razon_social", width: 28 },
      { header: "Tipo Documento", key: "tipo_documento", width: 16 },
      { header: "Fila", key: "fila_sii", width: 10},
      { header: "Hoja", key: "hoja", width: 23}
    ],
    rows: pendiente_data,
    rowStyle: "warning",
  });

  writeTableSheet(workbook, {
    name: "No Encontradas",
    columns: [
      { header: "Rut", key: "rut", width: 18 },
      { header: "Folio", key: "folio", width: 14 },
      { header: "Proyecto", key: "proyecto", width: 24 },
      { header: "Categoría", key: "categoria", width: 20 },
      { header: "Fila", key: "fila_cortas"}
    ],
    rows: no_encontrada_data,
    rowStyle: "error",
  });

  return workbook;
};


