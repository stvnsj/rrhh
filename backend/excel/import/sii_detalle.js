const readXlsxFile = require("read-excel-file/node");
const toSqlDateOnly = require("../../utils/sqlDate")
const { RutFun } = require("../../utils/utils");

const schema = {
  "Tipo Doc":      { prop: "tipo_doc",     type: Number, required: true },
  "RUT Proveedor": { prop: "rut",          type: String, required: true },
  "Razon Social":  { prop: "razon_social", type: String, required: true },
  "Folio":         { prop: "folio",        type: String, required: true },
  "Fecha Docto":   { prop: "fecha",        type: Date,   required: true },
  "Monto Total":   { prop: "valor",        type: Number, required: true }
};

function formatSchemaError(error, sheetName) {
  const value =
    error.value === undefined ? "undefined" : JSON.stringify(error.value);

  const reason = error.reason ? ` (${error.reason})` : "";

  return `Hoja "${sheetName}", fila ${error.row}, columna "${error.column}": ${error.error}${reason}. Valor: ${value}`;
}

async function read_factura_sii(file) {
  const sheetNames = await readXlsxFile.readSheetNames(file);
  const result = [];

  for (const sheetName of sheetNames) {
    const { rows, errors } = await readXlsxFile(file, {
      sheet: sheetName,
      schema,
      ignoreEmptyRows: true,
      includeNullValues: true,
    });

    if (errors && errors.length > 0) {
      throw new Error(errors.map((e) => formatSchemaError(e, sheetName)).join("\n"));
    }

    const parsedRows = rows.map((factura, index) => ({
      ...factura,
    fecha: toSqlDateOnly(factura.fecha),
      hoja: sheetName,
      fila_sii: index + 2,
    }));

    for (const factura of parsedRows) {
      if (!RutFun.validaRut(String(factura.rut))) {
        throw new Error(
          `Hoja "${sheetName}", fila ${factura.fila_sii}: RUT inválido: ${factura.rut}`
        );
      }
    }

    result.push(...parsedRows);
  }

  return result;
}

module.exports = {
  read_factura_sii,
};