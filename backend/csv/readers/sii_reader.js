// readers/sii_reader.js
const { parse } = require("csv-parse/sync");


function sqlDate(s) {
  if (!s) return null;

  const parts = String(s).trim().split("/");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts;

  if (!dd || !mm || !yyyy) return null;

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function readSiiBuffer(fileBuffer) {
  const rows = parse(fileBuffer, {
    bom: true,
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    trim: true,
  });

  return rows.map((row, index) => ({
    rut: row["RUT Proveedor"] || null,
    tipo_doc: row["Tipo Doc"] || null,
    razon_social: row["Razon Social"] || null,
    folio: row["Folio"] || null,
    fecha: sqlDate(row["Fecha Docto"]) || null,
    valor:
      row["Monto Total"] === undefined ||
      row["Monto Total"] === null ||
      row["Monto Total"] === ""
        ? null
        : Number(row["Monto Total"]),
    fila_sii: index + 2,
  }));
}

module.exports = {
  readSiiBuffer,
};