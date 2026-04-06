const { withTransaction } = require("./dbv2");
const { read_factura_corta } = require("../excel/import/facturaCorta");
const { readSiiBuffer } = require("../csv/readers/sii_reader");
const temp = require("../repositories/index.js");
const {creat_factura_report} = require("../excel/index.js")

const CARGA_QUERY = `
  SELECT F.*, P.nombre AS proyecto, C.categoria AS categoria
  FROM tmp_facturas_carga F
  JOIN proyectos P ON F.proyecto_id = P.id
  JOIN categorias C ON F.categoria_id = C.id
`;

const NO_ENCONTRADA_QUERY = `
  SELECT F.*, P.nombre AS proyecto, C.categoria AS categoria
  FROM tmp_facturas_no_encontrada F
  JOIN proyectos P ON F.proyecto_id = P.id
  JOIN categorias C ON F.categoria_id = C.id
`;

function makeAppError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = "error";
  return err;
}

async function insertFacturasCortas(session, cortasData) {
  for (const factura of cortasData) {
    await session.query(
      "CALL insertar_factura_corta(?,?,?,?,?);",
      [
        factura.rut,
        factura.folio,
        factura.proyecto_id,
        factura.categoria_id,
        factura.fila_cortas
      ]
    );
  }
}

async function insertFacturasSii(session, siiData) {
  for (const factura of siiData) {
    await temp.insertarFacturaSII(session, factura);
  }
}

async function prepararTemporales(session) {
  await session.query("CALL crear_tmp_facturas_cortas();");
  await session.query("CALL crear_tmp_facturas_sii();");
}

async function crearResultadosTemporales(session) {
  await session.query("CALL crear_tmp_outer_join_facturas();");
  await session.query("CALL crear_tmp_facturas_carga();");
  await session.query("CALL crear_tmp_facturas_pendiente();");
  await session.query("CALL crear_tmp_facturas_no_encontrada();");
}

function normalizeFacturaError(err) {
  if (err?.sqlState === "45000") {
    throw makeAppError(err.sqlMessage || err.message, 400);
  }

  throw err;
}

const {read_factura_sii} = require("../excel/index.js")

async function buildFacturaReportBuffer(facturasEqcBuffer, facturasSiiBuffer) {
  const cortasData = await read_factura_corta(facturasEqcBuffer);
  const siiData = await read_factura_sii(facturasSiiBuffer);

  try {
    return await withTransaction(async (session) => {
      await prepararTemporales(session);

      await insertFacturasCortas(session, cortasData);
      await insertFacturasSii(session, siiData);

      await crearResultadosTemporales(session);

      await session.query("CALL tmp_facturas_carga_test();");
      await session.query("CALL insertar_factura_carga();");

      const cargaData = await session.query(CARGA_QUERY);

      await session.query("CALL filtrar_tmp_facturas_pendiente();");
      const pendienteData = await session.query(
        "SELECT * FROM tmp_facturas_pendiente"
      );

      const noEncontradaData = await session.query(NO_ENCONTRADA_QUERY);

      const workbook = creat_factura_report(
        cargaData,
        pendienteData,
        noEncontradaData
      );

      return await workbook.xlsx.writeBuffer();

    });

  } catch (err) {

    normalizeFacturaError(err);

  }
}

module.exports = {
  buildFacturaReportBuffer,
};